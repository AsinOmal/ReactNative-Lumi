/**
 * useGoogleSignIn.ts
 *
 * Encapsulates the Google → Firebase credential exchange so Login + Register
 * (and any future entry point) can drop in a single button without duplicating
 * the config + error handling.
 */

import { useEffect, useState } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getApp } from '@react-native-firebase/app';
import {
  getAuth,
  signInWithCredential,
  GoogleAuthProvider,
} from '@react-native-firebase/auth';

const WEB_CLIENT_ID =
  '991654335767-idkk7nq7qa6f4a5nspj5da0va1s26dnd.apps.googleusercontent.com';

interface UseGoogleSignInResult {
  signInGoogle: () => Promise<void>;
  loading: boolean;
}

export const useGoogleSignIn = (
  onError: (msg: string) => void,
  genericErrorMsg: string
): UseGoogleSignInResult => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({ webClientId: WEB_CLIENT_ID });
  }, []);

  const signInGoogle = async (): Promise<void> => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const { data } = await GoogleSignin.signIn();
      const credential = GoogleAuthProvider.credential(data?.idToken || '');
      await signInWithCredential(getAuth(getApp()), credential);
    } catch (e) {
      console.error('[useGoogleSignIn]:', e);
      onError(genericErrorMsg);
    } finally {
      setLoading(false);
    }
  };

  return { signInGoogle, loading };
};
