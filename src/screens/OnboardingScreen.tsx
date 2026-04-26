// 📖 What this does:
// 3-slide first-launch walkthrough. Shown once before the auth gate.
// Last slide requests camera + notification permissions then marks onboarding done.
// Uses a horizontal paging ScrollView — no extra library needed.

import React, { useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StatusBar, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Camera } from 'react-native-vision-camera';
import { LumiMascot } from '../components/common/LumiMascot';
import { markOnboardingDone } from '../utils/onboardingStore';
import { requestNotificationPermission } from '../services/notificationService';
import { styles, SLIDE_W } from './OnboardingScreenStyles';

interface Slide {
  gradient: string[];
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const SLIDES: Slide[] = [
  {
    gradient: ['#7B3FC4', '#9C59D6'],
    icon: <LumiMascot state="celebrate" size={110} />,
    title: 'Welcome to Lumi!',
    desc: 'Learn new words by exploring the world around you with augmented reality.',
  },
  {
    gradient: ['#FF6B6B', '#F97316'],
    icon: <MaterialCommunityIcons name="camera-iris" size={80} color="#FFF" />,
    title: 'Scan to Learn',
    desc: 'Point your camera at any printed word. Lumi will show you a 3D model and teach you how to say it.',
  },
  {
    gradient: ['#4ECDC4', '#0D9488'],
    icon: <MaterialCommunityIcons name="gamepad-variant-outline" size={80} color="#FFF" />,
    title: 'Play & Collect',
    desc: 'Play AR games, save favourite words, and earn achievements as you explore!',
  },
];

interface Props {
  onComplete: () => void;
}

export const OnboardingScreen = ({ onComplete }: Props) => {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [currentIdx, setCurrentIdx] = useState(0);

  const goNext = async () => {
    if (currentIdx < SLIDES.length - 1) {
      const next = currentIdx + 1;
      scrollRef.current?.scrollTo({ x: next * SLIDE_W, animated: true });
      setCurrentIdx(next);
    } else {
      await Camera.requestCameraPermission();
      await requestNotificationPermission();
      await markOnboardingDone();
      onComplete();
    }
  };

  const isLast = currentIdx === SLIDES.length - 1;
  const slide  = SLIDES[currentIdx];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={styles.pager}
      >
        {SLIDES.map((s, i) => (
          <LinearGradient key={i} colors={s.gradient} style={styles.slide}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              {s.icon}
            </View>
            <Text style={styles.slideTitle}>{s.title}</Text>
            <Text style={styles.slideDesc}>{s.desc}</Text>
          </LinearGradient>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        {/* Dot indicators */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <Animated.View
              key={i}
              style={[styles.dot, i === currentIdx ? styles.dotActive : null, { width: i === currentIdx ? 24 : 8 }]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: slide.gradient[0] }]}
          onPress={goNext}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>{isLast ? 'Get Started' : 'Next'}</Text>
          <Ionicons name={isLast ? 'rocket-outline' : 'arrow-forward'} size={22} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
