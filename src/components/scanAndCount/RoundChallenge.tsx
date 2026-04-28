import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface RoundChallengeProps {
  targetWord: string;
  targetCount: number;
  currentRound: number;
  totalRounds: number;
  onDismiss: () => void;
}

export const RoundChallenge = ({ targetWord, targetCount, currentRound, totalRounds, onDismiss }: RoundChallengeProps) => {
  const display = targetWord.charAt(0).toUpperCase() + targetWord.slice(1);

  useEffect(() => {
    const t = setTimeout(onDismiss, 2000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <TouchableOpacity style={styles.overlay} onPress={onDismiss} activeOpacity={1} accessibilityLabel="Start round early" accessibilityRole="button">
      <View style={styles.card}>
        <Text style={styles.round}>Round {currentRound + 1} of {totalRounds}</Text>
        <MaterialCommunityIcons name="cube-outline" size={64} color="#A78BFA" style={styles.icon} />
        <Text style={styles.instruction}>Find</Text>
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
    backgroundColor: 'rgba(10,5,40,0.88)',
    alignItems: 'center', justifyContent: 'center',
  },
  card: {
    backgroundColor: '#1A1050', borderRadius: 28,
    paddingHorizontal: 44, paddingVertical: 36,
    alignItems: 'center', gap: 4,
    shadowColor: '#5B2DC0', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45, shadowRadius: 20,
  },
  round: { fontFamily: 'Fredoka-Regular', fontSize: 14, color: '#9B87CC', marginBottom: 8 },
  icon: { marginBottom: 4 },
  instruction: { fontFamily: 'Fredoka-Regular', fontSize: 22, color: '#C4B5FD' },
  count: { fontFamily: 'Fredoka-Bold', fontSize: 80, color: '#FFFFFF', lineHeight: 88 },
  word: { fontFamily: 'Fredoka-Bold', fontSize: 28, color: '#A78BFA', marginBottom: 20 },
  hint: { fontFamily: 'Fredoka-Regular', fontSize: 13, color: '#7B6EA6' },
});
