// 📖 What this does:
// Returns an Animated.Value that loops 1.0 → 1.06 → 1.0 like a slow heartbeat.
// Used on the "Find it" CTA and the tab-bar ScanButton so the main action always
// draws the eye. Slower and subtler than useFloatLoop (3s period vs 4s float) —
// the goal is "alive" not "jittery".

import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

const PEAK = 1.06;
const HALF_CYCLE_MS = 1500;

export const usePulseLoop = (): Animated.Value => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: PEAK,
          duration: HALF_CYCLE_MS,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: HALF_CYCLE_MS,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [scale]);

  return scale;
};
