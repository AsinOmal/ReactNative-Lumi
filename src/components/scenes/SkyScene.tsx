// 📖 What this does:
// Composable full-screen sky background. Layers a 3-stop sky gradient and four
// decorative Lottie elements (two clouds at different positions/speeds, a sun,
// and a hot-air balloon), then renders children on top.
// Why ref-driven pause: lottie-react-native v5 has no reliable `paused` prop on
// Android, so we hold refs to each LottieView and call .pause()/.play() in an
// effect when the `paused` prop flips. This keeps the off-screen scene cheap
// without unmounting (which would re-fetch animations and cause flicker).

import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, ViewStyle } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import LottieView from "lottie-react-native";
import { colors } from "../../constants/colors";

interface SkySceneProps {
  paused?: boolean;
  children?: React.ReactNode;
  style?: ViewStyle;
  scrollY?: Animated.Value;
}

export const SkyScene: React.FC<SkySceneProps> = ({
  paused = false,
  children,
  style,
  scrollY,
}) => {
  const cloudRef = useRef<LottieView>(null);
  const sunRef = useRef<LottieView>(null);
  const balloonRef = useRef<LottieView>(null);
  const fallbackY = useRef(new Animated.Value(0)).current;
  // Sky elements drift upward at ~5% of scroll speed — they feel further away
  // than the foreground content, which adds perceived depth without any
  // background coverage gap.
  const skyDrift = (scrollY ?? fallbackY).interpolate({
    inputRange: [0, 300],
    outputRange: [0, -15],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    const refs = [cloudRef, sunRef, balloonRef];
    refs.forEach((r) => {
      if (paused) {
        r.current?.pause();
      } else {
        r.current?.play();
      }
    });
  }, [paused]);

  return (
    <View style={[styles.root, style]}>
      <LinearGradient
        colors={[colors.skyTop, colors.skyMid, colors.skyBottom]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        style={[StyleSheet.absoluteFill, { transform: [{ translateY: skyDrift }] }]}
      >
        <LottieView
          ref={balloonRef}
          source={require("../../assets/lottie/hotairballoon.json")}
          autoPlay
          loop
          style={styles.balloon}
        />
        <LottieView
          ref={cloudRef}
          source={require("../../assets/lottie/cloud-drift.json")}
          autoPlay
          loop
          speed={0.6}
          style={styles.cloud}
        />
        <LottieView
          ref={sunRef}
          source={require("../../assets/lottie/sun.json")}
          autoPlay
          loop
          style={styles.sun}
        />
      </Animated.View>

      {children}
    </View>
  );
};

// Layout constraints: status bar (~50px), LUMI sign (~70–120px), then opaque
// greeting card from ~y=130 onward. Sun + cloud must sit above y=130 to stay
// visible. Balloon peeks from the LEFT edge (left: -60 pushes most of it
// off-screen) so its dome shows above the greeting card without being covered
// by the right-side cards. Cloud is narrowed (width: 155) so the Lottie only
// shows one puff at a time — avoids the "two clouds overlapping" look.
const styles = StyleSheet.create({
  root: { flex: 1, overflow: "hidden" },
  sun: {
    position: "absolute",
    top: 20,
    right: 4,
    width: 105,
    height: 105,
  },
  cloud: {
    position: "absolute",
    top: 68,
    left: -40,
    width: 155,
    height: 60,
  },
  balloon: {
    position: "absolute",
    top: 35,
    left: -60,
    width: 155,
    height: 215,
  },
});
