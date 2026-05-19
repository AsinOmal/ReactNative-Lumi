// 📖 What this does:
// HUD shown during the Make a Meal game. Each recipe ingredient appears as a
// circular chip with a fitting MaterialCommunityIcons glyph plus the
// ingredient's word as a caption underneath, so the child knows exactly what
// to find. Chips turn green with a tick once the ingredient is collected.
//
// Why both icon and caption: many ingredients (banana, mango, broccoli,
// tomato, onion, cucumber, strawberry…) have no dedicated MCI glyph, so we
// fall back to a generic food icon. The caption keeps the chip identifiable
// even when the icon is generic.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Recipe } from '../../types/makeAMeal';
import { colors } from '../../constants/colors';

interface Props {
  recipe: Recipe;
  collected: string[];
}

const FALLBACK_ICON = 'food-variant';

// MCI glyph names confirmed present in react-native-vector-icons. Words not
// listed here render with FALLBACK_ICON — the caption still tells the child
// which ingredient the chip stands for.
const INGREDIENT_ICONS: Record<string, string> = {
  apple: 'food-apple',
  cherry: 'fruit-cherries',
  grape: 'fruit-grapes',
  lemon: 'fruit-citrus',
  orange: 'fruit-citrus',
  pineapple: 'fruit-pineapple',
  watermelon: 'fruit-watermelon',
  carrot: 'carrot',
  corn: 'corn',
  pumpkin: 'pumpkin',
  chili_pepper: 'chili-hot',
};

const formatLabel = (word: string) =>
  word.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const IngredientProgressHUD = ({ recipe, collected }: Props) => (
  <View style={styles.row}>
    {recipe.ingredients.map(({ word }) => {
      const done = collected.includes(word);
      const iconName = INGREDIENT_ICONS[word] ?? FALLBACK_ICON;
      return (
        <View key={word} style={styles.item}>
          <View style={[styles.chip, done && styles.chipDone]}>
            <MaterialCommunityIcons
              name={iconName}
              size={26}
              color={done ? colors.accentMint : 'rgba(255,255,255,0.95)'}
            />
            {done && (
              <MaterialCommunityIcons
                name="check-circle"
                size={14}
                color={colors.accentMint}
                style={styles.tick}
              />
            )}
          </View>
          <Text
            style={[styles.label, done && styles.labelDone]}
            numberOfLines={1}
          >
            {formatLabel(word)}
          </Text>
        </View>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    alignSelf: 'center',
  },
  item: {
    alignItems: 'center',
    width: 64,
  },
  chip: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipDone: {
    backgroundColor: 'rgba(5,150,105,0.85)',
    borderColor: colors.accentMint,
  },
  tick: { position: 'absolute', bottom: 2, right: 4 },
  label: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
  },
  labelDone: {
    color: colors.accentMint,
  },
});
