import { useEffect, useState } from 'react';
import { starterRecords } from '../data/travelData';
import { firebaseEnabled } from '../lib/firebase';
import { saveRemoteRecords, subscribeRemoteRecords } from '../services/recordStore';

export function useTravelRecords(enabled = true) {
  const [records, setRecordsState] = useState(() => {
    if (firebaseEnabled || !enabled) return [];

    const saved = localStorage.getItem('korea-travel-records');
    return saved ? JSON.parse(saved) : starterRecords;
  });
  const [ready, setReady] = useState(!firebaseEnabled || !enabled);

  useEffect(() => {
    let active = true;

    if (!enabled) {
      return () => {
        active = false;
      };
    }

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
  }, [enabled]);

  const persist = async (nextRecords) => {
    const previousRecords = records;
    setRecordsState(nextRecords);

    if (firebaseEnabled) {
      try {
        await saveRemoteRecords(nextRecords, previousRecords);
        return true;
      } catch (error) {
        console.error('Firebase records save failed:', error);
        setRecordsState(previousRecords);
        return false;
      }
    }

    localStorage.setItem('korea-travel-records', JSON.stringify(nextRecords));
    return true;
  };

  return { records, setRecords: persist, ready };
}
