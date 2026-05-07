import { getApp } from '@react-native-firebase/app';
import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp } from '@react-native-firebase/firestore';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';

export const USERNAME_MAX_LENGTH = 30;

export const createOrUpdateUser = async (user: FirebaseAuthTypes.User) => {
  const db = getFirestore(getApp());
  const userRef = doc(db, 'users', user.uid);

  await setDoc(
    userRef,
    {
      uid: user.uid,
      displayName: user.displayName ?? '',
      email: user.email ?? '',
      photoURL: user.photoURL ?? '',
      updatedAt: serverTimestamp(),
    },
    { merge: true } // only set these fields, don't overwrite others
  );
};

export const createUserIfNew = async (user: FirebaseAuthTypes.User) => {
  const db = getFirestore(getApp());
  const userRef = doc(db, 'users', user.uid);

  // setDoc with merge won't overwrite existing data like streakCount
  await setDoc(
    userRef,
    {
      uid: user.uid,
      displayName: user.displayName ?? '',
      username: user.displayName ?? '',
      email: user.email ?? '',
      photoURL: user.photoURL ?? '',
      createdAt: serverTimestamp(),
      streakCount: 0,
      totalWordsFound: 0,
      unlockedPacks: ['fruits'],
      subscription: 'free',
    },
    { merge: true }
  );
};

// 📖 What this does:
// Updates the user-editable display label on /users/{uid}. Trims and caps to USERNAME_MAX_LENGTH
// so a stray paste can't write a 10MB string to Firestore. Throws on failure so the caller can
// surface an error toast — silent failure here would leave the user thinking their edit took.
export const updateUsername = async (uid: string, username: string) => {
  const trimmed = username.trim().slice(0, USERNAME_MAX_LENGTH);
  if (!trimmed) throw new Error('Username cannot be empty.');
  try {
    await updateDoc(doc(getFirestore(getApp()), 'users', uid) as any, { username: trimmed });
  } catch (e) {
    console.error('[userService] updateUsername:', e);
    throw e;
  }
};

// Fails open — a network failure must not block a legitimate user.
export const isUserSuspended = async (uid: string): Promise<boolean> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const snap = await getDoc(doc(getFirestore(getApp()), 'users', uid) as any);
    return (snap.data() as any)?.suspended === true;
  } catch {
    return false;
  }
};
