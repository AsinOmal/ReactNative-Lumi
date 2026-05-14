// 📖 What this does:
// Full-screen static image background with a semi-transparent white veil
// on top, used by screens that want a per-screen illustrated backdrop
// (Library, Playground, etc.). The veil opacity matches the HomeScreen
// ParallaxScene so the look stays consistent across the app.
// Uses resizeMode="cover" to fill the screen edge-to-edge — same as the
// Home ParallaxScene. The source artwork is ~9:16 and phones are ~9:19.5,
// so ~9% gets cropped horizontally; the artwork's focal content sits
// centered so the crop is unnoticeable.

import React from "react";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

interface Props {
  source: ImageSourcePropType;
  children?: React.ReactNode;
  style?: ViewStyle;
}

export const ImageBackdrop: React.FC<Props> = ({ source, children, style }) => (
  <View style={[styles.root, style]}>
    <Image source={source} style={StyleSheet.absoluteFill} resizeMode="cover" />
    <View style={styles.veil} pointerEvents="none" />
    {children}
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, overflow: "hidden" },
  veil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.17)",
  },
});
