import { addDoc, collection, doc, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import { firebaseApp, firebaseEnabled, firebaseMessagingEnabled, firebaseMessagingVapidKey, firestore } from '../lib/firebase';
import { recordDateRange } from '../utils/travelUtils';

const NOTIFICATIONS_COLLECTION = 'notifications';
const NOTIFICATION_DEVICES_COLLECTION = 'notificationDevices';

function userNotificationsCollection(userId) {
  return collection(firestore, 'users', userId, NOTIFICATIONS_COLLECTION);
}

function notificationDeviceDoc(userId, token) {
  return doc(firestore, 'users', userId, NOTIFICATION_DEVICES_COLLECTION, encodeURIComponent(token));
}

async function serviceWorkerRegistration() {
  if (!('serviceWorker' in navigator)) return null;

  const existingRegistration = await navigator.serviceWorker.getRegistration();
  if (existingRegistration) return existingRegistration;

  const manifestHref = document.querySelector('link[rel="manifest"]')?.href || window.location.href;
  const serviceWorkerUrl = new URL('sw.js', manifestHref);
  return navigator.serviceWorker.register(serviceWorkerUrl);
}

function recordTargetPath(record) {
  if (record.type === 'date') {
    return `/date/record/${record.id}`;
  }

  return `/travel/region/${record.regionId || 'seoul'}`;
}

export async function createRecordNotification(userId, record) {
  if (!firebaseEnabled || !firestore || !userId || !record) {
    return false;
  }

  const isDateRecord = record.type === 'date';
  const recordKind = isDateRecord ? '데이트' : '여행';
  const title = `새 ${recordKind} 기록이 저장됐어요`;
  const body = `${record.title || record.tripName || recordKind} · ${recordDateRange(record)}`;

  await addDoc(userNotificationsCollection(userId), {
    type: 'record-created',
    recordId: String(record.id),
    recordType: record.type || 'travel',
    title,
    body,
    targetPath: recordTargetPath(record),
    read: false,
    createdAt: serverTimestamp(),
  });

  return true;
}

export function subscribeUserNotifications(userId, onNotification, onError) {
  if (!firebaseEnabled || !firestore || !userId) {
    return null;
  }

  let initialized = false;
  const knownIds = new Set();

  return onSnapshot(
    query(userNotificationsCollection(userId), orderBy('createdAt', 'desc'), limit(8)),
    (snapshot) => {
      const incomingNotifications = [];

      snapshot.docChanges().forEach((change) => {
        if (change.type !== 'added') return;

        const id = change.doc.id;
        if (knownIds.has(id)) return;
        knownIds.add(id);

        if (initialized) {
          incomingNotifications.push({ id, ...change.doc.data() });
        }
      });

      initialized = true;
      incomingNotifications.reverse().forEach(onNotification);
    },
    onError,
  );
}

export async function registerNotificationDevice(userId) {
  if (!firebaseEnabled || !firebaseMessagingEnabled || !firestore || !firebaseApp || !userId) {
    return false;
  }

  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }

  const [{ getMessaging, getToken, isSupported }] = await Promise.all([
    import('firebase/messaging'),
  ]);

  if (!(await isSupported())) {
    return false;
  }

  const registration = await serviceWorkerRegistration();
  if (!registration) return false;

  const token = await getToken(getMessaging(firebaseApp), {
    vapidKey: firebaseMessagingVapidKey,
    serviceWorkerRegistration: registration,
  });

  if (!token) return false;

  await setDoc(
    notificationDeviceDoc(userId, token),
    {
      token,
      userAgent: navigator.userAgent,
      platform: navigator.platform || '',
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return true;
}
