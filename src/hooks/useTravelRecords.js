import { useEffect, useState } from 'react';
import { starterRecords } from '../data/travelData';
import { firebaseEnabled } from '../lib/firebase';
import { createRecordNotification } from '../services/notificationStore';
import { saveRemoteRecords, subscribeRemoteRecords } from '../services/recordStore';

function addedRecords(nextRecords, previousRecords) {
  const previousIds = new Set(previousRecords.map((record) => String(record.id)));
  return nextRecords.filter((record) => !previousIds.has(String(record.id)));
}

export function useTravelRecords(enabled = true, userId = null) {
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
        userId,
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
  }, [enabled, userId]);

  const persist = async (nextRecords) => {
    const previousRecords = records;
    setRecordsState(nextRecords);

    if (firebaseEnabled) {
      try {
        await saveRemoteRecords(nextRecords, previousRecords, userId);
        try {
          await Promise.all(
            addedRecords(nextRecords, previousRecords).map((record) => createRecordNotification(userId, record)),
          );
        } catch (notificationError) {
          console.warn('Record notification create failed:', notificationError);
        }
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
