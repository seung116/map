import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { collection, doc, getDoc, getDocs, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { auth, firestore, firebaseEnabled } from '../lib/firebase';

const USERS_COLLECTION = 'users';
const BOOTSTRAP_ADMIN_UID = 'KHOQ7B536lZC7BFq39AnA459mry1';

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
        ensureBootstrapAdmin(user);
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
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  await setDoc(doc(firestore, USERS_COLLECTION, credential.user.uid), {
    uid: credential.user.uid,
    email,
    displayName,
    approved: false,
    role: 'member',
    createdAt: serverTimestamp(),
  });
}

export function loginUser({ email, password }) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logoutUser() {
  return signOut(auth);
}

export async function listUsers() {
  const snapshot = await getDocs(collection(firestore, USERS_COLLECTION));
  return snapshot.docs.map((item) => ({ uid: item.id, ...item.data() }));
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

export async function getUserProfile(uid) {
  const snapshot = await getDoc(doc(firestore, USERS_COLLECTION, uid));
  return snapshot.exists() ? { uid, ...snapshot.data() } : null;
}
