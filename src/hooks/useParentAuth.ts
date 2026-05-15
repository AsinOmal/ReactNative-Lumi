/**
 * useParentAuth.ts
 *
 * Handles parent authentication via Face ID / Touch ID with a 4-digit PIN fallback.
 * On success, sets isParentUnlocked in the store.
 *
 * On devices without biometrics, authenticate() goes straight to PIN — no delay.
 * PIN is sha256-hashed before storing — never plain text in Firestore.
 * Lockout logic (5 attempts → 1 min cooldown) lives in usePinLockout.
 */

import { useCallback, useState } from 'react';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { sha256 } from 'js-sha256';
import { useParentalControlsStore } from '../store/useParentalControlsStore';
import { useAuthStore } from '../store/useAuthStore';
import { usePinLockout } from './usePinLockout';

const rnBiometrics = new ReactNativeBiometrics({
  allowDeviceCredentials: false,
});

export type AuthStep = 'idle' | 'biometric' | 'pin' | 'success' | 'failed';

interface UseParentAuthResult {
  authStep: AuthStep;
  authenticate: () => Promise<void>;
  verifyPin: (pin: string) => boolean;
  updatePin: (newPin: string) => Promise<void>;
  isBiometricsAvailable: boolean | null;
  pinAttempts: number;
  isLocked: boolean;
  lockSecondsRemaining: number;
  resetAttempts: () => void;
}

// 📖 What this does:
// Two-step parent auth: biometrics first, PIN fallback.
// Delegates lockout tracking to usePinLockout.
export const useParentAuth = (): UseParentAuthResult => {
  const { settings, setParentUnlocked, updateSettings } =
    useParentalControlsStore();
  const { user } = useAuthStore();
  const [authStep, setAuthStep] = useState<AuthStep>('idle');
  const [isBiometricsAvailable, setIsBiometricsAvailable] = useState<
    boolean | null
  >(null);
  const {
    pinAttempts,
    isLocked,
    lockSecondsRemaining,
    onFailedAttempt,
    resetAttempts,
  } = usePinLockout();

  const authenticate = useCallback(async () => {
    setAuthStep('biometric');
    try {
      const { available, biometryType } =
        await rnBiometrics.isSensorAvailable();
      const canUseBiometrics =
        available && biometryType !== BiometryTypes.TouchID ? true : available;
      setIsBiometricsAvailable(canUseBiometrics);

      if (!canUseBiometrics) {
        setAuthStep('pin');
        return;
      }
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Confirm parent identity',
        cancelButtonText: 'Use PIN',
      });
      if (success) {
        setParentUnlocked(true);
        setAuthStep('success');
      } else {
        setAuthStep('pin');
      }
    } catch {
      setAuthStep('pin');
    }
  }, [setParentUnlocked]);

  const verifyPin = useCallback(
    (pin: string): boolean => {
      if (isLocked) {
        return false;
      }
      const inputHash = sha256(pin);
      if (!settings.pinHash) {
        if (user) {
          updateSettings(user.uid, { pinHash: inputHash });
        }
        setParentUnlocked(true);
        setAuthStep('success');
        return true;
      }
      if (inputHash === settings.pinHash) {
        setParentUnlocked(true);
        setAuthStep('success');
        return true;
      }
      setAuthStep('failed');
      onFailedAttempt();
      return false;
    },
    [
      settings.pinHash,
      isLocked,
      setParentUnlocked,
      user,
      updateSettings,
      onFailedAttempt,
    ]
  );

  const updatePin = useCallback(
    async (newPin: string): Promise<void> => {
      if (!user) {
        return;
      }
      await updateSettings(user.uid, { pinHash: sha256(newPin) });
    },
    [user, updateSettings]
  );

  return {
    authStep,
    authenticate,
    verifyPin,
    updatePin,
    isBiometricsAvailable,
    pinAttempts,
    isLocked,
    lockSecondsRemaining,
    resetAttempts,
  };
};
