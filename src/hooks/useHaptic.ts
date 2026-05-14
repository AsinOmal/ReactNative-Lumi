// 📖 What this does:
// Thin wrapper around device haptics. react-native-haptic-feedback is not yet
// installed, so this falls back to Vibration on Android and is a no-op on iOS.
// Replace with react-native-haptic-feedback in Phase 2.

import { Platform, Vibration } from "react-native";

type HapticIntensity = "light" | "medium" | "heavy";

const ANDROID_DURATION_MS: Record<HapticIntensity, number> = {
  light: 10,
  medium: 20,
  heavy: 35,
};

export const triggerHaptic = (intensity: HapticIntensity = "light"): void => {
  if (Platform.OS === "android") {
    Vibration.vibrate(ANDROID_DURATION_MS[intensity]);
  }
  // iOS: intentional no-op until react-native-haptic-feedback lands.
};
