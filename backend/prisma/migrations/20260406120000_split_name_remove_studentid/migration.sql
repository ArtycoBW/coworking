-- Add new columns with temporary defaults
ALTER TABLE "User" ADD COLUMN "firstName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN "lastName" TEXT NOT NULL DEFAULT '';

-- Migrate existing data: split name by first space
UPDATE "User"
SET
  "firstName" = CASE
    WHEN position(' ' IN "name") > 0 THEN left("name", position(' ' IN "name") - 1)
    ELSE "name"
  END,
  "lastName" = CASE
    WHEN position(' ' IN "name") > 0 THEN substring("name" FROM position(' ' IN "name") + 1)
    ELSE ''
  END;

-- Remove temporary defaults
ALTER TABLE "User" ALTER COLUMN "firstName" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "lastName" DROP DEFAULT;

-- Drop old columns
ALTER TABLE "User" DROP COLUMN "name";
DROP INDEX IF EXISTS "User_studentId_key";
ALTER TABLE "User" DROP COLUMN IF EXISTS "studentId";
