// 📖 What this does:
// Bottom tray shown during Make a Meal gameplay. Shows recipe name + progress
// in the header, then each ingredient as an emoji card with found/missing state.
// Positioned absolutely so the AR scene stays fully visible above it.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Recipe } from '../../types/makeAMeal';
import { colors } from '../../constants/colors';
import { getWordEmoji } from '../../constants/packAccents';

interface Props {
  recipe: Recipe;
  collected: string[];
}

const formatLabel = (word: string) =>
  word.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const IngredientProgressHUD = ({ recipe, collected }: Props) => {
  const total = recipe.ingredients.length;
  const found = collected.length;
  return (
    <View style={styles.tray}>
      <View style={styles.trayHeader}>
        <Text style={styles.trayTitle}>{recipe.emoji} {recipe.name}</Text>
        <View style={[styles.progressChip, found === total && styles.progressChipDone]}>
          <Text style={[styles.progressText, found === total && styles.progressTextDone]}>
            {found} / {total}
          </Text>
        </View>
      </View>
      <View style={styles.ingredientRow}>
        {recipe.ingredients.map(({ word }) => {
          const done = collected.includes(word);
          return (
            <View key={word} style={[styles.card, done && styles.cardDone]}>
              <Text style={styles.emoji}>{getWordEmoji(word)}</Text>
              {done && (
                <View style={styles.tick}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.accentMint} />
                </View>
              )}
              <Text style={[styles.label, done && styles.labelDone]} numberOfLines={1}>
                {formatLabel(word)}
              </Text>
              {!done && <Text style={styles.findLabel}>Find</Text>}
            </View>
          );
        })}
      </View>
      <Text style={styles.hint}>Tap the fruit when you see it!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tray: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF8E8',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
    gap: 10,
    shadowColor: '#3D2008',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  trayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trayTitle: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 18,
    color: colors.textDark,
  },
  progressChip: {
    backgroundColor: 'rgba(255,154,46,0.15)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,154,46,0.3)',
  },
  progressChipDone: {
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderColor: 'rgba(16,185,129,0.4)',
  },
  progressText: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 14,
    color: colors.primary,
  },
  progressTextDone: { color: colors.accentMint },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  card: {
    flex: 1,
    maxWidth: 90,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(196,160,96,0.25)',
  },
  cardDone: {
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderColor: 'rgba(16,185,129,0.4)',
  },
  emoji: { fontSize: 30, lineHeight: 36 },
  tick: { position: 'absolute', top: 6, right: 6 },
  label: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 12,
    color: colors.textDark,
    textAlign: 'center',
  },
  labelDone: { color: colors.accentMint },
  findLabel: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 10,
    color: colors.primary,
  },
  hint: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 13,
    color: colors.textMid,
    textAlign: 'center',
  },
});
