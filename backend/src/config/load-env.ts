import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadEnvFile } from 'node:process';

const candidates = [
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), 'backend/.env'),
  resolve(__dirname, '../../.env'),
  resolve(__dirname, '../../../backend/.env'),
];

for (const candidate of candidates) {
  if (existsSync(candidate)) {
    loadEnvFile(candidate);
    break;
  }
}
