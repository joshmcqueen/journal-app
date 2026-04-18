import { useState, useEffect, useCallback, useRef } from 'react';

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function savedLabel(savedAt: Date | null): string {
  if (!savedAt) return '';
  const mins = Math.floor((Date.now() - savedAt.getTime()) / 60000);
  if (mins < 1) return 'SAVED JUST NOW';
  if (mins === 1) return 'SAVED 1M AGO';
  return `SAVED ${mins}M AGO`;
}

export interface UseJournalEntryResult {
  notes: string;
  setNotes: (notes: string) => void;
  isLoading: boolean;
  isSaving: boolean;
  save: () => Promise<void>;
  error: string | null;
  status: 'idle' | 'loading' | 'saving' | 'success' | 'error';
  wordCount: number;
  savedLabel: string;
}

export function useJournalEntry(date: string): UseJournalEntryResult {
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'saving' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [, forceUpdate] = useState(0);
  const labelTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    setStatus('loading');
    setError(null);
    setLastSavedAt(null);

    fetch(`/api/entries/${date}`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((data) => {
        if (!cancelled) { setNotes(data.notes ?? ''); setStatus('idle'); }
      })
      .catch((err) => {
        if (!cancelled) { setError(String(err.message)); setStatus('error'); }
      });

    return () => { cancelled = true; };
  }, [date]);

  // Tick label every minute so "SAVED Xm AGO" stays fresh
  useEffect(() => {
    labelTimer.current = setInterval(() => forceUpdate((n) => n + 1), 60000);
    return () => { if (labelTimer.current) clearInterval(labelTimer.current); };
  }, []);

  const save = useCallback(async () => {
    setStatus('saving');
    setError(null);
    try {
      const res = await fetch(`/api/entries/${date}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setLastSavedAt(new Date());
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setStatus('error');
    }
  }, [date, notes]);

  return {
    notes,
    setNotes,
    isLoading: status === 'loading',
    isSaving: status === 'saving',
    save,
    error,
    status,
    wordCount: countWords(notes),
    savedLabel: savedLabel(lastSavedAt),
  };
}
