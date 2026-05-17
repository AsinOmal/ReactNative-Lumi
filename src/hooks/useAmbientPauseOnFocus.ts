/**
 * useAmbientPauseOnFocus.ts
 *
 * Pauses the ambient background music while a "loud" screen is focused —
 * Scan, AR, and game screens that have their own audio soundscape. Resumes
 * on blur so navigating back to the tabs feels seamless.
 *
 * Why per-screen rather than navigation-state-listener at the root:
 *   Listing screens at the root would require maintaining a hardcoded "loud
 *   screens" array that drifts as the app grows. Each screen owning its own
 *   audio-context decision is more self-contained and survives refactors.
 *
 * Why useFocusEffect (not useEffect):
 *   The screen may stay mounted across navigation pushes/pops. Focus events
 *   fire reliably for both directions; mount/unmount events do not.
 */

import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { startAmbient, stopAmbient } from '../utils/ambientSound';

export const useAmbientPauseOnFocus = (): void => {
  useFocusEffect(
    useCallback(() => {
      stopAmbient();
      return () => {
        startAmbient();
      };
    }, [])
  );
};
