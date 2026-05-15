// 📖 What this does:
// Renders a single onboarding slide: themed gradient + decorative Lotties +
// floating mascot + title + description. Lives in its own component so
// OnboardingScreen stays under the 150-line rule and so slide composition
// stays declarative (just pass props per theme).

import React from 'react';
import { Text, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import { LumiMascot, MascotState } from '../common/LumiMascot';
import { styles } from '../../screens/OnboardingScreenStyles';

const SPARKLE = require('../../assets/lottie/sparkle.json');
const SUN = require('../../assets/lottie/sun.json');
const CLOUD = require('../../assets/lottie/cloud-drift.json');

interface Props {
  gradient: string[];
  mascot: MascotState;
  title: string;
  desc: string;
  // Slide 0 only — sky theme uses sun + cloud on top of the sparkle layer
  showSky?: boolean;
  translateY: Animated.Value;
}

export const OnboardingSlide: React.FC<Props> = ({
  gradient,
  mascot,
  title,
  desc,
  showSky,
  translateY,
}) => (
  <LinearGradient colors={gradient} style={styles.slide}>
    {showSky && (
      <>
        <LottieView source={SUN} autoPlay loop style={styles.decoSun} />
        <LottieView
          source={CLOUD}
          autoPlay
          loop
          speed={0.5}
          style={styles.decoCloud}
        />
      </>
    )}
    <LottieView source={SPARKLE} autoPlay loop style={styles.decoTL} />
    <LottieView
      source={SPARKLE}
      autoPlay
      loop
      speed={0.8}
      style={styles.decoTR}
    />
    <LottieView
      source={SPARKLE}
      autoPlay
      loop
      speed={1.2}
      style={styles.decoBL}
    />
    <LottieView
      source={SPARKLE}
      autoPlay
      loop
      speed={0.7}
      style={styles.decoBR}
    />
    <Animated.View
      style={[styles.mascotWrapper, { transform: [{ translateY }] }]}
    >
      <LumiMascot state={mascot} size={220} />
    </Animated.View>
    <Text style={styles.slideTitle}>{title}</Text>
    <Text style={styles.slideDesc}>{desc}</Text>
  </LinearGradient>
);
