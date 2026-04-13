import { useCompletion } from 'ai/react';
import { useJournalEntry } from '../hooks/useJournalEntry';
import StatusBar from './StatusBar';

interface JournalEditorProps {
  date: string;
}

export default function JournalEditor({ date }: JournalEditorProps) {
  const { notes, setNotes, isLoading, isSaving, save, error, status } = useJournalEntry(date);

  const { complete, isLoading: isPolishing } = useCompletion({
    api: '/api/polish',
    onFinish: (_prompt, completion) => {
      setNotes(completion);
    },
  });

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
          className="btn"
          onClick={() => complete(notes)}
          disabled={busy || !notes.trim()}
        >
          {isPolishing ? 'Polishing…' : '✨ Polish with AI'}
        </button>
      </div>
      <StatusBar status={isPolishing ? 'loading' : status} error={error} />
    </div>
  );
}
