import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import LottieView from 'lottie-react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../../screens/ScanScreenStyles';
import { SyllablePlayer } from '../../components/ar/SyllablePlayer';
import { SpellCorrectionBadge } from '../../components/ar/SpellCorrectionBadge';
import { getModel } from '../../utils/modelRegistry';
import { getRandomFact } from '../../utils/wordFacts';
import { MatchResult } from '../../utils/wordMatcher';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useStrings } from '../../hooks/useStrings';
import { colors } from '../../constants/colors';
import { PACK_WORDS } from '../../constants/packWords';
import { triggerHaptic } from '../../hooks/useHaptic';

function getPackLabel(word: string): string {
  for (const [pack, words] of Object.entries(PACK_WORDS)) {
    if (words.includes(word)) {
      return pack.charAt(0).toUpperCase() + pack.slice(1) + ' Pack';
    }
  }
  return '';
}

interface ScanOverlayLayerProps {
  activeWord: string;
  cardAnim: Animated.Value;
  matchResult: MatchResult | null;
  isWordSaved: boolean;
  onDismiss: () => void;
  onSave: () => void;
  onPlace: () => void;
}

// 📖 What this does:
// This is the animated bottom sheet that pops up when a word is matched and viewed in AR.
// It shows the word, its pack, pronunciation syllables, spell correction if applicable,
// a fun fact, and the save button.
export const ScanOverlayLayer = ({
  activeWord,
  cardAnim,
  matchResult,
  isWordSaved,
  onDismiss,
  onSave,
  onPlace,
}: ScanOverlayLayerProps) => {
  const strings = useStrings();
  const fact = getRandomFact(activeWord);
  const packLabel = getPackLabel(activeWord);
  const [showConfetti, setShowConfetti] = useState(false);
  const language = useLanguageStore((s) => s.language);
  const sinhalaLabel = getModel(activeWord)?.sinhalaLabel;

  useEffect(() => {
    setShowConfetti(true);
    triggerHaptic('medium');
  }, [activeWord]);

  return (
    <Animated.View
      style={[styles.resultCard, { transform: [{ translateY: cardAnim }] }]}
    >
      {showConfetti && (
        <LottieView
          source={require('../../assets/lottie/confetti.json')}
          autoPlay
          loop={false}
          style={styles.confettiAnim}
          onAnimationFinish={() => setShowConfetti(false)}
        />
      )}
      <View style={styles.resultCardHandle} />
      <View style={styles.resultCardRow}>
        <View style={styles.resultWordBlock}>
          <Text style={styles.resultWord}>
            {activeWord.charAt(0).toUpperCase() + activeWord.slice(1)}
          </Text>
          {language === 'si' && sinhalaLabel ? (
            <Text style={styles.sinhalaLabel}>{sinhalaLabel}</Text>
          ) : null}
          {packLabel ? (
            <Text style={styles.resultPack}>{packLabel}</Text>
          ) : null}
        </View>
      </View>

      {/* Pronunciation + syllable chips */}
      <SyllablePlayer entry={getModel(activeWord)} />

      {/* Spell correction badge — only shows on Levenshtein distance=2 matches */}
      {matchResult?.isCorrection && (
        <SpellCorrectionBadge
          scannedAs={matchResult.scannedAs}
          correct={matchResult.word}
        />
      )}

      <View style={styles.factBox}>
        <Text style={styles.factText}>{fact}</Text>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.dismissBtn}
          onPress={onDismiss}
          accessibilityLabel="Dismiss word card"
          accessibilityRole="button"
        >
          <Ionicons name="close" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.placeBtn}
          onPress={onPlace}
          activeOpacity={0.8}
          accessibilityLabel={strings.AR_PLACE_BUTTON}
          accessibilityRole="button"
        >
          <Ionicons name="cube-outline" size={18} color={colors.primary} />
          <Text style={styles.placeBtnText}>{strings.AR_PLACE_BUTTON}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveBtn, isWordSaved && styles.saveBtnDisabled]}
          onPress={onSave}
          activeOpacity={0.8}
          accessibilityLabel={
            isWordSaved ? 'Word already saved' : `Save ${activeWord}`
          }
          accessibilityRole="button"
        >
          <Ionicons
            name="star"
            size={18}
            color={isWordSaved ? '#A78BFA' : '#fff'}
          />
          <Text
            style={[
              styles.saveBtnText,
              isWordSaved && styles.saveBtnTextDisabled,
            ]}
          >
            {isWordSaved ? strings.wordSaved : strings.saveWord}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};
