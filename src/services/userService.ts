import { getApp } from '@react-native-firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from '@react-native-firebase/firestore';
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
  if (!trimmed) {
    throw new Error('Username cannot be empty.');
  }
  try {
    await updateDoc(doc(getFirestore(getApp()), 'users', uid) as any, {
      username: trimmed,
    });
  } catch (e) {
    console.error('[userService] updateUsername:', e);
    throw e;
  }
};

export const updateChildProfile = async (
  uid: string,
  childName: string | null,
  childAge: number | null
): Promise<void> => {
  try {
    // childProfileSeen is the gate flag — set even on skip so a user who
    // skips both fields doesn't get re-prompted on every launch.
    await updateDoc(doc(getFirestore(getApp()), 'users', uid) as any, {
      childName,
      childAge,
      childProfileSeen: true,
    });
  } catch (e) {
    console.error('[userService] updateChildProfile:', e);
    throw e;
  }
};

export const loadChildProfile = async (
  uid: string
): Promise<{
  childName: string | null;
  childAge: number | null;
  childProfileSeen: boolean;
}> => {
  try {
    const snap = await getDoc(doc(getFirestore(getApp()), 'users', uid) as any);
    const data = snap.data() as any;
    return {
      childName: data?.childName ?? null,
      childAge: data?.childAge ?? null,
      childProfileSeen: data?.childProfileSeen === true,
    };
  } catch {
    return { childName: null, childAge: null, childProfileSeen: false };
  }
};

// Used by AppRoutes to decide whether to show AppIntroScreen. Persists across
// sign-out + sign-in on the same account so the user only sees the tour once.
export const markIntroSeenInFirestore = async (uid: string): Promise<void> => {
  try {
    await updateDoc(doc(getFirestore(getApp()), 'users', uid) as any, {
      introSeen: true,
    });
  } catch (e) {
    console.error('[userService] markIntroSeenInFirestore:', e);
  }
};

export const loadIntroSeen = async (uid: string): Promise<boolean> => {
  try {
    const snap = await getDoc(doc(getFirestore(getApp()), 'users', uid) as any);
    return (snap.data() as any)?.introSeen === true;
  } catch {
    return false;
  }
};

// Fails open — a network failure must not block a legitimate user.
export const isUserSuspended = async (uid: string): Promise<boolean> => {
  try {
    const snap = await getDoc(doc(getFirestore(getApp()), 'users', uid) as any);
    return (snap.data() as any)?.suspended === true;
  } catch {
    return false;
  }
};
