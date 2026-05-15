// 📖 What this does:
// Returns a translateY Animated.Value that gently floats between 0 and -8
// forever, with an easeInOut curve on each leg (~2s up, ~2s down).
// Why useNativeDriver: transform-only animation, so the value is bridged once
// and runs entirely on the UI thread — safe to leave looping while the JS
// thread does other work.

import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

const TRAVEL_PX = -8;
const LEG_DURATION_MS = 2000;

export const useFloatLoop = (): Animated.Value => {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: TRAVEL_PX,
          duration: LEG_DURATION_MS,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: LEG_DURATION_MS,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [translateY]);

  return translateY;
};
