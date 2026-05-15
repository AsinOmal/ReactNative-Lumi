// 📖 What this does:
// Single-image parallax background used on HomeScreen. The bg.png covers
// the full screen and drifts slowly upward as the FlatList scrolls,
// producing a subtle depth illusion without the cost/complexity of the
// previous 5-layer composite. A semi-transparent white veil sits above
// the image to soften contrast so foreground UI stays legible. The sun
// Lottie sits above the veil as an animated accent.

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import LottieView from 'lottie-react-native';

const { width: W, height: H } = Dimensions.get('window');
// Give the image extra vertical room so the upward parallax drift never
// exposes a bottom gap as scrollY grows. resizeMode='cover' fills the
// box; the slight horizontal crop is acceptable on the home artwork.
const BG_H = H + 120;

interface Props {
  scrollY?: Animated.Value;
  paused?: boolean;
  children?: React.ReactNode;
  style?: ViewStyle;
}

export const ParallaxScene: React.FC<Props> = ({
  scrollY,
  paused = false,
  children,
  style,
}) => {
  const fallbackY = useRef(new Animated.Value(0)).current;
  const sunRef = useRef<LottieView>(null);
  const Y = scrollY ?? fallbackY;

  const bgDrift = Y.interpolate({
    inputRange: [0, 500],
    outputRange: [0, -80],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    if (paused) {
      sunRef.current?.pause();
    } else {
      sunRef.current?.play();
    }
  }, [paused]);

  return (
    <View style={[styles.root, style]}>
      <Animated.View
        style={[styles.bgWrap, { transform: [{ translateY: bgDrift }] }]}
      >
        <Image
          source={require('../../assets/backgrounds/bg.png')}
          style={styles.bgImg}
          resizeMode="cover"
        />
      </Animated.View>

      {/* White veil softens the image so foreground UI reads cleanly */}
      <View style={styles.veil} pointerEvents="none" />

      {/* Animated sun accent — sits above veil, below content */}
      <LottieView
        ref={sunRef}
        source={require('../../assets/lottie/sun.json')}
        autoPlay
        loop
        style={styles.sun}
      />

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  bgWrap: { position: 'absolute', top: 0, left: 0, right: 0, height: BG_H },
  bgImg: { width: W, height: BG_H },
  veil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.17)',
  },
  sun: { position: 'absolute', top: 20, right: 4, width: 105, height: 105 },
});
