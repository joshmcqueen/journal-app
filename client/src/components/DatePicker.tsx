interface DatePickerProps {
  date: string;
  onChange: (date: string) => void;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00'); // noon to avoid DST edge cases
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function dayOfWeek(dateStr: string): string {
  return DAYS[new Date(dateStr + 'T12:00:00').getDay()];
}

export default function DatePicker({ date, onChange }: DatePickerProps) {
  const today = localToday();
  const isToday = date >= today;

  return (
    <div className="date-controls">
      <button onClick={() => onChange(addDays(date, -1))} aria-label="Previous day">
        ‹
      </button>
      <input
        type="date"
        value={date}
        max={today}
        onChange={(e) => e.target.value && onChange(e.target.value)}
      />
      <span className="date-day">{dayOfWeek(date)}</span>
      <button onClick={() => onChange(addDays(date, 1))} disabled={isToday} aria-label="Next day">
        ›
      </button>
    </div>
  );
}
