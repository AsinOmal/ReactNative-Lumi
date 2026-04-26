// 📖 What this does:
// HUD shown during the Make a Meal game. Displays each recipe ingredient as an
// emoji chip — grey/uncollected or green-ticked when found. Gives the child a
// clear visual target of what's left to collect without covering the AR view.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Recipe } from '../../types/makeAMeal';

interface Props {
  recipe: Recipe;
  collected: string[];
}

export const IngredientProgressHUD = ({ recipe, collected }: Props) => (
  <View style={styles.row}>
    {recipe.ingredients.map(({ word }) => {
      const done = collected.includes(word);
      return (
        <View key={word} style={[styles.chip, done && styles.chipDone]}>
          <MaterialCommunityIcons name="cube-outline" size={26} color={done ? '#6EE7B7' : 'rgba(255,255,255,0.8)'} />
          {done && <MaterialCommunityIcons name="check-circle" size={14} color="#6EE7B7" style={styles.tick} />}
        </View>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', gap: 10,
    marginTop: 12, alignSelf: 'center',
  },
  chip: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  chipDone: {
    backgroundColor: 'rgba(5,150,105,0.85)',
    borderColor: '#6EE7B7',
  },
  tick: { position: 'absolute', bottom: 2, right: 4 },
});
