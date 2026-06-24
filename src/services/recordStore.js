import { collection, deleteDoc, doc, getDocs, serverTimestamp, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firestore, storage, firebaseEnabled } from '../lib/firebase';

const RECORDS_COLLECTION = 'travelRecords';

function isDataUrl(src) {
  return typeof src === 'string' && src.startsWith('data:');
}

async function dataUrlToBlob(dataUrl) {
  return (await fetch(dataUrl)).blob();
}

async function uploadPhoto(recordId, photo) {
  if (!storage || !isDataUrl(photo.src)) {
    return photo;
  }

  const path = `travel-records/${recordId}/${photo.id}`;
  const fileRef = ref(storage, path);
  const blob = await dataUrlToBlob(photo.src);
  await uploadBytes(fileRef, blob, { contentType: blob.type || 'image/jpeg' });
  const src = await getDownloadURL(fileRef);
  return { ...photo, src, storagePath: path };
}

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
    const remotePhotos = await Promise.all((record.photos || []).map((photo) => uploadPhoto(record.id, photo)));
    batch.set(doc(firestore, RECORDS_COLLECTION, String(record.id)), {
      ...record,
      photos: remotePhotos,
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
