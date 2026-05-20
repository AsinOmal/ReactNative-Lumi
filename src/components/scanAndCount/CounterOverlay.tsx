// 📖 What this does:
// Inline mission card that sits in the header row of ScanAndCountScreen.
// Shows target emoji, "Find N Word!" label, and animated found/total counter.
// Sized with flex:1 to fill the space between the close button and round chip.

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { getWordEmoji } from '../../constants/packAccents';

interface CounterOverlayProps {
  targetWord: string;
  found: number;
  target: number;
}

export const CounterOverlay = ({ targetWord, found, target }: CounterOverlayProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const display = targetWord.charAt(0).toUpperCase() + targetWord.slice(1);
  const emoji = getWordEmoji(targetWord);

  useEffect(() => {
    if (found === 0) return;
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.2, duration: 90, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1.0, duration: 130, useNativeDriver: true }),
    ]).start();
  }, [found]);

  return (
    <View style={styles.card}>
      <Text style={styles.emoji}>{emoji}</Text>
      <View style={styles.textBlock}>
        <Text style={styles.task} numberOfLines={1}>Find {target} {display}!</Text>
        <Animated.Text style={[styles.progress, { transform: [{ scale: scaleAnim }] }]}>
          {found} / {target}
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF8E8',
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 8,
  },
  emoji: { fontSize: 26, lineHeight: 32 },
  textBlock: { flex: 1 },
  task: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 14,
    color: colors.textDark,
    lineHeight: 18,
  },
  progress: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 20,
    color: colors.primary,
    lineHeight: 24,
  },
});
