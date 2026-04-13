import { useState } from 'react';
import { useJournalEntry } from '../hooks/useJournalEntry';
import StatusBar from './StatusBar';

interface JournalEditorProps {
  date: string;
}

export default function JournalEditor({ date }: JournalEditorProps) {
  const { notes, setNotes, isLoading, isSaving, save, error, status } = useJournalEntry(date);
  const [isPolishing, setIsPolishing] = useState(false);

  const polish = async () => {
    setIsPolishing(true);
    try {
      const res = await fetch('/api/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: notes }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotes(data.text);
      }
    } finally {
      setIsPolishing(false);
    }
  };

  const busy = isLoading || isSaving || isPolishing;

  return (
    <div>
      <textarea
        className="journal-textarea"
        value={isPolishing ? '✨ Polishing…' : notes}
        onChange={(e) => setNotes(e.target.value)}
        disabled={busy}
        placeholder="Write anything…"
      />
      <div className="button-row">
        <button className="btn btn-primary" onClick={save} disabled={busy}>
          {isSaving ? 'Saving…' : 'Save'}
        </button>
        <button
          className="btn btn-ai"
          onClick={polish}
          disabled={busy || !notes.trim()}
        >
          {isPolishing ? 'Polishing…' : '✨ Polish with AI'}
        </button>
      </div>
      <StatusBar status={isPolishing ? 'loading' : status} error={error} />
    </div>
  );
}
