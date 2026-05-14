// 📖 What this does:
// Wooden "LUMI" plaque that floats gently at the top of HomeScreen.
// Each letter gets a distinct kid-friendly color so the sign reads like a toy —
// not just a label. Wraps in the same dark/light wood bevel as LumiButton.

import React from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useFloatLoop } from "../../hooks/useFloatLoop";
import { colors } from "../../constants/colors";

const LETTERS = [
  { char: "L", color: colors.accentYellow },
  { char: "U", color: colors.accentCoral },
  { char: "M", color: colors.accentMint },
  { char: "I", color: colors.primary },
];

export const WoodenSign: React.FC = () => {
  const translateY = useFloatLoop();
  return (
    <Animated.View style={[styles.wrap, { transform: [{ translateY }] }]}>
      <View style={styles.outer}>
        <View style={styles.inner}>
          <View style={styles.face}>
            {LETTERS.map(({ char, color }) => (
              <Text key={char} style={[styles.letter, { color }]}>
                {char}
              </Text>
            ))}
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignSelf: "center", marginTop: 4 },
  outer: { borderRadius: 22, padding: 3, backgroundColor: "#5C3317" },
  inner: { borderRadius: 19, padding: 2, backgroundColor: "#C48A4A" },
  face: {
    backgroundColor: "#FFF8E7",
    borderRadius: 16,
    paddingHorizontal: 28,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  letter: {
    fontFamily: "SpicyRice-Regular",
    fontSize: 50,
    letterSpacing: 2,
  },
});
