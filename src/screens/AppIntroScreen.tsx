// 📖 What this does:
// One-time App Introduction Guide shown after the first-launch onboarding.
// 4 slides (Scan, Playground, Parent Dashboard, Language) + a Skip link.
// On the Language slide the user picks English or Sinhala, which controls
// whether Sinhala word labels appear throughout the app.
// Persists introSeen + language preference to AsyncStorage via useLanguageStore.

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
import { useStrings } from '../hooks/useStrings';
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
  const { setLanguage, markIntroSeen, language } = useLanguageStore();

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
    markIntroSeen();
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
        onPress={finish}
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
            <Ionicons name="language-outline" size={48} color="#FFF" />
          </View>
          <Text style={styles.title}>{strings.INTRO_LANG_TITLE}</Text>
          <Text style={styles.body}>{strings.INTRO_LANG_BODY}</Text>
          <View style={styles.langRow}>
            <TouchableOpacity
              style={[
                styles.langBtn,
                selected === 'en' && styles.langBtnActive,
              ]}
              onPress={() => setSelected('en')}
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
              onPress={() => setSelected('si')}
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
          onPress={next}
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
