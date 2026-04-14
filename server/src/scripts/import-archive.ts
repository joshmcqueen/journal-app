import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import { generateText } from 'ai';
import { anthropic } from '../services/ai.js';
import { config } from '../config.js';
import { getEntry, saveEntry } from '../services/sheets.js';
import { POLISH_SYSTEM_PROMPT } from '../prompts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../');

interface CsvRow {
  Date: string;
  Notes: string;
}

function toISODate(raw: string): string {
  const d = new Date(raw);
  return d.toISOString().split('T')[0];
}

function truncate(str: string, len = 80): string {
  return str.length > len ? str.slice(0, len) + '...' : str;
}

async function main() {
  const csvFiles = fs
    .readdirSync(ROOT)
    .filter((f) => f.endsWith('.csv'))
    .sort();

  console.log(`Found CSV files: ${csvFiles.join(', ')}\n`);

  // Collect all entries with notes across all CSVs
  const allEntries: { isoDate: string; rawNotes: string }[] = [];

  for (const file of csvFiles) {
    const csv = fs.readFileSync(path.join(ROOT, file), 'utf8');
    const rows: CsvRow[] = parse(csv, {
      columns: true,
      skip_empty_lines: false,
      relax_column_count: true,
    });
    const withNotes = rows.filter((r) => r.Notes && r.Notes.trim());
    for (const row of withNotes) {
      allEntries.push({ isoDate: toISODate(row.Date), rawNotes: row.Notes.trim() });
    }
  }

  // Sort chronologically
  allEntries.sort((a, b) => a.isoDate.localeCompare(b.isoDate));

  console.log(`Total entries with notes: ${allEntries.length}\n`);

  let imported = 0;
  let skipped = 0;

  for (let i = 0; i < allEntries.length; i++) {
    const { isoDate, rawNotes } = allEntries[i];

    const existing = await getEntry(isoDate);
    if (existing) {
      console.log(`[${i + 1}/${allEntries.length}] ${isoDate} — Already exists, skipping.`);
      skipped++;
      continue;
    }

    console.log(`[${i + 1}/${allEntries.length}] ${isoDate} — Polishing...`);
    console.log(`  Before: "${truncate(rawNotes)}"`);

    const { text: polished } = await generateText({
      model: anthropic(config.CLAUDE_MODEL),
      system: POLISH_SYSTEM_PROMPT,
      prompt: rawNotes,
    });

    console.log(`  After:  "${truncate(polished.trim())}"`);

    await saveEntry(isoDate, polished.trim());
    console.log(`  Saved. ✓\n`);
    imported++;

    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log(`\nDone! Imported: ${imported}, Skipped (already existed): ${skipped}`);
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
