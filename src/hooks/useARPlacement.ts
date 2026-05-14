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
  sceneKey: number;
  onPlaneSelected: () => void;
  onReplace: () => void;
  safeGoBack: () => void;
}

export function useARPlacement(): UseARPlacementReturn {
  const navigation = useNavigation();
  const [state, setState] = useState<PlacementState>('searching');
  const [isLeaving, setIsLeaving] = useState(false);
  // Incrementing this forces ViroARSceneNavigator to fully remount, which
  // resets ARKit plane detection — required because ViroARPlaneSelector has
  // no reset API and retains its selected plane across React state changes.
  const [sceneKey, setSceneKey] = useState(0);
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
    setSceneKey(k => k + 1);
    setState('searching');
    armTimer();
  }, [armTimer]);

  const safeGoBack = useCallback(() => {
    clearTimer();
    setIsLeaving(true);
    setTimeout(() => navigation.goBack(), 350);
  }, [navigation]);

  return { state, isLeaving, sceneKey, onPlaneSelected, onReplace, safeGoBack };
}
