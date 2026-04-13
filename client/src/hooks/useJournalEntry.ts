import { useState, useEffect, useCallback } from 'react';

interface UseJournalEntryResult {
  notes: string;
  setNotes: (notes: string) => void;
  isLoading: boolean;
  isSaving: boolean;
  save: () => Promise<void>;
  error: string | null;
  status: 'idle' | 'loading' | 'saving' | 'success' | 'error';
}

export function useJournalEntry(date: string): UseJournalEntryResult {
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'saving' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    setStatus('loading');
    setError(null);

    fetch(`/api/entries/${date}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!cancelled) {
          setNotes(data.notes ?? '');
          setStatus('idle');
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(String(err.message));
          setStatus('error');
        }
      });

    return () => { cancelled = true; };
  }, [date]);

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
  };
}
