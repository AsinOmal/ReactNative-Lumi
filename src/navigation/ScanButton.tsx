// 📖 What this does:
// The floating circular Scan button that anchors the bottom tab bar. Three
// nested layers (dark wood frame → light wood highlight → orange gradient
// face with top sheen) give the same skeuomorphic look as the "Find it" CTA.
// A usePulseLoop wraps the whole button so it softly breathes — drawing the
// eye to the primary action without being distracting.

import React from "react";
import { View, TouchableOpacity, StyleSheet, Animated } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { buttonGradientColors } from "../constants/skeuomorphicTokens";
import { usePulseLoop } from "../hooks/usePulseLoop";
import { styles } from "./MainTabNavigatorStyles";

export const ScanButton = () => {
  const navigation = useNavigation();
  const pulse = usePulseLoop();
  return (
    <Animated.View style={{ transform: [{ scale: pulse }] }}>
      <TouchableOpacity
        onPress={() => (navigation as any).navigate("Scan")}
        activeOpacity={0.85}
        style={styles.scanBtnShadow}
        accessibilityLabel="Open scanner"
        accessibilityRole="button"
      >
        <View style={styles.scanBtnOuter}>
          <View style={styles.scanBtnInner}>
            <LinearGradient
              colors={buttonGradientColors.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.scanBtnFace}
            >
              <LinearGradient
                colors={buttonGradientColors.sheen}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 0.5 }}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />
              <Ionicons name="camera" size={28} color="#FFF" />
            </LinearGradient>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};
