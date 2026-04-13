import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const auth = new google.auth.GoogleAuth({
  keyFile: path.resolve(__dirname, '../../../', config.GOOGLE_SERVICE_ACCOUNT_KEY_PATH),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const sheetId = config.GOOGLE_SHEET_ID;

// Memoize which year tabs have been confirmed to exist
const confirmedYears = new Set<string>();

async function ensureYearTabExists(year: string): Promise<void> {
  if (confirmedYears.has(year)) return;

  const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
  const existing = meta.data.sheets?.map((s) => s.properties?.title) ?? [];

  if (!existing.includes(year)) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: year } } }],
      },
    });
  }

  confirmedYears.add(year);
}

// Normalize any date format (M/D/YYYY, MM/DD/YYYY, YYYY-MM-DD) -> YYYY-MM-DD
function normalizeDate(cellValue: string): string {
  if (!cellValue) return '';
  const slashParts = cellValue.split('/');
  if (slashParts.length === 3) {
    const [m, d, y] = slashParts;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return cellValue; // already YYYY-MM-DD or unrecognized
}

export async function getEntry(date: string): Promise<string> {
  const year = date.split('-')[0];
  await ensureYearTabExists(year);

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${year}!A:B`,
  });

  const rows = res.data.values ?? [];
  const row = rows.find((r) => normalizeDate(String(r[0] ?? '')) === date);
  return row?.[1] ?? '';
}

export async function saveEntry(date: string, notes: string): Promise<void> {
  const year = date.split('-')[0];
  await ensureYearTabExists(year);

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${year}!A:B`,
  });

  const rows = res.data.values ?? [];
  const rowIndex = rows.findIndex((r) => normalizeDate(String(r[0] ?? '')) === date);

  if (rowIndex !== -1) {
    // Row exists — update only the Notes column (B), preserve the original date format in A
    const sheetRow = rowIndex + 1;
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${year}!B${sheetRow}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[notes]] },
    });
  } else {
    // New entry — append in M/D/YYYY format to match existing sheet style
    const [y, m, d] = date.split('-');
    const sheetDate = `${parseInt(m)}/${parseInt(d)}/${y}`;
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${year}!A:B`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [[sheetDate, notes]] },
    });
  }
}
