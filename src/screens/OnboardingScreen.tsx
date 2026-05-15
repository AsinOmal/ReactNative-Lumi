// 📖 What this does:
// 3-slide first-launch walkthrough with theme-specific gradient scenes
// (sky / forest / space) and a Lumi mascot per slide that floats and reacts.
// Why the structure: paging ScrollView with scrollEnabled=false keeps slide
// transitions driver-agnostic (works on iOS + Android the same way) and lets
// us own pagination via the LumiButton CTA. Each slide instantiates its own
// LumiMascot so each Lottie one-shot replays naturally on revisit.

import React, { useRef, useState } from 'react';
import { View, ScrollView, StatusBar, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera } from 'react-native-vision-camera';
import { MascotState } from '../components/common/LumiMascot';
import { LumiButton } from '../components/common/LumiButton';
import { OnboardingSlide } from '../components/onboarding/OnboardingSlide';
import { useFloatLoop } from '../hooks/useFloatLoop';
import { markOnboardingDone } from '../utils/onboardingStore';
import { requestNotificationPermission } from '../services/notificationService';
import { colors } from '../constants/colors';
import { useStrings } from '../hooks/useStrings';
import { styles, SLIDE_W } from './OnboardingScreenStyles';

interface Slide {
  gradient: string[];
  mascot: MascotState;
  title: string;
  desc: string;
}

interface Props {
  onComplete: () => void;
}

export const OnboardingScreen = ({ onComplete }: Props) => {
  const strings = useStrings();
  // Forest + space gradients are scene-specific — kept inline to avoid polluting global token set.
  const SLIDES: Slide[] = [
    {
      gradient: [colors.skyTop, colors.skyMid, colors.skyBottom],
      mascot: 'wave',
      title: strings.onboardingSlide0Title,
      desc: strings.onboardingSlide0Desc,
    },
    {
      gradient: ['#2D8C4E', '#4CAF50', '#81C784'],
      mascot: 'excited',
      title: strings.onboardingSlide1Title,
      desc: strings.onboardingSlide1Desc,
    },
    {
      gradient: ['#1A1A4E', '#2D2D7E', '#4A4AB5'],
      mascot: 'celebrate',
      title: strings.onboardingSlide2Title,
      desc: strings.onboardingSlide2Desc,
    },
  ];
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const translateY = useFloatLoop();

  const goNext = async () => {
    try {
      if (currentIdx < SLIDES.length - 1) {
        const next = currentIdx + 1;
        scrollRef.current?.scrollTo({ x: next * SLIDE_W, animated: true });
        setCurrentIdx(next);
        return;
      }
      await Camera.requestCameraPermission();
      await requestNotificationPermission();
      await markOnboardingDone();
      onComplete();
    } catch (error) {
      console.error('[OnboardingScreen] goNext failed:', error);
    }
  };

  const isLast = currentIdx === SLIDES.length - 1;

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
          <OnboardingSlide
            key={i}
            gradient={s.gradient}
            mascot={s.mascot}
            title={s.title}
            desc={s.desc}
            showSky={i === 0}
            translateY={translateY}
          />
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                i === currentIdx ? styles.dotActive : null,
                { width: i === currentIdx ? 24 : 8 },
              ]}
            />
          ))}
        </View>

        <LumiButton
          title={isLast ? strings.onboardingGetStarted : strings.onboardingNext}
          onPress={goNext}
          icon={isLast ? 'rocket-outline' : 'arrow-forward'}
        />
      </View>
    </View>
  );
};
