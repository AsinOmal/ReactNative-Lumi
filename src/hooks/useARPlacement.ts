// 📖 What this does:
// Manages the three-state lifecycle of AR tap-to-place:
//   searching → placed (on plane tap) → back to searching (on "Place Again")
// Arms a 15s timeout in 'searching' state; clears it on placement or unmount.
// safeGoBack follows the CLAUDE.md Metal texture release pattern (opacity:0 → 350ms → goBack).

import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { config } from '../constants/config';

export type PlacementState = 'searching' | 'placed' | 'timeout';

interface UseARPlacementReturn {
  state: PlacementState;
  isLeaving: boolean;
  onPlaneSelected: () => void;
  onReplace: () => void;
  safeGoBack: () => void;
}

export function useARPlacement(): UseARPlacementReturn {
  const navigation = useNavigation();
  const [state, setState] = useState<PlacementState>('searching');
  const [isLeaving, setIsLeaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const armTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      setState('timeout');
    }, config.AR_PLACEMENT_TIMEOUT_MS);
  }, []);

  // Arm the timeout on mount; clear on unmount
  useEffect(() => {
    armTimer();
    return clearTimer;
  }, []);

  const onPlaneSelected = useCallback(() => {
    clearTimer();
    setState('placed');
  }, []);

  const onReplace = useCallback(() => {
    setState('searching');
    armTimer();
  }, [armTimer]);

  const safeGoBack = useCallback(() => {
    clearTimer();
    setIsLeaving(true);
    setTimeout(() => navigation.goBack(), 350);
  }, [navigation]);

  return { state, isLeaving, onPlaneSelected, onReplace, safeGoBack };
}
