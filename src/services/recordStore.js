import { collection, deleteDoc, doc, getDocs, onSnapshot, serverTimestamp, writeBatch } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { firestore, storage, firebaseEnabled } from '../lib/firebase';

const RECORDS_COLLECTION = 'travelRecords';
let lastRecordSaveError = null;

export function getLastRecordSaveError() {
  return lastRecordSaveError;
}

function userRecordsCollection(userId) {
  return collection(firestore, 'users', userId, RECORDS_COLLECTION);
}

function userRecordDoc(userId, recordId) {
  return doc(firestore, 'users', userId, RECORDS_COLLECTION, String(recordId));
}

function isDataUrl(src) {
  return typeof src === 'string' && src.startsWith('data:');
}

async function dataUrlToBlob(dataUrl) {
  return (await fetch(dataUrl)).blob();
}

async function uploadPhoto(userId, recordId, photo) {
  if (!isDataUrl(photo.src)) {
    return {
      id: photo.id,
      caption: photo.caption || '여행 사진',
      src: photo.src || '',
    };
  }

  const blob = await dataUrlToBlob(photo.src);
  const photoRef = ref(storage, `users/${userId}/travel-records/${recordId}/${photo.id}.jpg`);
  await uploadBytes(photoRef, blob, { contentType: blob.type || 'image/jpeg' });
  const src = await getDownloadURL(photoRef);

  return {
    id: photo.id,
    caption: photo.caption || '여행 사진',
    src,
  };
}

async function sharedRecord(userId, record) {
  return {
    ...record,
    userId,
    photos: await Promise.all((record.photos || []).filter((photo) => photo.src).slice(0, 3).map((photo) => uploadPhoto(userId, record.id, photo))),
  };
}

async function commitRecordBatch(nextRecords, previousRecords, userId) {
  const previousById = new Map(previousRecords.map((record) => [String(record.id), record]));
  const nextIds = new Set(nextRecords.map((record) => String(record.id)));
  const batch = writeBatch(firestore);

  for (const record of nextRecords) {
    const previous = previousById.get(String(record.id));
    const changed = !previous || JSON.stringify({ ...previous, updatedAt: undefined }) !== JSON.stringify({ ...record, updatedAt: undefined });
    if (!changed) continue;

    batch.set(userRecordDoc(userId, record.id), {
      ...(await sharedRecord(userId, record)),
      updatedAt: serverTimestamp(),
    });
  }

  for (const id of previousById.keys()) {
    if (!nextIds.has(id)) {
      batch.delete(userRecordDoc(userId, id));
    }
  }

  await batch.commit();
}

export async function loadRemoteRecords(userId) {
  if (!firebaseEnabled || !firestore || !userId) {
    return null;
  }

  const snapshot = await getDocs(userRecordsCollection(userId));
  return snapshot.docs.map((item) => item.data());
}

export async function countRemoteUserPhotos(userId) {
  if (!firebaseEnabled || !firestore || !userId) {
    return 0;
  }

  const records = await loadRemoteRecords(userId);
  return (records || []).reduce((sum, record) => sum + (record.photos || []).filter((photo) => photo.src).length, 0);
}

export function subscribeRemoteRecords(userId, onRecords, onError) {
  if (!firebaseEnabled || !firestore || !userId) {
    return null;
  }

  return onSnapshot(
    userRecordsCollection(userId),
    (snapshot) => {
      onRecords(snapshot.docs.map((item) => item.data()));
    },
    onError,
  );
}

export async function saveRemoteRecords(nextRecords, previousRecords = [], userId) {
  if (!firebaseEnabled || !firestore || !storage || !userId) {
    return false;
  }

  try {
    await commitRecordBatch(nextRecords, previousRecords, userId);
    lastRecordSaveError = null;
  } catch (error) {
    lastRecordSaveError = error;
    throw error;
  }

  return true;
}

export async function deleteRemoteRecord(recordId, userId) {
  if (!firebaseEnabled || !firestore || !userId) {
    return false;
  }

  await deleteDoc(userRecordDoc(userId, recordId));
  return true;
}
