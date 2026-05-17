// 📖 What this does:
// One-time App Introduction Guide shown after the first-launch onboarding.
// 4 slides (Scan, Playground, Parent Dashboard, Language) + a Skip link.
// On the Language slide the user picks English or Sinhala, which controls
// whether Sinhala word labels appear throughout the app.
// Persists language preference to AsyncStorage (device-level) and the
// introSeen flag to /users/{uid} (per-user, survives sign-out).

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useLanguageStore, type AppLanguage } from '../store/useLanguageStore';
import { useAuthStore } from '../store/useAuthStore';
import { markIntroSeenInFirestore } from '../services/userService';
import { useStrings } from '../hooks/useStrings';
import { playUI } from '../utils/uiSound';
import { styles, SLIDE_W } from './AppIntroScreenStyles';

interface Slide {
  icon: string;
  title: string;
  body: string;
}

export const AppIntroScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const strings = useStrings();
  const { setLanguage, language } = useLanguageStore();
  const { user, setIntroSeen } = useAuthStore();

  const contentSlides: Slide[] = [
    {
      icon: 'scan-outline',
      title: strings.INTRO_SCAN_TITLE,
      body: strings.INTRO_SCAN_BODY,
    },
    {
      icon: 'game-controller-outline',
      title: strings.INTRO_PLAYGROUND_TITLE,
      body: strings.INTRO_PLAYGROUND_BODY,
    },
    {
      icon: 'shield-checkmark-outline',
      title: strings.INTRO_PARENT_TITLE,
      body: strings.INTRO_PARENT_BODY,
    },
  ];
  const totalSlides = contentSlides.length + 1; // +1 for language slide
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<AppLanguage>(language);
  const isLastSlide = current === totalSlides - 1;

  const finish = () => {
    setLanguage(selected);
    setIntroSeen(true);
    if (user) {
      markIntroSeenInFirestore(user.uid).catch(() => {});
    }
    // AppRoutes re-renders on introSeen change — no explicit navigate needed.
  };

  const next = () => {
    if (isLastSlide) {
      finish();
      return;
    }
    const nextIdx = current + 1;
    setCurrent(nextIdx);
    scrollRef.current?.scrollTo({ x: nextIdx * SLIDE_W, animated: true });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <TouchableOpacity
        style={[styles.skip, { top: insets.top + 8 }]}
        onPress={() => {
          playUI('tap');
          finish();
        }}
      >
        <Text style={styles.skipText}>{strings.INTRO_SKIP}</Text>
      </TouchableOpacity>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
      >
        {contentSlides.map((slide, i) => (
          <View key={i} style={styles.slide}>
            <View style={styles.iconWrap}>
              <Ionicons name={slide.icon} size={48} color="#FFF" />
            </View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.body}>{slide.body}</Text>
          </View>
        ))}

        {/* Language slide */}
        <View style={styles.slide}>
          <View style={styles.iconWrap}>
            {/* Show the alphabet glyph that represents the currently picked
                language — keeps the screen consistent with what the toggle
                does. The Ionicons 'language-outline' default reads as a
                CJK glyph which is misleading for an EN/SI choice. */}
            <Text
              style={[
                styles.langGlyph,
                selected === 'si' && styles.langGlyphSinhala,
              ]}
            >
              {selected === 'si' ? 'අ' : 'A'}
            </Text>
          </View>
          <Text style={styles.title}>{strings.INTRO_LANG_TITLE}</Text>
          <Text style={styles.body}>{strings.INTRO_LANG_BODY}</Text>
          <View style={styles.langRow}>
            <TouchableOpacity
              style={[
                styles.langBtn,
                selected === 'en' && styles.langBtnActive,
              ]}
              onPress={() => {
                playUI('tap');
                setSelected('en');
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected: selected === 'en' }}
            >
              <Text
                style={[
                  styles.langBtnText,
                  selected === 'en' && styles.langBtnTextActive,
                ]}
              >
                {strings.INTRO_LANG_ENGLISH}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.langBtn,
                selected === 'si' && styles.langBtnActive,
              ]}
              onPress={() => {
                playUI('tap');
                setSelected('si');
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected: selected === 'si' }}
            >
              <Text
                style={[
                  styles.langBtnText,
                  selected === 'si' && styles.langBtnTextActive,
                ]}
              >
                {strings.INTRO_LANG_SINHALA}
              </Text>
            </TouchableOpacity>
          </View>
          {selected === 'si' && (
            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>
                {strings.INTRO_LANG_DISCLAIMER}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.dots}>
          {Array.from({ length: totalSlides }).map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === current && styles.dotActive]}
            />
          ))}
        </View>
        <TouchableOpacity
          style={styles.cta}
          onPress={() => {
            playUI('tap');
            next();
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>
            {isLastSlide ? strings.INTRO_LETS_GO : strings.INTRO_NEXT}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
