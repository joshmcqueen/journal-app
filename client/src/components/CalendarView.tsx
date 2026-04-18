import { useMonthEntries } from '../hooks/useMonthEntries';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

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

function getMonthName(yearMonth: string): string {
  const [y, m] = yearMonth.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long' });
}

function getDayOfWeek(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
}

const DAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface Props {
  yearMonth: string;
  onYearMonthChange: (ym: string) => void;
  onSelectDate: (date: string) => void;
  layout: 'grid' | 'timeline';
}

export default function CalendarView({ yearMonth, onYearMonthChange, onSelectDate, layout }: Props) {
  const { entries, loading, totalWords, streak, longestEntry } = useMonthEntries(yearMonth);
  const today = localToday();
  const currentMonth = localTodayMonth();

  const [y, m] = yearMonth.split('-').map(Number);
  const firstDay = new Date(y, m - 1, 1).getDay();
  const daysInMonth = new Date(y, m, 0).getDate();
  const entryCount = entries.size;

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function dayToDate(day: number): string {
    return `${yearMonth}-${String(day).padStart(2, '0')}`;
  }

  const subtitle = `${y} · ${entryCount} ${entryCount === 1 ? 'entry' : 'entries'}`;

  const monthNav = (
    <div className="cal-nav">
      <div className="cal-nav-title">
        <h2>{getMonthName(yearMonth)}</h2>
        {!loading && <p>{subtitle}</p>}
      </div>
      <div className="cal-nav-arrows">
        <button
          className="icon-btn"
          onClick={() => onYearMonthChange(addMonths(yearMonth, -1))}
          aria-label="Previous month"
        >
          <ChevronLeftIcon />
        </button>
        <button
          className="icon-btn"
          onClick={() => onYearMonthChange(addMonths(yearMonth, 1))}
          disabled={yearMonth >= currentMonth}
          aria-label="Next month"
        >
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );

  const statsCard = !loading && (
    <div className="stats-card">
      <div className="stats-card-header">
        <span className="stats-card-label">This Month</span>
        {streak > 0 && <span className="stats-card-streak">{streak} day streak</span>}
      </div>
      <div className="stats-card-cols">
        <div className="stats-col">
          <span className="stats-col-label">Entries</span>
          <span className="stats-col-value">{entryCount}</span>
        </div>
        <div className="stats-col">
          <span className="stats-col-label">Words</span>
          <span className="stats-col-value">{totalWords.toLocaleString()}</span>
        </div>
        <div className="stats-col">
          <span className="stats-col-label">Longest</span>
          <span className={`stats-col-value${longestEntry > 0 ? ' accent' : ''}`}>{longestEntry}</span>
        </div>
      </div>
    </div>
  );

  if (layout === 'timeline') {
    const entryDays = Array.from(entries.keys()).sort((a, b) => b.localeCompare(a));
    return (
      <div className="view-fade">
        <div className="calendar-wrapper" style={{ paddingBottom: 0 }}>
          {monthNav}
        </div>
        <div className="timeline-wrapper">
          <div className="timeline-spine" />
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="timeline-entry">
                  <div className="timeline-gutter" />
                  <div className="timeline-card calendar-day-skeleton" style={{ height: 72, border: 'none' }} />
                </div>
              ))
            : entryDays.map((dateStr) => {
                const meta = entries.get(dateStr)!;
                const day = parseInt(dateStr.split('-')[2], 10);
                const isToday = dateStr === today;
                const wday = getDayOfWeek(dateStr);
                return (
                  <div key={dateStr} className="timeline-entry">
                    <div className="timeline-gutter">
                      <span className={`timeline-day-num${isToday ? ' accent' : ''}`}>{day}</span>
                      <span className="timeline-day-wday">{wday.slice(0, 3)}</span>
                    </div>
                    <div className={`timeline-dot${isToday ? ' accent' : ''}`} />
                    <button className="timeline-card" onClick={() => onSelectDate(dateStr)}>
                      <div className="timeline-card-meta">
                        <span className="timeline-card-wday">{wday}</span>
                        <span className="timeline-card-wc">{meta.wordCount} words</span>
                      </div>
                      <p className="timeline-card-preview">{meta.preview}</p>
                    </button>
                  </div>
                );
              })}
        </div>
        <div style={{ padding: '0 20px' }}>{statsCard}</div>
      </div>
    );
  }

  return (
    <div className="calendar-wrapper view-fade">
      {monthNav}
      <div className="calendar-grid" role="grid">
        {DAY_HEADERS.map((h, i) => (
          <div key={i} className="calendar-day-header">{h}</div>
        ))}
        {loading
          ? Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="calendar-day-skeleton" />
            ))
          : cells.map((day, i) => {
              if (day === null) return <div key={`blank-${i}`} />;
              const dateStr = dayToDate(day);
              const hasEntry = entries.has(dateStr);
              const isToday = dateStr === today;
              return (
                <button
                  key={dateStr}
                  className={`calendar-day${hasEntry ? ' has-entry' : ''}${isToday ? ' today' : ''}`}
                  onClick={() => onSelectDate(dateStr)}
                  aria-label={dateStr}
                >
                  <span className="calendar-day-num">{day}</span>
                  {(hasEntry || isToday) && <span className="calendar-entry-dot" />}
                </button>
              );
            })}
      </div>
      {statsCard}
    </div>
  );
}
