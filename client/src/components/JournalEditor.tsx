import { useState, useEffect, useRef } from 'react';
import { useJournalEntry } from '../hooks/useJournalEntry';
import { ChevronLeftIcon, ChevronRightIcon, SparkleIcon } from './Icons';
import MoonIcon from './MoonIcon';
import { getMoonPhase } from '../utils/moonPhase';

interface Props {
  date: string;
  onBack: () => void;
  onNavigate: (date: string) => void;
  prevDate: string | null;
  nextDate: string | null;
  streak: number;
}

function formatDateChip(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function getMonthLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long' });
}

export default function JournalEditor({ date, onBack, onNavigate, prevDate, nextDate, streak }: Props) {
  const { notes, setNotes, isLoading, isSaving, save, wordCount, savedLabel } = useJournalEntry(date);
  const [polishState, setPolishState] = useState<'idle' | 'polishing' | 'polished'>('idle');
  const polishedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (polishedTimer.current) clearTimeout(polishedTimer.current); }, []);

  const polish = async () => {
    if (polishState !== 'idle') return;
    setPolishState('polishing');
    try {
      const res = await fetch('/api/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: notes }),
      });
      const data = await res.json();
      if (res.ok) setNotes(data.text);
    } finally {
      setPolishState('polished');
      polishedTimer.current = setTimeout(() => setPolishState('idle'), 1800);
    }
  };

  const busy = isLoading || isSaving || polishState === 'polishing';

  return (
    <div className="view-fade" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div className="entry-header">
        <button className="entry-header-back" onClick={onBack}>
          <ChevronLeftIcon size={18} />
          {getMonthLabel(date)}
        </button>
        <div className="entry-header-nav">
          <button
            className="icon-btn"
            onClick={() => prevDate && onNavigate(prevDate)}
            disabled={!prevDate}
            aria-label="Previous entry"
          >
            <ChevronLeftIcon />
          </button>
          <button
            className="icon-btn"
            onClick={() => nextDate && onNavigate(nextDate)}
            disabled={!nextDate}
            aria-label="Next entry"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      <div className="date-chip">
        <MoonIcon phase={getMoonPhase(date)} size={14} />
        <span>{formatDateChip(date)}</span>
        {streak > 0 && (
          <>
            <span className="date-chip-sep">·</span>
            <span className="date-chip-streak">Day {streak} of streak</span>
          </>
        )}
      </div>

      <textarea
        className="journal-textarea"
        style={{ flex: 1 }}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        disabled={busy}
        placeholder="Write anything…"
      />

      <div className="bottom-dock">
        <div className="bottom-dock-meta">
          <span>{wordCount > 0 ? `${wordCount} WORDS` : ''}</span>
          <span>{savedLabel}</span>
        </div>
        <div className="bottom-dock-btns">
          <button className="btn-save" onClick={save} disabled={busy}>
            {isSaving ? 'Saving…' : 'Save'}
          </button>
          <button
            className={`btn-polish${polishState === 'polished' ? ' polished' : ''}`}
            onClick={polish}
            disabled={busy || !notes.trim()}
          >
            {polishState === 'polishing' && <span className="shimmer-overlay" />}
            <SparkleIcon />
            {polishState === 'polishing' ? 'Polishing…' : polishState === 'polished' ? 'Polished' : 'Polish with AI'}
          </button>
        </div>
      </div>
    </div>
  );
}
