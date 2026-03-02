import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface PackCardProps {
  id: string;
  name: string;
  emoji: string;
  progress: number;
  total: number;
  isPremium?: boolean;
  isUnlocked?: boolean;
  onPress?: () => void;
}

export const PackCard = ({ name, emoji, progress, total, isPremium, isUnlocked = true, onPress }: PackCardProps) => {
  const isLocked = isPremium && !isUnlocked;

  return (
    <TouchableOpacity
      style={[styles.card, isLocked && styles.cardLocked]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isLocked}
    >
      {isLocked && (
        <View style={styles.lockOverlay}>
          <Text style={styles.lockIcon}>🔒</Text>
        </View>
      )}
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.packName} numberOfLines={1}>{name}</Text>
      <Text style={styles.progressText}>
        {isLocked ? 'Premium' : `Progress: ${progress} / ${total}`}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#E8E0FF',
    borderRadius: 20,
    padding: 12,
    margin: 6,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  cardLocked: {
    opacity: 0.6,
  },
  lockOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  lockIcon: { fontSize: 14 },
  emoji: { fontSize: 32, marginBottom: 6 },
  packName: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 15,
    color: '#1A1050',
    textAlign: 'center',
    marginBottom: 4,
  },
  progressText: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 12,
    color: '#7B6EA6',
    textAlign: 'center',
  },
});
