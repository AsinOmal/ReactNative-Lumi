/**
 * useParentAuth.ts
 *
 * Handles parent authentication via Face ID / Touch ID (biometrics) with
 * a 4-digit PIN fallback. On success, sets isParentUnlocked in the store.
 *
 * Why biometrics-first with PIN fallback:
 *   Face ID / Touch ID is the preferred UX on modern iPhones. But biometrics
 *   can be unavailable (not enrolled, hardware not present, or too many failures).
 *   The PIN provides a guaranteed path that parents can always use.
 *
 * PIN is sha256-hashed before storing — it never hits Firestore in plain text.
 * The hash is checked locally against the stored hash in parentSettings.
 */

import { useCallback, useState } from 'react';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { sha256 } from 'js-sha256';
import { useParentalControlsStore } from '../store/useParentalControlsStore';
import { useAuthStore } from '../store/useAuthStore';

const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: false });

export type AuthStep = 'idle' | 'biometric' | 'pin' | 'success' | 'failed';

interface UseParentAuthResult {
  authStep: AuthStep;
  authenticate: () => Promise<void>;
  verifyPin: (pin: string) => boolean;
  isBiometricsAvailable: boolean | null;
}

// 📖 What this does:
// Provides a two-step parent auth flow: attempt biometrics first,
// fall back to PIN entry (rendered by PINEntryModal) if biometrics fail or
// are unavailable. The hook drives the UI by exposing authStep state.
export const useParentAuth = (): UseParentAuthResult => {
  const { settings, setParentUnlocked, updateSettings } = useParentalControlsStore();
  const { user } = useAuthStore();
  const [authStep, setAuthStep] = useState<AuthStep>('idle');
  const [isBiometricsAvailable, setIsBiometricsAvailable] = useState<boolean | null>(null);

  const authenticate = useCallback(async () => {
    setAuthStep('biometric');
    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      const canUseBiometrics = available && biometryType !== BiometryTypes.TouchID
        ? true
        : available;
      setIsBiometricsAvailable(canUseBiometrics);

      if (canUseBiometrics) {
        const { success } = await rnBiometrics.simplePrompt({
          promptMessage: 'Confirm parent identity',
          cancelButtonText: 'Use PIN',
        });
        if (success) {
          setParentUnlocked(true);
          setAuthStep('success');
          return;
        }
      }
      // Biometrics failed or unavailable — fall back to PIN
      setAuthStep('pin');
    } catch {
      // Biometric prompt dismissed or errored — fall back to PIN
      setAuthStep('pin');
    }
  }, [setParentUnlocked]);

  const verifyPin = useCallback((pin: string): boolean => {
    const inputHash = sha256(pin);
    if (!settings.pinHash) {
      // First-time setup — save the hash so future sessions require this PIN
      if (user) updateSettings(user.uid, { pinHash: inputHash });
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
    return false;
  }, [settings.pinHash, setParentUnlocked, user, updateSettings]);

  return { authStep, authenticate, verifyPin, isBiometricsAvailable };
};
