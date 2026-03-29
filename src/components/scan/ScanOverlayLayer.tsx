import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../../screens/ScanScreenStyles';
import { SyllablePlayer } from '../../components/ar/SyllablePlayer';
import { SpellCorrectionBadge } from '../../components/ar/SpellCorrectionBadge';
import { getModel } from '../../utils/modelRegistry';
import { getRandomFact } from '../../utils/wordFacts';
import { MatchResult } from '../../utils/wordMatcher';
import { strings } from '../../constants/strings';

interface ScanOverlayLayerProps {
  activeWord: string;
  cardAnim: Animated.Value;
  matchResult: MatchResult | null;
  isWordSaved: boolean;
  onDismiss: () => void;
  onSave: () => void;
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
}: ScanOverlayLayerProps) => {
  const fact = getRandomFact(activeWord);

  return (
    <Animated.View style={[styles.resultCard, { transform: [{ translateY: cardAnim }] }]}>
      <View style={styles.resultCardHandle} />
      <View style={styles.resultCardRow}>
        <View style={styles.resultWordBlock}>
          <Text style={styles.resultWord}>
            {activeWord.charAt(0).toUpperCase() + activeWord.slice(1)}
          </Text>
          <Text style={styles.resultPack}>{strings.fruitsPackName}</Text>
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
        <TouchableOpacity style={styles.dismissBtn} onPress={onDismiss}>
          <Ionicons name="close" size={20} color="#5B2DC0" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveBtn, isWordSaved && styles.saveBtnDisabled]}
          onPress={onSave}
          activeOpacity={0.8}
        >
          <Ionicons name="star" size={18} color={isWordSaved ? '#A78BFA' : '#fff'} />
          <Text style={[styles.saveBtnText, isWordSaved && styles.saveBtnTextDisabled]}>
            {isWordSaved ? strings.wordSaved : strings.saveWord}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};
