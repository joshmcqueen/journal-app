import { useMonthEntries } from '../hooks/useMonthEntries';

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function localTodayMonth(): string {
  return localToday().slice(0, 7);
}

function addMonths(yearMonth: string, delta: number): string {
  const [y, m] = yearMonth.split('-').map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthTitle(yearMonth: string): string {
  const [y, m] = yearMonth.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Props {
  yearMonth: string;
  onYearMonthChange: (yearMonth: string) => void;
  onSelectDate: (date: string) => void;
}

export default function CalendarView({ yearMonth, onYearMonthChange, onSelectDate }: Props) {
  const { dates, loading } = useMonthEntries(yearMonth);
  const today = localToday();
  const currentMonth = localTodayMonth();

  const [y, m] = yearMonth.split('-').map(Number);
  const firstDay = new Date(y, m - 1, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(y, m, 0).getDate();

  // Build grid cells: nulls for leading blanks, then day numbers
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function dayToDate(day: number): string {
    return `${yearMonth}-${String(day).padStart(2, '0')}`;
  }

  return (
    <div className="calendar-wrapper">
      <div className="calendar-nav">
        <button
          className="btn calendar-nav-btn"
          onClick={() => onYearMonthChange(addMonths(yearMonth, -1))}
          aria-label="Previous month"
        >
          ‹
        </button>
        <span className="calendar-month-title">{formatMonthTitle(yearMonth)}</span>
        <button
          className="btn calendar-nav-btn"
          onClick={() => onYearMonthChange(addMonths(yearMonth, 1))}
          disabled={yearMonth >= currentMonth}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="calendar-grid" role="grid">
        {DAY_HEADERS.map((h) => (
          <div key={h} className="calendar-day-header">{h}</div>
        ))}

        {loading
          ? Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="calendar-day calendar-day-skeleton" />
            ))
          : cells.map((day, i) => {
              if (day === null) {
                return <div key={`blank-${i}`} className="calendar-day calendar-day-empty" />;
              }
              const dateStr = dayToDate(day);
              const hasEntry = dates.has(dateStr);
              const isToday = dateStr === today;

              return (
                <button
                  key={dateStr}
                  className={`calendar-day${hasEntry ? ' has-entry' : ''}${isToday ? ' today' : ''}`}
                  onClick={() => onSelectDate(dateStr)}
                  aria-label={dateStr}
                >
                  <span className="calendar-day-num">{day}</span>
                  {hasEntry && <span className="calendar-entry-dot" aria-hidden="true" />}
                </button>
              );
            })}
      </div>
    </div>
  );
}
