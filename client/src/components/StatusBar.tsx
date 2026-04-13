interface StatusBarProps {
  status: 'idle' | 'loading' | 'saving' | 'success' | 'error';
  error: string | null;
}

const messages: Record<string, string> = {
  loading: 'Loading…',
  saving: 'Saving…',
  success: 'Saved!',
  error: '',
  idle: '',
};

export default function StatusBar({ status, error }: StatusBarProps) {
  const text = status === 'error' ? (error ?? 'An error occurred.') : messages[status];
  if (!text) return <div className="status-bar" />;
  return <div className={`status-bar ${status}`}>{text}</div>;
}
