import { collection, deleteDoc, doc, getDocs, onSnapshot, serverTimestamp, writeBatch } from 'firebase/firestore';
import { firestore, firebaseEnabled } from '../lib/firebase';

const RECORDS_COLLECTION = 'travelRecords';
const PHOTOS_COLLECTION = 'travelRecordPhotos';
const MAX_PHOTO_SRC_CHARS = 70_000;

function sharedPhoto(recordId, photo) {
  const src = typeof photo.src === 'string' && photo.src.length <= MAX_PHOTO_SRC_CHARS ? photo.src : '';
  return {
    recordId: String(recordId),
    id: photo.id,
    caption: photo.caption || '여행 사진',
    src,
  };
}

function sharedRecord(record) {
  return {
    ...record,
    photos: [],
  };
}

function mergeRecordsAndPhotos(records, photos) {
  const photosByRecord = photos.reduce((groups, photo) => {
    const recordPhotos = groups.get(photo.recordId) || [];
    recordPhotos.push(photo);
    groups.set(photo.recordId, recordPhotos);
    return groups;
  }, new Map());

  return records.map((record) => ({
    ...record,
    photos: photosByRecord.get(String(record.id)) || [],
  }));
}

async function commitRecordBatch(nextRecords, previousRecords) {
  const previousById = new Map(previousRecords.map((record) => [String(record.id), record]));
  const nextIds = new Set(nextRecords.map((record) => String(record.id)));
  const batch = writeBatch(firestore);

  for (const record of nextRecords) {
    const previous = previousById.get(String(record.id));
    const changed = !previous || JSON.stringify({ ...previous, updatedAt: undefined }) !== JSON.stringify({ ...record, updatedAt: undefined });
    if (!changed) continue;

    batch.set(doc(firestore, RECORDS_COLLECTION, String(record.id)), {
      ...sharedRecord(record),
      updatedAt: serverTimestamp(),
    });

    for (const photo of (record.photos || []).slice(0, 1)) {
      const photoId = `${record.id}_${photo.id}`;
      batch.set(doc(firestore, PHOTOS_COLLECTION, photoId), {
        ...sharedPhoto(record.id, photo),
        updatedAt: serverTimestamp(),
      });
    }
  }

  for (const id of previousById.keys()) {
    if (!nextIds.has(id)) {
      batch.delete(doc(firestore, RECORDS_COLLECTION, id));
    }
  }

  await batch.commit();
}

export async function loadRemoteRecords() {
  if (!firebaseEnabled || !firestore) {
    return null;
  }

  const recordsSnapshot = await getDocs(collection(firestore, RECORDS_COLLECTION));
  const photosSnapshot = await getDocs(collection(firestore, PHOTOS_COLLECTION));
  const records = recordsSnapshot.docs.map((item) => item.data());
  const photos = photosSnapshot.docs.map((item) => item.data());
  return mergeRecordsAndPhotos(records, photos);
}

export function subscribeRemoteRecords(onRecords, onError) {
  if (!firebaseEnabled || !firestore) {
    return null;
  }

  let records = [];
  let photos = [];
  let recordsReady = false;
  let photosReady = false;

  const emit = () => {
    if (recordsReady && photosReady) {
      onRecords(mergeRecordsAndPhotos(records, photos));
    }
  };

  const unsubscribeRecords = onSnapshot(
    collection(firestore, RECORDS_COLLECTION),
    (snapshot) => {
      records = snapshot.docs.map((item) => item.data());
      recordsReady = true;
      emit();
    },
    onError,
  );

  const unsubscribePhotos = onSnapshot(
    collection(firestore, PHOTOS_COLLECTION),
    (snapshot) => {
      photos = snapshot.docs.map((item) => item.data());
      photosReady = true;
      emit();
    },
    onError,
  );

  return () => {
    unsubscribeRecords();
    unsubscribePhotos();
  };
}

export async function saveRemoteRecords(nextRecords, previousRecords = []) {
  if (!firebaseEnabled || !firestore) {
    return false;
  }

  await commitRecordBatch(nextRecords, previousRecords);
  return true;
}

export async function deleteRemoteRecord(recordId) {
  if (!firebaseEnabled || !firestore) {
    return false;
  }

  await deleteDoc(doc(firestore, RECORDS_COLLECTION, String(recordId)));
  return true;
}
