import { collection, deleteDoc, doc, getDocs, onSnapshot, serverTimestamp, writeBatch } from 'firebase/firestore';
import { firestore, firebaseEnabled } from '../lib/firebase';

const RECORDS_COLLECTION = 'travelRecords';
const MAX_PHOTO_SRC_CHARS = 90_000;
const MAX_RECORD_BYTES = 250_000;

function byteSize(value) {
  return new Blob([JSON.stringify(value)]).size;
}

function compactPhoto(photo) {
  const src = typeof photo.src === 'string' && photo.src.length <= MAX_PHOTO_SRC_CHARS ? photo.src : '';
  return {
    id: photo.id,
    caption: photo.caption || '여행 사진',
    src,
  };
}

function prepareSharedRecord(record) {
  const compacted = {
    ...record,
    photos: (record.photos || []).slice(0, 1).map(compactPhoto),
  };

  if (byteSize(compacted) <= MAX_RECORD_BYTES) {
    return compacted;
  }

  return { ...compacted, photos: [] };
}

export async function loadRemoteRecords() {
  if (!firebaseEnabled || !firestore) {
    return null;
  }

  const snapshot = await getDocs(collection(firestore, RECORDS_COLLECTION));
  return snapshot.docs.map((item) => item.data());
}

export function subscribeRemoteRecords(onRecords, onError) {
  if (!firebaseEnabled || !firestore) {
    return null;
  }

  return onSnapshot(
    collection(firestore, RECORDS_COLLECTION),
    (snapshot) => {
      onRecords(snapshot.docs.map((item) => item.data()));
    },
    onError,
  );
}

export async function saveRemoteRecords(nextRecords, previousRecords = []) {
  if (!firebaseEnabled || !firestore) {
    return false;
  }

  const previousById = new Map(previousRecords.map((record) => [String(record.id), record]));
  const nextIds = new Set(nextRecords.map((record) => String(record.id)));
  const batch = writeBatch(firestore);

  for (const record of nextRecords) {
    const previous = previousById.get(String(record.id));
    const changed = !previous || JSON.stringify({ ...previous, updatedAt: undefined }) !== JSON.stringify({ ...record, updatedAt: undefined });
    if (!changed) continue;
    const sharedRecord = prepareSharedRecord(record);

    batch.set(doc(firestore, RECORDS_COLLECTION, String(record.id)), {
      ...sharedRecord,
      updatedAt: serverTimestamp(),
    });
  }

  for (const id of previousById.keys()) {
    if (!nextIds.has(id)) {
      batch.delete(doc(firestore, RECORDS_COLLECTION, id));
    }
  }

  await batch.commit();
  return true;
}

export async function deleteRemoteRecord(recordId) {
  if (!firebaseEnabled || !firestore) {
    return false;
  }

  await deleteDoc(doc(firestore, RECORDS_COLLECTION, String(recordId)));
  return true;
}
