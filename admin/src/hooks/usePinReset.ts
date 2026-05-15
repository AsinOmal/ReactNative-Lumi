import { useState } from 'react';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db } from '../firebase';

interface FoundUser {
  uid: string;
  displayName: string;
  email: string;
}

interface UsePinResetResult {
  searching: boolean;
  resetting: boolean;
  foundUser: FoundUser | null;
  searchError: string | null;
  resetSuccess: boolean;
  searchUserByEmail: (email: string) => Promise<void>;
  resetUserPin: (uid: string) => Promise<void>;
  clearResult: () => void;
}

export const usePinReset = (): UsePinResetResult => {
  const [searching, setSearching] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const searchUserByEmail = async (email: string) => {
    if (!email.trim()) return;
    setSearching(true);
    setFoundUser(null);
    setSearchError(null);
    setResetSuccess(false);
    try {
      const q = query(collection(db, 'users'), where('email', '==', email.trim().toLowerCase()));
      const snap = await getDocs(q);
      if (snap.empty) {
        setSearchError('No user found with that email address.');
      } else {
        const data = snap.docs[0].data();
        setFoundUser({ uid: snap.docs[0].id, displayName: data.displayName ?? '(no name)', email: data.email });
      }
    } catch (e) {
      console.error('[usePinReset] searchUserByEmail:', e);
      setSearchError('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const resetUserPin = async (uid: string) => {
    setResetting(true);
    try {
      const ref = doc(db, 'users', uid, 'parentSettings', 'settings');
      await setDoc(ref, { pinHash: null, pinResetPending: true }, { merge: true });
      setResetSuccess(true);
    } catch (e) {
      console.error('[usePinReset] resetUserPin:', e);
    } finally {
      setResetting(false);
    }
  };

  const clearResult = () => {
    setFoundUser(null);
    setSearchError(null);
    setResetSuccess(false);
  };

  return { searching, resetting, foundUser, searchError, resetSuccess, searchUserByEmail, resetUserPin, clearResult };
};
