import { useState } from 'react';
import { BookIcon, CalendarIcon, TimelineIcon, PlusIcon } from './components/Icons';
import CalendarView from './components/CalendarView';
import JournalEditor from './components/JournalEditor';
import { useMonthEntries } from './hooks/useMonthEntries';

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function localTodayMonth(): string {
  return localToday().slice(0, 7);
}

export default function App() {
  const [view, setView] = useState<'calendar' | 'editor'>('calendar');
  const [layout, setLayout] = useState<'grid' | 'timeline'>('grid');
  const [selectedDate, setSelectedDate] = useState(localToday);
  const [calendarMonth, setCalendarMonth] = useState(localTodayMonth);

  const { entries, streak } = useMonthEntries(selectedDate.slice(0, 7));

  const sortedEntryDates = Array.from(entries.keys()).sort();
  const selectedIdx = sortedEntryDates.indexOf(selectedDate);
  const prevDate = selectedIdx > 0 ? sortedEntryDates[selectedIdx - 1] : null;
  const nextDate = selectedIdx < sortedEntryDates.length - 1 ? sortedEntryDates[selectedIdx + 1] : null;

  function openEntry(date: string) {
    setSelectedDate(date);
    setView('editor');
  }

  function goToCalendar() {
    setCalendarMonth(selectedDate.slice(0, 7));
    setView('calendar');
  }

  function openToday() {
    const today = localToday();
    setSelectedDate(today);
    setCalendarMonth(today.slice(0, 7));
    setView('editor');
  }

  return (
    <main style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      {view === 'calendar' ? (
        <>
          <header className="app-header">
            <BookIcon size={22} />
            <h1 className="app-header-title">Josh's Journal</h1>
            <div className="app-header-actions">
              <button
                className="icon-btn"
                onClick={() => setLayout(l => l === 'grid' ? 'timeline' : 'grid')}
                aria-label={layout === 'grid' ? 'Switch to timeline' : 'Switch to grid'}
              >
                {layout === 'grid' ? <TimelineIcon /> : <CalendarIcon />}
              </button>
              <button className="icon-btn icon-btn-accent" onClick={openToday} aria-label="New entry">
                <PlusIcon />
              </button>
            </div>
          </header>
          <CalendarView
            yearMonth={calendarMonth}
            onYearMonthChange={setCalendarMonth}
            onSelectDate={openEntry}
            layout={layout}
          />
        </>
      ) : (
        <JournalEditor
          date={selectedDate}
          onBack={goToCalendar}
          onNavigate={openEntry}
          prevDate={prevDate}
          nextDate={nextDate}
          streak={streak}
        />
      )}
    </main>
  );
}
