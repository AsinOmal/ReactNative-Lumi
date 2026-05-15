/**
 * SpellCorrectionBadge.tsx
 *
 * Shows inside the Result Card when a misspelled word (Levenshtein distance = 2)
 * is detected by the camera. Displays the wrong spelling with strikethrough
 * alongside the correct spelling in green — educational, not punitive.
 *
 * Example: APLE  →  APPLE ✓
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

interface Props {
  scannedAs: string; // the misspelled word the camera read
  correct: string; // the canonical correct word
}

export const SpellCorrectionBadge: React.FC<Props> = ({
  scannedAs,
  correct,
}) => {
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scannedAs]);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Text style={styles.label}>Spelling Tip</Text>
      <View style={styles.row}>
        {/* Wrong spelling — red + strikethrough */}
        <Text style={styles.wrong}>{scannedAs.toUpperCase()}</Text>
        <Text style={styles.arrow}> → </Text>
        {/* Correct spelling — green */}
        <Text style={styles.correct}>{correct.toUpperCase()}</Text>
        <Text style={styles.tick}> ✓</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 243, 205, 0.95)',
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 6,
  },
  label: {
    fontSize: 11,
    fontFamily: 'Fredoka-Regular',
    color: '#92400E',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  wrong: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 16,
    color: '#DC2626',
    textDecorationLine: 'line-through',
    textDecorationColor: '#DC2626',
  },
  arrow: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 16,
    color: '#92400E',
  },
  correct: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 16,
    color: '#16A34A',
  },
  tick: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 16,
    color: '#16A34A',
  },
});
