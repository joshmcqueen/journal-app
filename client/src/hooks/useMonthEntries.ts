import { useState, useEffect } from 'react';

export interface EntryMeta {
  wordCount: number;
  preview: string;
}

function toYYYYMMDD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export interface MonthData {
  entries: Map<string, EntryMeta>;
  loading: boolean;
  totalWords: number;
  streak: number;
  longestEntry: number;
}

export function useMonthEntries(yearMonth: string): MonthData {
  const [entries, setEntries] = useState<Map<string, EntryMeta>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/entries/month/${yearMonth}`)
      .then((r) => r.json())
      .then((data: { entries: { date: string; wordCount: number; preview: string }[] }) => {
        if (!cancelled) {
          const map = new Map<string, EntryMeta>();
          for (const e of data.entries ?? []) {
            map.set(e.date, { wordCount: e.wordCount, preview: e.preview });
          }
          setEntries(map);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [yearMonth]);

  const totalWords = Array.from(entries.values()).reduce((s, e) => s + e.wordCount, 0);
  const longestEntry = Array.from(entries.values()).reduce((m, e) => Math.max(m, e.wordCount), 0);

  // Longest consecutive run of days with entries within this month
  const sorted = Array.from(entries.keys()).sort();
  let streak = sorted.length > 0 ? 1 : 0;
  let current = sorted.length > 0 ? 1 : 0;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + 'T00:00:00');
    const curr = new Date(sorted[i] + 'T00:00:00');
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    current = diffDays === 1 ? current + 1 : 1;
    if (current > streak) streak = current;
  }

  return { entries, loading, totalWords, streak, longestEntry };
}
