import { useState, useEffect } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from '../firebase';
import type { AdminUser } from '../types';

interface UseAdminAuthResult {
  user: AdminUser | null;
  loading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

export const useAdminAuth = (): UseAdminAuthResult => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const tokenResult = await firebaseUser.getIdTokenResult();
        if (!tokenResult.claims['admin']) {
          await signOut(auth);
          setUser(null);
          setError('This account does not have admin access.');
        } else {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email ?? '',
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });
          setError(null);
        }
      } catch (e) {
        console.error('[useAdminAuth] Token check failed:', e);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async (): Promise<void> => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error('[useAdminAuth] Sign-in failed:', e);
      setError('Sign-in failed. Please try again.');
    }
  };

  const signOutUser = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('[useAdminAuth] Sign-out failed:', e);
    }
  };

  return { user, loading, error, signIn, signOutUser };
};
