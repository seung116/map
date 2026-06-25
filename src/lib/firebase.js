import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const defaultFirebaseConfig = {
  apiKey: 'AIzaSyABhk5U3xMrczhOeE3ctfmUETlfxkmLlGQ',
  authDomain: 'typing-map.firebaseapp.com',
  projectId: 'typing-map',
  storageBucket: 'typing-map.firebasestorage.app',
  appId: '1:513690512088:web:394edf28740a3abf67c5ad',
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || defaultFirebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || defaultFirebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultFirebaseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || defaultFirebaseConfig.storageBucket,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || defaultFirebaseConfig.appId,
};

export const firebaseEnabled = Object.values(firebaseConfig).every(Boolean);

export const firebaseApp = firebaseEnabled
  ? getApps().length
    ? getApps()[0]
    : initializeApp(firebaseConfig)
  : null;

export const firestore = firebaseApp ? getFirestore(firebaseApp) : null;
export const storage = firebaseApp ? getStorage(firebaseApp) : null;
