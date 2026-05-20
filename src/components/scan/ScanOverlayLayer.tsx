import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import LottieView from 'lottie-react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../../screens/ScanScreenStyles';
import { SyllablePlayer } from '../../components/ar/SyllablePlayer';
import { SpellCorrectionBadge } from '../../components/ar/SpellCorrectionBadge';
import { getModel } from '../../utils/modelRegistry';
import { getRandomFact } from '../../utils/wordFacts';
import { getWordPackLabel, getWordPackEmoji } from '../../constants/packAccents';
import { MatchResult } from '../../utils/wordMatcher';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useStrings } from '../../hooks/useStrings';
import { colors } from '../../constants/colors';
import { triggerHaptic } from '../../hooks/useHaptic';

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
// Animated bottom sheet that appears when a word is matched in AR. Shows the
// word title (with pack emoji), pronunciation pill, fun fact, and action buttons.
// Place is the primary CTA; Save is secondary; X closes.
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
  const packLabel = getWordPackLabel(activeWord);
  const packEmoji = getWordPackEmoji(activeWord);
  const [showConfetti, setShowConfetti] = useState(false);
  const language = useLanguageStore((s) => s.language);
  const sinhalaLabel = getModel(activeWord)?.sinhalaLabel;
  const wordDisplay = activeWord.charAt(0).toUpperCase() + activeWord.slice(1);

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

      {/* Title row: pack emoji + word + pack label */}
      <View style={styles.resultCardRow}>
        {packEmoji ? (
          <Text style={styles.wordEmoji}>{packEmoji}</Text>
        ) : null}
        <View style={styles.resultWordBlock}>
          <Text style={styles.resultWord}>{wordDisplay}</Text>
          {language === 'si' && sinhalaLabel ? (
            <Text style={styles.sinhalaLabel}>{sinhalaLabel}</Text>
          ) : null}
          {packLabel ? (
            <Text style={styles.resultPack}>{packLabel}</Text>
          ) : null}
        </View>
      </View>

      {/* Pronunciation pill */}
      <SyllablePlayer entry={getModel(activeWord)} />

      {matchResult?.isCorrection && (
        <SpellCorrectionBadge
          scannedAs={matchResult.scannedAs}
          correct={matchResult.word}
        />
      )}

      {/* Fun fact */}
      <View style={styles.factBox}>
        <Ionicons
          name="bulb-outline"
          size={16}
          color="#C8840A"
          style={styles.factIcon}
        />
        <Text style={styles.factText}>{fact}</Text>
      </View>

      {/* Actions: [X]  [Place Word — primary]  [Save — secondary] */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.dismissBtn}
          onPress={onDismiss}
          accessibilityLabel="Dismiss word card"
          accessibilityRole="button"
        >
          <Ionicons name="close" size={20} color={colors.textMid} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.placeBtn}
          onPress={onPlace}
          activeOpacity={0.8}
          accessibilityLabel={`Place ${wordDisplay}`}
          accessibilityRole="button"
        >
          <Ionicons name="cube-outline" size={18} color="#FFF" />
          <Text style={styles.placeBtnText}>Place {wordDisplay}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveBtn, isWordSaved && styles.saveBtnDisabled]}
          onPress={onSave}
          activeOpacity={0.8}
          accessibilityLabel={isWordSaved ? 'Word already saved' : `Save ${activeWord}`}
          accessibilityRole="button"
        >
          <Ionicons
            name={isWordSaved ? 'star' : 'star-outline'}
            size={16}
            color={colors.primary}
          />
          <Text style={[styles.saveBtnText, isWordSaved && styles.saveBtnTextDisabled]}>
            {isWordSaved ? strings.wordSaved : strings.saveWord}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};
