// 📖 What this does:
// Returns an Animated scale value plus pressIn/pressOut handlers that produce
// a tap-bounce effect (scale 1 -> 0.94 -> spring back to 1).
// Why Animated (not Reanimated): the project is locked to React Native's Old
// Architecture for ViroReact compatibility, so worklet-based libraries are off
// the table. Animated runs on the JS thread but is fine for one-shot taps.

import { useRef } from "react";
import { Animated } from "react-native";

interface AnimatedTap {
  scale: Animated.Value;
  handlers: {
    onPressIn: () => void;
    onPressOut: () => void;
  };
}

export const useAnimatedTap = (): AnimatedTap => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.timing(scale, {
      toValue: 0.94,
      duration: 80,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  return { scale, handlers: { onPressIn, onPressOut } };
};
