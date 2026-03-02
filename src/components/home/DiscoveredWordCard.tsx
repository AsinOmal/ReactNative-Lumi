import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface DiscoveredWordCardProps {
  word: string;
  emoji: string;
  onPress?: () => void;
}

export const DiscoveredWordCard = ({ word, emoji, onPress }: DiscoveredWordCardProps) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.word}>{word}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#E8E0FF',
    borderRadius: 20,
    padding: 16,
    margin: 6,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  emoji: { fontSize: 40, marginBottom: 8 },
  word: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 16,
    color: '#1A1050',
    textAlign: 'center',
  },
});
