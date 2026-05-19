import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../constants/colors';
import { buttonGradientColors } from '../../constants/skeuomorphicTokens';
import { usePulseLoop } from '../../hooks/usePulseLoop';
import { playUI } from '../../utils/uiSound';
import { WordIllustration } from './WordIllustration';
import { styles } from './DailyWordBannerStyles';

interface Props {
  word: string;
  isFound: boolean;
}

export const DailyWordBanner: React.FC<Props> = ({ word, isFound }) => {
  const navigation = useNavigation();
  const [playFlip, setPlayFlip] = useState(false);
  const pulse = usePulseLoop();

  useEffect(() => {
    if (isFound) {
      setPlayFlip(true);
    }
  }, [isFound]);

  // Defensive: if packs are still loading on first launch the daily-word
  // pool may be empty and `word` arrives as undefined or ''. Hide the banner
  // instead of crashing on charAt — it re-renders to the real banner once
  // the pack store hydrates. Hooks must run before this early return so the
  // hook-call count stays stable across re-renders (Rules of Hooks).
  if (!word) {
    return null;
  }
  const display = word.charAt(0).toUpperCase() + word.slice(1);

  const sparkleColor = isFound
    ? 'rgba(5,150,105,0.25)'
    : 'rgba(180,140,0,0.22)';

  return (
    <View style={[styles.card, isFound && styles.cardFound]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0)']}
        style={[StyleSheet.absoluteFill, styles.sheen]}
        pointerEvents="none"
      />
      <Ionicons
        name="sparkles"
        size={13}
        color={sparkleColor}
        style={styles.s1}
      />
      <Ionicons
        name="sparkles"
        size={8}
        color={sparkleColor}
        style={styles.s2}
      />
      <Ionicons
        name="sparkles"
        size={11}
        color={sparkleColor}
        style={styles.s3}
      />
      <Ionicons
        name="sparkles"
        size={7}
        color={sparkleColor}
        style={styles.s4}
      />

      {!isFound && <WordIllustration word={word} size={72} />}
      <View style={styles.left}>
        <Text style={styles.label}>
          {isFound ? '✓ Found today!' : "— Today's Word —"}
        </Text>
        <View style={styles.speakerRow}>
          <Text style={styles.word}>{display}</Text>
        </View>
        {isFound && (
          <View style={styles.doneRow}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={colors.successDark}
            />
            <Text style={styles.doneText}>Well done!</Text>
          </View>
        )}
      </View>

      {!isFound && (
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <TouchableOpacity
            onPress={() => {
              playUI('tap');
              (navigation as any).navigate('Scan');
            }}
            activeOpacity={0.85}
            accessibilityLabel={`Find today's word: ${display}`}
            accessibilityRole="button"
            style={styles.scanBtnShadow}
          >
            <View style={styles.scanBtnOuter}>
              <View style={styles.scanBtnInner}>
                <LinearGradient
                  colors={buttonGradientColors.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.scanBtnContent}
                >
                  <LinearGradient
                    colors={buttonGradientColors.sheen}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 0.6 }}
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                  />
                  <Ionicons name="camera" size={26} color="#FFF" />
                  <Text style={styles.scanBtnText}>Find it</Text>
                </LinearGradient>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}
      {isFound && !playFlip && (
        <View style={styles.checkCircle}>
          <Ionicons
            name="checkmark-circle"
            size={42}
            color={colors.successDark}
          />
        </View>
      )}
      {playFlip && (
        <LottieView
          source={require('../../assets/lottie/page-flip.json')}
          autoPlay
          loop={false}
          style={styles.flipAnim}
          onAnimationFinish={() => setPlayFlip(false)}
        />
      )}
    </View>
  );
};
