import { useState } from 'react';
import DatePicker from './components/DatePicker';
import JournalEditor from './components/JournalEditor';

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function App() {
  const [selectedDate, setSelectedDate] = useState(localToday);

  return (
    <main>
      <h1>Journal</h1>
      <DatePicker date={selectedDate} onChange={setSelectedDate} />
      <JournalEditor date={selectedDate} />
    </main>
  );
}
