import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function required(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required environment variable: ${name}`);
  return val;
}

export const config = {
  ANTHROPIC_API_KEY: required('ANTHROPIC_API_KEY'),
  GOOGLE_SHEET_ID: required('GOOGLE_SHEET_ID'),
  GOOGLE_SERVICE_ACCOUNT_KEY_PATH: required('GOOGLE_SERVICE_ACCOUNT_KEY_PATH'),
  PORT: parseInt(process.env.PORT ?? '3001', 10),
};
