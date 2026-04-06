import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { Client } from 'pg';

const WINDOWS_BINARIES = new Set(['npm', 'npx']);

function resolveCommand(command) {
  return process.platform === 'win32' && WINDOWS_BINARIES.has(command)
    ? `${command}.cmd`
    : command;
}

function run(command, args, options = {}) {
  const result = spawnSync(resolveCommand(command), args, {
    stdio: 'inherit',
    env: process.env,
    ...options,
  });

  if (result.error) {
    throw result.error;
  }

  return result.status ?? 1;
}

async function syncLegacyUserSchema() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    const tableResult = await client.query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'User'
      ) AS exists
    `);

    if (!tableResult.rows[0]?.exists) {
      return false;
    }

    const columnResult = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'User'
    `);

    const columns = new Set(columnResult.rows.map((row) => row.column_name));
    const hasLegacyName = columns.has('name');
    const hasSplitName = columns.has('firstName') && columns.has('lastName');

    if (!hasLegacyName && hasSplitName) {
      return true;
    }

    if (!hasLegacyName) {
      return false;
    }

    await client.query('BEGIN');

    await client.query(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "firstName" TEXT;
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastName" TEXT;

      UPDATE "User"
      SET
        "firstName" = COALESCE(
          NULLIF("firstName", ''),
          CASE
            WHEN position(' ' IN "name") > 0 THEN left("name", position(' ' IN "name") - 1)
            ELSE "name"
          END
        ),
        "lastName" = COALESCE(
          NULLIF("lastName", ''),
          CASE
            WHEN position(' ' IN "name") > 0 THEN substring("name" FROM position(' ' IN "name") + 1)
            ELSE ''
          END
        );

      UPDATE "User" SET "firstName" = '' WHERE "firstName" IS NULL;
      UPDATE "User" SET "lastName" = '' WHERE "lastName" IS NULL;

      ALTER TABLE "User" ALTER COLUMN "firstName" SET NOT NULL;
      ALTER TABLE "User" ALTER COLUMN "lastName" SET NOT NULL;

      ALTER TABLE "User" DROP COLUMN IF EXISTS "name";
      DROP INDEX IF EXISTS "User_studentId_key";
      ALTER TABLE "User" DROP COLUMN IF EXISTS "studentId";
    `);

    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

async function main() {
  if (run('npm', ['install']) !== 0) {
    process.exit(1);
  }

  if (run('npx', ['prisma', 'generate']) !== 0) {
    process.exit(1);
  }

  const migrateStatus = run('npx', ['prisma', 'migrate', 'deploy']);

  if (migrateStatus !== 0) {
    console.log('Prisma migrate deploy failed. Falling back to local dev schema sync.');

    const schemaIsRecoverable = await syncLegacyUserSchema();

    if (!schemaIsRecoverable) {
      process.exit(migrateStatus);
    }

    if (run('npx', ['prisma', 'db', 'push', '--accept-data-loss']) !== 0) {
      process.exit(1);
    }
  }

  if (run('npm', ['run', 'db:seed']) !== 0) {
    process.exit(1);
  }

  process.exit(run('npm', ['run', 'start:dev']));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
