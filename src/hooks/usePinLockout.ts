// 📖 What this does:
// Tracks failed PIN attempts and enforces a 1-minute cooldown after 5 failures.
// State is persisted in AsyncStorage so a restart during cooldown restores it.
// Used by useParentAuth — split out to keep that hook under 150 lines.

import { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../constants/config';

export const LOCKED_UNTIL_KEY = '@lumi/pin_locked_until';
export const ATTEMPTS_KEY = '@lumi/pin_attempts';

interface UsePinLockoutResult {
  pinAttempts: number;
  isLocked: boolean;
  lockSecondsRemaining: number;
  onFailedAttempt: () => void;
  resetAttempts: () => void;
}

export const usePinLockout = (): UsePinLockoutResult => {
  const [pinAttempts, setPinAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockSecondsRemaining, setLockSecondsRemaining] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = useCallback((ms: number) => {
    setIsLocked(true);
    setLockSecondsRemaining(Math.ceil(ms / 1000));
    countdownRef.current = setInterval(() => {
      setLockSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          countdownRef.current = null;
          setIsLocked(false);
          setPinAttempts(0);
          AsyncStorage.removeItem(LOCKED_UNTIL_KEY).catch(() => {});
          AsyncStorage.removeItem(ATTEMPTS_KEY).catch(() => {});
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Restore lockout on mount in case app was restarted during cooldown
  useEffect(() => {
    const restore = async () => {
      try {
        const [lockedUntilStr, attemptsStr] = await Promise.all([
          AsyncStorage.getItem(LOCKED_UNTIL_KEY),
          AsyncStorage.getItem(ATTEMPTS_KEY),
        ]);
        if (attemptsStr) {
          setPinAttempts(Number(attemptsStr));
        }
        if (lockedUntilStr) {
          const remaining = Number(lockedUntilStr) - Date.now();
          if (remaining > 0) {
            startCountdown(remaining);
          }
        }
      } catch {
        /* non-blocking */
      }
    };
    restore();
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [startCountdown]);

  const onFailedAttempt = useCallback(() => {
    setPinAttempts((prev) => {
      const next = prev + 1;
      AsyncStorage.setItem(ATTEMPTS_KEY, String(next)).catch(() => {});
      if (next >= config.MAX_PIN_ATTEMPTS) {
        const lockedUntil = Date.now() + config.PIN_LOCKOUT_MS;
        AsyncStorage.setItem(LOCKED_UNTIL_KEY, String(lockedUntil)).catch(
          () => {}
        );
        startCountdown(config.PIN_LOCKOUT_MS);
      }
      return next;
    });
  }, [startCountdown]);

  const resetAttempts = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    setIsLocked(false);
    setLockSecondsRemaining(0);
    setPinAttempts(0);
    AsyncStorage.multiRemove([LOCKED_UNTIL_KEY, ATTEMPTS_KEY]).catch(() => {});
  }, []);

  return {
    pinAttempts,
    isLocked,
    lockSecondsRemaining,
    onFailedAttempt,
    resetAttempts,
  };
};
