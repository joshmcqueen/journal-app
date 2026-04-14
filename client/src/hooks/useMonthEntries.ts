import { useState, useEffect } from 'react';

export function useMonthEntries(yearMonth: string): { dates: Set<string>; loading: boolean } {
  const [dates, setDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/entries/month/${yearMonth}`)
      .then((r) => r.json())
      .then((data: { dates: string[] }) => {
        if (!cancelled) {
          setDates(new Set(data.dates));
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [yearMonth]);

  return { dates, loading };
}
