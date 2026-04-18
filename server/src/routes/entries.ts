import { Router } from 'express';
import { getEntry, saveEntry, getMonthEntries } from '../services/sheets.js';

const router = Router();

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_RE = /^\d{4}-\d{2}$/;

router.get('/month/:yearMonth', async (req, res) => {
  const yearMonth = req.params['yearMonth'] as string;
  if (!MONTH_RE.test(yearMonth)) {
    res.status(400).json({ error: 'Invalid month format. Use YYYY-MM.' });
    return;
  }
  try {
    const entries = await getMonthEntries(yearMonth);
    res.json({ entries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch month entries.' });
  }
});

router.get('/:date', async (req, res) => {
  const date = req.params['date'] as string;
  if (!DATE_RE.test(date)) {
    res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
    return;
  }
  try {
    const notes = await getEntry(date);
    res.json({ date, notes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch entry.' });
  }
});

router.put('/:date', async (req, res) => {
  const date = req.params['date'] as string;
  if (!DATE_RE.test(date)) {
    res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
    return;
  }
  const { notes } = req.body as { notes: unknown };
  if (typeof notes !== 'string') {
    res.status(400).json({ error: 'Body must include a notes string.' });
    return;
  }
  try {
    await saveEntry(date, notes);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save entry.' });
  }
});

export default router;
