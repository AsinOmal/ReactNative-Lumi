/**
 * emailAuthService.ts
 *
 * Email/password auth wrapper. Maps Firebase auth errors to friendly,
 * kid-app-safe messages and exposes a stable surface for the auth UI.
 *
 * Why a service (not inline in the screens):
 *   The error-code → message mapping needs to live in one place so EN/SI
 *   stays in sync, and the screens can stay thin orchestrators. Also lets
 *   the same code be called from a future password-change flow without
 *   re-implementing the mapping.
 */

import { getApp } from '@react-native-firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  FirebaseAuthTypes,
} from '@react-native-firebase/auth';
import type { strings as Strings } from '../constants/strings';

export class FriendlyAuthError extends Error {}

const FIRENBASE_CODE_TO_STRING_KEY: Record<string, keyof typeof Strings> = {
  'auth/invalid-email': 'AUTH_ERR_INVALID_EMAIL',
  'auth/user-not-found': 'AUTH_ERR_USER_NOT_FOUND',
  'auth/wrong-password': 'AUTH_ERR_WRONG_PASSWORD',
  'auth/invalid-credential': 'AUTH_ERR_WRONG_PASSWORD',
  'auth/email-already-in-use': 'AUTH_ERR_EMAIL_IN_USE',
  'auth/weak-password': 'AUTH_ERR_WEAK_PASSWORD',
  'auth/network-request-failed': 'AUTH_ERR_NETWORK',
  'auth/too-many-requests': 'AUTH_ERR_TOO_MANY',
};

// Caller passes its own strings dict so we don't pull in useStrings() here
// (it's a hook, not callable from service functions). EN or SI both work.
type StringsDict = typeof Strings;

const friendly = (err: unknown, strs: StringsDict): FriendlyAuthError => {
  const code = (err as { code?: string })?.code ?? '';
  const key = FIRENBASE_CODE_TO_STRING_KEY[code];
  const message = key ? strs[key] : strs.AUTH_ERR_GENERIC;
  return new FriendlyAuthError(message as string);
};

export const registerWithEmail = async (
  email: string,
  password: string,
  displayName: string,
  strs: StringsDict
): Promise<FirebaseAuthTypes.User> => {
  try {
    const auth = getAuth(getApp());
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName.trim()) {
      await updateProfile(cred.user, { displayName: displayName.trim() });
    }
    // Fire-and-forget verification email — failure shouldn't block account
    // creation. The user will see a "resend" button on the verify screen.
    sendEmailVerification(cred.user).catch((e) =>
      console.warn('[emailAuthService] sendEmailVerification:', e)
    );
    return cred.user;
  } catch (e) {
    throw friendly(e, strs);
  }
};

export const signInWithEmail = async (
  email: string,
  password: string,
  strs: StringsDict
): Promise<FirebaseAuthTypes.User> => {
  try {
    const auth = getAuth(getApp());
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  } catch (e) {
    throw friendly(e, strs);
  }
};

export const resendVerificationEmail = async (
  strs: StringsDict
): Promise<void> => {
  try {
    const user = getAuth(getApp()).currentUser;
    if (!user) {
      throw new FriendlyAuthError(strs.AUTH_ERR_GENERIC);
    }
    await sendEmailVerification(user);
  } catch (e) {
    if (e instanceof FriendlyAuthError) {
      throw e;
    }
    throw friendly(e, strs);
  }
};

export const reloadCurrentUser =
  async (): Promise<FirebaseAuthTypes.User | null> => {
    const user = getAuth(getApp()).currentUser;
    if (!user) {
      return null;
    }
    await user.reload();
    return getAuth(getApp()).currentUser;
  };

export const sendPasswordReset = async (
  email: string,
  strs: StringsDict
): Promise<void> => {
  try {
    await sendPasswordResetEmail(getAuth(getApp()), email);
  } catch (e) {
    throw friendly(e, strs);
  }
};
