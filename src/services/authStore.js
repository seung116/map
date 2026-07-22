import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { auth, firestore, firebaseEnabled } from '../lib/firebase';

const USERS_COLLECTION = 'users';
const BOOTSTRAP_ADMIN_UID = import.meta.env.VITE_BOOTSTRAP_ADMIN_UID || '';
let authPersistencePromise = null;

function assertFirebaseReady() {
  if (!firebaseEnabled || !auth || !firestore) {
    throw new Error('Firebase 설정이 필요합니다. VITE_FIREBASE_* 환경변수를 확인해주세요.');
  }
}

function ensureAuthPersistence() {
  if (!auth) return Promise.resolve();

  if (!authPersistencePromise) {
    authPersistencePromise = setPersistence(auth, browserLocalPersistence);
  }

  return authPersistencePromise;
}

function bootstrapAdminProfile(user, profile = {}) {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || '관리자',
    ...profile,
    approved: true,
    role: 'admin',
  };
}

function profileForUser(user, snapshot) {
  const profile = snapshot.exists() ? { uid: user.uid, ...snapshot.data() } : null;
  return user.uid === BOOTSTRAP_ADMIN_UID ? bootstrapAdminProfile(user, profile || {}) : profile;
}

async function ensurePendingProfile(user) {
  if (user.uid === BOOTSTRAP_ADMIN_UID) return;

  try {
    await requestApproval(user, user.displayName || user.email);
  } catch (error) {
    console.warn('Pending user profile sync failed:', error);
  }
}

async function ensureBootstrapAdmin(user) {
  if (user.uid !== BOOTSTRAP_ADMIN_UID) return;

  try {
    await setDoc(
      doc(firestore, USERS_COLLECTION, user.uid),
      bootstrapAdminProfile(user),
      { merge: true },
    );
  } catch (error) {
    console.warn('Bootstrap admin profile sync failed:', error);
  }
}

export function subscribeAuthState(onChange) {
  if (!firebaseEnabled || !auth || !firestore) {
    onChange({ user: null, profile: null });
    return () => {};
  }

  ensureAuthPersistence();

  let unsubscribeProfile = null;

  return onAuthStateChanged(auth, (user) => {
    unsubscribeProfile?.();

    if (!user) {
      onChange({ user: null, profile: null });
      return;
    }

    unsubscribeProfile = onSnapshot(
      doc(firestore, USERS_COLLECTION, user.uid),
      (snapshot) => {
        if (user.uid === BOOTSTRAP_ADMIN_UID) {
          ensureBootstrapAdmin(user);
        } else if (!snapshot.exists()) {
          ensurePendingProfile(user);
        }

        onChange({
          user,
          profile: profileForUser(user, snapshot),
        });
      },
      (error) => {
        console.error('User profile subscribe failed:', error);
        onChange({
          user,
          profile: user.uid === BOOTSTRAP_ADMIN_UID ? bootstrapAdminProfile(user) : null,
        });
      },
    );
  });
}

export async function registerUser({ email, password, displayName }) {
  assertFirebaseReady();
  await ensureAuthPersistence();
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  await requestApproval(credential.user, displayName);
}

export async function loginUser({ email, password }) {
  assertFirebaseReady();
  await ensureAuthPersistence();
  return signInWithEmailAndPassword(auth, email, password);
}

export function logoutUser() {
  assertFirebaseReady();
  return signOut(auth);
}

export async function requestApproval(user, displayName) {
  assertFirebaseReady();
  const targetUser = user || auth.currentUser;
  if (!targetUser) throw new Error('로그인이 필요합니다.');
  const profileRef = doc(firestore, USERS_COLLECTION, targetUser.uid);
  const profile = await getDoc(profileRef);

  if (profile.exists()) {
    return;
  }

  await setDoc(
    profileRef,
    {
      uid: targetUser.uid,
      email: targetUser.email,
      displayName: displayName || targetUser.displayName || targetUser.email,
      approved: false,
      role: 'member',
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function listUsers() {
  const snapshot = await getDocs(collection(firestore, USERS_COLLECTION));
  return snapshot.docs.map((item) => ({ uid: item.id, ...item.data() }));
}

export function subscribeUsers(onUsers, onError) {
  return onSnapshot(
    collection(firestore, USERS_COLLECTION),
    (snapshot) => {
      onUsers(snapshot.docs.map((item) => ({ uid: item.id, ...item.data() })));
    },
    onError,
  );
}

export async function setUserApproval(uid, approved) {
  await updateDoc(doc(firestore, USERS_COLLECTION, uid), {
    approved,
    reviewedAt: serverTimestamp(),
  });
}

export async function setUserRole(uid, role) {
  await updateDoc(doc(firestore, USERS_COLLECTION, uid), {
    role,
    reviewedAt: serverTimestamp(),
  });
}

export async function deleteUserProfile(uid) {
  if (uid === BOOTSTRAP_ADMIN_UID) {
    throw new Error('초기 관리자 계정은 삭제할 수 없습니다.');
  }

  await deleteDoc(doc(firestore, USERS_COLLECTION, uid));
}

export async function getUserProfile(uid) {
  const snapshot = await getDoc(doc(firestore, USERS_COLLECTION, uid));
  return snapshot.exists() ? { uid, ...snapshot.data() } : null;
}
