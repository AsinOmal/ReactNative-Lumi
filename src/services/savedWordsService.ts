/**
 * savedWordsService.ts
 *
 * Firestore CRUD and real-time listener for saved words.
 * Schema: /users/{uid}/savedWords/{word} — { word, savedAt }
 *
 * Writes mirror achievementStore (AsyncStorage) — both are kept in sync.
 * subscribeToSavedWords powers the real-time list in SavedWordsScreen.
 * loadSavedWordsFromFirestore is a one-shot fetch for HomeScreen on focus.
 */

import { getApp } from '@react-native-firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { SavedWord } from '../utils/achievementStore';
import { isValidWord } from '../utils/wordValidator';

export { isValidWord };

const db = () => getFirestore(getApp());

/** Persist a saved word to Firestore. */
export const saveWordToFirestore = async (
  uid: string,
  word: string
): Promise<void> => {
  if (!isValidWord(word)) {
    console.error(
      '[savedWordsService] saveWordToFirestore: invalid word format:',
      word
    );
    return;
  }
  try {
    const ref = doc(db(), 'users', uid, 'savedWords', word);
    await setDoc(ref, { word, savedAt: Date.now() });
  } catch (e) {
    console.error('[savedWordsService] saveWordToFirestore:', e);
  }
};

/** Remove a saved word from Firestore. */
export const removeWordFromFirestore = async (
  uid: string,
  word: string
): Promise<void> => {
  try {
    const ref = doc(db(), 'users', uid, 'savedWords', word);
    await deleteDoc(ref);
  } catch (e) {
    console.error('[savedWordsService] removeWordFromFirestore:', e);
  }
};

/**
 * Subscribe to saved words in real-time (newest first).
 * Returns an unsubscribe function — call it on component unmount.
 */
export const subscribeToSavedWords = (
  uid: string,
  onUpdate: (words: SavedWord[]) => void
): (() => void) => {
  const ref = collection(db(), 'users', uid, 'savedWords');
  const q = query(ref, orderBy('savedAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      onUpdate(
        snap.docs.map(
          (d: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
            d.data() as SavedWord
        )
      );
    },
    (e) => {
      console.error('[savedWordsService] onSnapshot:', e);
    }
  );
};

/**
 * One-shot fetch of all saved words (newest first).
 * Used by HomeScreen on focus — doesn't need real-time updates.
 */
export const loadSavedWordsFromFirestore = async (
  uid: string
): Promise<SavedWord[]> => {
  try {
    const ref = collection(db(), 'users', uid, 'savedWords');
    const q = query(ref, orderBy('savedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(
      (d: FirebaseFirestoreTypes.QueryDocumentSnapshot) => d.data() as SavedWord
    );
  } catch (e) {
    console.error('[savedWordsService] loadSavedWordsFromFirestore:', e);
    return [];
  }
};
