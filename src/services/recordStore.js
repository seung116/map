import { collection, deleteDoc, doc, getDocs, onSnapshot, serverTimestamp, writeBatch } from 'firebase/firestore';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { firestore, storage, firebaseEnabled } from '../lib/firebase';

const RECORDS_COLLECTION = 'travelRecords';

function isDataUrl(src) {
  return typeof src === 'string' && src.startsWith('data:');
}

async function uploadPhoto(recordId, photo) {
  if (!storage || !isDataUrl(photo.src)) {
    return {
      id: photo.id,
      caption: photo.caption || '여행 사진',
      src: photo.src || '',
    };
  }

  try {
    const photoRef = ref(storage, `travel-records/${recordId}/${photo.id}.jpg`);
    await uploadString(photoRef, photo.src, 'data_url');
    const src = await getDownloadURL(photoRef);
    return {
      id: photo.id,
      caption: photo.caption || '여행 사진',
      src,
    };
  } catch (error) {
    console.error('Firebase photo upload failed:', error);
    return {
      id: photo.id,
      caption: photo.caption || '여행 사진',
      src: '',
    };
  }
}

async function prepareSharedRecord(record) {
  const photos = await Promise.all((record.photos || []).slice(0, 3).map((photo) => uploadPhoto(record.id, photo)));

  return {
    ...record,
    photos,
  };
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
    const sharedRecord = await prepareSharedRecord(record);

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
