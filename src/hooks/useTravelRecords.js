import { useEffect, useState } from 'react';
import { starterRecords } from '../data/travelData';
import { firebaseEnabled } from '../lib/firebase';
import { loadRemoteRecords, saveRemoteRecords } from '../services/recordStore';

export function useTravelRecords() {
  const [records, setRecordsState] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (firebaseEnabled) {
        try {
          const remoteRecords = await loadRemoteRecords();
          if (active) {
            setRecordsState(remoteRecords || []);
            setReady(true);
          }
          return;
        } catch (error) {
          console.error('Firebase records load failed:', error);
        }
      }

      const saved = localStorage.getItem('korea-travel-records');
      const nextRecords = saved ? JSON.parse(saved) : starterRecords;
      if (active) {
        setRecordsState(nextRecords);
        setReady(true);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const persist = async (nextRecords) => {
    const previousRecords = records;
    setRecordsState(nextRecords);

    if (firebaseEnabled) {
      try {
        await saveRemoteRecords(nextRecords, previousRecords);
        return;
      } catch (error) {
        console.error('Firebase records save failed:', error);
      }
    }

    localStorage.setItem('korea-travel-records', JSON.stringify(nextRecords));
  };

  return { records, setRecords: persist, ready };
}
