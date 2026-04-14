import { useState } from 'react';
import DatePicker from './components/DatePicker';
import JournalEditor from './components/JournalEditor';
import CalendarView from './components/CalendarView';

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function localTodayMonth(): string {
  return localToday().slice(0, 7);
}

function BookIcon() {
  return (
    <svg className="book-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

export default function App() {
  const [view, setView] = useState<'calendar' | 'editor'>('calendar');
  const [selectedDate, setSelectedDate] = useState(localToday);
  const [calendarMonth, setCalendarMonth] = useState(localTodayMonth);

  function openEntry(date: string) {
    setSelectedDate(date);
    setView('editor');
  }

  function goToCalendar() {
    setCalendarMonth(selectedDate.slice(0, 7));
    setView('calendar');
  }

  return (
    <main>
      <header className="app-header">
        <BookIcon />
        <h1>Josh's Journal</h1>
        {view === 'editor' && (
          <button className="btn btn-back" onClick={goToCalendar}>
            ← Calendar
          </button>
        )}
      </header>
      {view === 'calendar' ? (
        <CalendarView
          yearMonth={calendarMonth}
          onYearMonthChange={setCalendarMonth}
          onSelectDate={openEntry}
        />
      ) : (
        <>
          <DatePicker date={selectedDate} onChange={setSelectedDate} />
          <JournalEditor date={selectedDate} />
        </>
      )}
    </main>
  );
}
