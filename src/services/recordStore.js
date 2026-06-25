import { collection, deleteDoc, doc, getDocs, serverTimestamp, writeBatch } from 'firebase/firestore';
import { firestore, firebaseEnabled } from '../lib/firebase';

const RECORDS_COLLECTION = 'travelRecords';

export async function loadRemoteRecords() {
  if (!firebaseEnabled || !firestore) {
    return null;
  }

  const snapshot = await getDocs(collection(firestore, RECORDS_COLLECTION));
  return snapshot.docs.map((item) => item.data());
}

export async function saveRemoteRecords(records) {
  if (!firebaseEnabled || !firestore) {
    return false;
  }

  const existing = await getDocs(collection(firestore, RECORDS_COLLECTION));
  const existingIds = new Set(existing.docs.map((item) => item.id));
  const nextIds = new Set(records.map((record) => String(record.id)));
  const batch = writeBatch(firestore);

  for (const record of records) {
    batch.set(doc(firestore, RECORDS_COLLECTION, String(record.id)), {
      ...record,
      photos: record.photos || [],
      updatedAt: serverTimestamp(),
    });
  }

  for (const id of existingIds) {
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
