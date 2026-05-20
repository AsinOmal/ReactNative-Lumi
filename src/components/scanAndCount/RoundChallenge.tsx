import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { getWordEmoji } from '../../constants/packAccents';

interface RoundChallengeProps {
  targetWord: string;
  targetCount: number;
  currentRound: number;
  totalRounds: number;
  onDismiss: () => void;
}

export const RoundChallenge = ({
  targetWord,
  targetCount,
  currentRound,
  totalRounds,
  onDismiss,
}: RoundChallengeProps) => {
  const display = targetWord.charAt(0).toUpperCase() + targetWord.slice(1);
  const emoji = getWordEmoji(targetWord);

  useEffect(() => {
    const t = setTimeout(onDismiss, 2200);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <TouchableOpacity
      style={styles.overlay}
      onPress={onDismiss}
      activeOpacity={1}
      accessibilityLabel="Start round early"
      accessibilityRole="button"
    >
      <View style={styles.card}>
        <View style={styles.roundChip}>
          <Text style={styles.roundChipText}>Round {currentRound + 1} of {totalRounds}</Text>
        </View>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.find}>Find</Text>
        <Text style={styles.count}>{targetCount}</Text>
        <Text style={styles.word}>{display}{targetCount > 1 ? 's' : ''}!</Text>
        <Text style={styles.hint}>Tap to start early</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5,2,20,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFF8E8',
    borderRadius: 28,
    paddingHorizontal: 44,
    paddingVertical: 32,
    alignItems: 'center',
    gap: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(212,183,124,0.5)',
  },
  roundChip: {
    backgroundColor: 'rgba(255,154,46,0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,154,46,0.3)',
  },
  roundChipText: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 13,
    color: colors.primary,
  },
  emoji: { fontSize: 72, lineHeight: 80, marginBottom: 6 },
  find: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 22,
    color: colors.textMid,
    marginTop: 4,
  },
  count: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 80,
    color: colors.primary,
    lineHeight: 88,
  },
  word: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 30,
    color: colors.textDark,
    marginBottom: 16,
  },
  hint: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 13,
    color: colors.textLight,
  },
});
