import { useEffect, useState } from 'react';
import { starterRecords } from '../data/travelData';
import { firebaseEnabled } from '../lib/firebase';
import { saveRemoteRecords, subscribeRemoteRecords } from '../services/recordStore';

export function useTravelRecords() {
  const [records, setRecordsState] = useState(() => {
    if (firebaseEnabled) return [];

    const saved = localStorage.getItem('korea-travel-records');
    return saved ? JSON.parse(saved) : starterRecords;
  });
  const [ready, setReady] = useState(!firebaseEnabled);

  useEffect(() => {
    let active = true;

    if (firebaseEnabled) {
      const unsubscribe = subscribeRemoteRecords(
        (remoteRecords) => {
          if (!active) return;
          setRecordsState(remoteRecords);
          setReady(true);
        },
        (error) => {
          console.error('Firebase records subscribe failed:', error);
          if (!active) return;
          const saved = localStorage.getItem('korea-travel-records');
          setRecordsState(saved ? JSON.parse(saved) : starterRecords);
          setReady(true);
        },
      );

      return () => {
        active = false;
        unsubscribe?.();
      };
    }

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
