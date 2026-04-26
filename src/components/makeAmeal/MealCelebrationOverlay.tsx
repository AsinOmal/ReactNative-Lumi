// 📖 What this does:
// Full-screen celebration shown when the child completes a recipe.
// Sits on top of the still-mounted AR scene (opacity trick, not unmount)
// so there's no black flash. Play Again resets progress on the same recipe;
// Done triggers safeGoBack with the 350ms Metal cleanup delay.

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Recipe } from '../../types/makeAMeal';

interface Props {
  recipe: Recipe;
  onPlayAgain: () => void;
  onDone: () => void;
}

export const MealCelebrationOverlay = ({ recipe, onPlayAgain, onDone }: Props) => (
  <View style={styles.overlay}>
    <View style={styles.card}>
      <Text style={styles.trophy}>🏆</Text>
      <Text style={styles.title}>You did it!</Text>
      <Text style={styles.recipeLine}>
        {recipe.emoji}  {recipe.name}  {recipe.emoji}
      </Text>
      <Text style={styles.body}>
        Amazing job collecting all the ingredients! You're a kitchen superstar!
      </Text>

      <TouchableOpacity style={styles.playAgainBtn} onPress={onPlayAgain} activeOpacity={0.85}>
        <Text style={styles.playAgainText}>🍳 Play Again</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.doneBtn} onPress={onDone} activeOpacity={0.7}>
        <Text style={styles.doneBtnText}>Back to Recipes</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.82)',
    alignItems: 'center', justifyContent: 'center', padding: 28,
  },
  card: {
    backgroundColor: '#1A1050', borderRadius: 32,
    paddingVertical: 36, paddingHorizontal: 28,
    alignItems: 'center', gap: 12, width: '100%',
    borderWidth: 1.5, borderColor: 'rgba(196,181,253,0.3)',
  },
  trophy:     { fontSize: 72 },
  title:      { fontFamily: 'Fredoka-Bold', fontSize: 34, color: '#FFF' },
  recipeLine: { fontFamily: 'Fredoka-Bold', fontSize: 20, color: '#FDE68A' },
  body: {
    fontFamily: 'Fredoka-Regular', fontSize: 16,
    color: '#C4B5FD', textAlign: 'center', lineHeight: 24,
  },
  playAgainBtn: {
    marginTop: 8, backgroundColor: '#10B981',
    borderRadius: 24, paddingHorizontal: 36, paddingVertical: 14,
    width: '100%', alignItems: 'center',
  },
  playAgainText: { fontFamily: 'Fredoka-Bold', fontSize: 20, color: '#FFF' },
  doneBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24, paddingHorizontal: 36, paddingVertical: 12,
    width: '100%', alignItems: 'center',
  },
  doneBtnText: { fontFamily: 'Fredoka-SemiBold', fontSize: 17, color: '#A78BFA' },
});
