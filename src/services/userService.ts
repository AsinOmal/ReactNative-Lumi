import { getApp } from '@react-native-firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from '@react-native-firebase/firestore';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';

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
