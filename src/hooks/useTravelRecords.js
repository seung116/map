import { useState } from 'react';
import { starterRecords } from '../data/travelData';

export function useTravelRecords() {
  const [records, setRecords] = useState(() => {
    const saved = localStorage.getItem('korea-travel-records');
    return saved ? JSON.parse(saved) : starterRecords;
  });

  const persist = (nextRecords) => {
    setRecords(nextRecords);
    localStorage.setItem('korea-travel-records', JSON.stringify(nextRecords));
  };

  return { records, setRecords: persist };
}
