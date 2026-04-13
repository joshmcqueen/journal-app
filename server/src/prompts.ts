import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

function loadPrompt(name: string): string {
  const dir = path.dirname(fileURLToPath(import.meta.url));
  return fs.readFileSync(path.resolve(dir, '../prompts', name), 'utf8').trim();
}

export const POLISH_SYSTEM_PROMPT = loadPrompt('polish.txt');
