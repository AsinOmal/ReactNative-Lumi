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
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useLanguageStore, type AppLanguage } from '../store/useLanguageStore';
import { useAuthStore } from '../store/useAuthStore';
import { markIntroSeenInFirestore } from '../services/userService';
import { useStrings } from '../hooks/useStrings';
import { stringsSi } from '../constants/stringsSi';
import { playUI } from '../utils/uiSound';
import { colors } from '../constants/colors';
import { styles, SLIDE_W } from './AppIntroScreenStyles';

interface SlidePill {
  iconName: string;
  label: string;
}
interface Slide {
  icon: string;
  title: string;
  body: string;
  art?: ReturnType<typeof require>; // optional hero image — replaces the icon
  artLarge?: boolean; // when true, render the hero art at a larger size
  step?: number; // optional "Step N" badge above the title
  pills?: SlidePill[]; // optional 2-pill feature row under the body
}

const CAROUSEL_BG = require('../assets/backgrounds/onboarding-carousel.png');

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
      art: require('../assets/images/point-discover-art.png'),
      step: 1,
      pills: [
        { iconName: 'scan-outline', label: strings.INTRO_SCAN_PILL_TAP },
        { iconName: 'locate-outline', label: strings.INTRO_SCAN_PILL_POINT },
      ],
    },
    {
      icon: 'game-controller-outline',
      title: strings.INTRO_PLAYGROUND_TITLE,
      body: strings.INTRO_PLAYGROUND_BODY,
      art: require('../assets/images/play-ar-games-art.png'),
      step: 2,
      pills: [
        { iconName: 'locate-outline', label: strings.INTRO_PLAY_PILL_HUNT },
        {
          iconName: 'restaurant-outline',
          label: strings.INTRO_PLAY_PILL_COOK,
        },
      ],
    },
    {
      icon: 'shield-checkmark-outline',
      title: strings.INTRO_PARENT_TITLE,
      body: strings.INTRO_PARENT_BODY,
      art: require('../assets/images/made-for-families-art.png'),
      artLarge: true,
      step: 3,
      pills: [
        { iconName: 'time-outline', label: strings.INTRO_FAMILY_PILL_TIME },
        {
          iconName: 'analytics-outline',
          label: strings.INTRO_FAMILY_PILL_ACTIVITY,
        },
      ],
    },
  ];
  const totalSlides = contentSlides.length + 1; // +1 for language slide
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<AppLanguage>(language);
  const isLastSlide = current === totalSlides - 1;

  // Drives the panoramic background: image translateX = -scrollX so each
  // slide reveals a different region of the 4×-screen-wide artwork. useNative
  // driver keeps it 60fps without crossing the bridge per frame.
  const scrollX = useRef(new Animated.Value(0)).current;

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

  // Keep `current` in sync when the user swipes (rather than tapping Next).
  // Without this, the dots indicator and the "Let's Go" CTA state would lag
  // behind the actual visible slide.
  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SLIDE_W);
    if (idx !== current) {
      setCurrent(idx);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      <Animated.Image
        source={CAROUSEL_BG}
        resizeMode="cover"
        style={[
          styles.panoramicBg,
          {
            width: SLIDE_W * totalSlides,
            transform: [{ translateX: Animated.multiply(scrollX, -1) }],
          },
        ]}
        accessibilityIgnoresInvertColors
      />
      <View style={styles.bgOverlay} pointerEvents="none" />

      <TouchableOpacity
        style={[styles.skip, { top: insets.top + 8 }]}
        onPress={() => {
          playUI('tap');
          finish();
        }}
        accessibilityLabel="Skip intro"
        accessibilityRole="button"
      >
        <Text style={styles.skipText}>{strings.INTRO_SKIP}</Text>
        <Ionicons name="chevron-forward" size={14} color={colors.primary} />
      </TouchableOpacity>

      <Animated.ScrollView
        ref={scrollRef as any}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onScrollEnd}
        style={styles.scroll}
      >
        {contentSlides.map((slide, i) => (
          <View key={i} style={styles.slide}>
            <View style={styles.slideMedia}>
              {slide.art ? (
                <Image
                  source={slide.art}
                  style={[styles.heroArt, slide.artLarge && styles.heroArtLg]}
                  resizeMode="contain"
                  accessibilityIgnoresInvertColors
                />
              ) : (
                <View style={styles.iconWrap}>
                  <Ionicons name={slide.icon} size={48} color="#FFF" />
                </View>
              )}
            </View>
            <View style={styles.textPanel}>
              {slide.step !== undefined && (
                <View style={styles.stepBadge}>
                  <Text style={styles.stepText}>
                    {strings.INTRO_STEP_LABEL(slide.step)}
                  </Text>
                </View>
              )}
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.body}>{slide.body}</Text>
              {slide.pills && (
                <View style={styles.pillRow}>
                  {slide.pills.map((pill, pi) => (
                    <View key={pi} style={styles.featurePill}>
                      <View style={styles.featurePillIcon}>
                        <Ionicons
                          name={pill.iconName}
                          size={14}
                          color={colors.primary}
                        />
                      </View>
                      <Text style={styles.featurePillText} numberOfLines={1}>
                        {pill.label}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}

        {/* Language slide */}
        <View style={styles.slide}>
          <View style={styles.slideMedia}>
            {/* Hero art swaps to mirror the currently picked language so the
                user gets immediate visual feedback that their tap registered.
                Pre-required at build time so both images are bundled and the
                swap has no network/IO delay. */}
            <Image
              source={
                selected === 'si'
                  ? require('../assets/images/choose-lang-sinhala.png')
                  : require('../assets/images/choose-lang-english.png')
              }
              style={styles.heroArt}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
          </View>
          <View style={styles.textPanel}>
            <Text style={styles.title}>{strings.INTRO_LANG_TITLE}</Text>
            <Text style={styles.body}>{strings.INTRO_LANG_BODY}</Text>
          </View>
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
          {/* Always rendered so the slide's centered flex column has a fixed
              total height — otherwise picking Sinhala adds the disclaimer
              and pushes the hero art upward, breaking visual continuity
              between EN/SI taps. Opacity toggle + pointerEvents keeps it
              inert and hidden when English is selected. */}
          <View
            style={[
              styles.disclaimer,
              selected !== 'si' && styles.disclaimerHidden,
            ]}
            pointerEvents={selected === 'si' ? 'auto' : 'none'}
          >
            <Ionicons
              name="information-circle"
              size={18}
              color={colors.primary}
            />
            {/* Disclaimer text always in Sinhala — it only matters when the
                user has picked Sinhala, and the store hasn't been updated
                yet (that happens on "Let's Go"), so reach into the SI
                bundle directly. */}
            <Text style={styles.disclaimerText}>
              {stringsSi.INTRO_LANG_DISCLAIMER}
            </Text>
          </View>
        </View>
      </Animated.ScrollView>

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
