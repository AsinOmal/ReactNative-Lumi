// 📖 What this does:
// Lumi logo image that floats gently at the top of HomeScreen.
// Replaces the hand-drawn letter plaque with the official brand asset.

import React from "react";
import { Image, StyleSheet, Animated } from "react-native";
import { useFloatLoop } from "../../hooks/useFloatLoop";

export const WoodenSign: React.FC = () => {
  const translateY = useFloatLoop();
  return (
    <Animated.View style={[styles.wrap, { transform: [{ translateY }] }]}>
      <Image
        source={require("../../assets/backgrounds/lumi-logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignSelf: "center", marginTop: 4 },
  logo: { width: 220, height: 88 },
});
