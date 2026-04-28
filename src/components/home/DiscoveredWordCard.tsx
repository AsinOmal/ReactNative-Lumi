import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/colors';

interface DiscoveredWordCardProps {
  word: string;
  emoji: string;
  onPress?: () => void;
}

export const DiscoveredWordCard = ({ word, emoji, onPress }: DiscoveredWordCardProps) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8} accessibilityLabel={word} accessibilityRole="button">
    <Text style={styles.emoji}>{emoji}</Text>
    <Text style={styles.word}>{word}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#EDE9FE',
    borderRadius: 24,
    padding: 16,
    margin: 6,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  emoji: { fontSize: 40, marginBottom: 8 },
  word: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 16,
    color: colors.textDark,
    textAlign: 'center',
  },
});
