// 📖 What this does:
// Full-screen recipe picker shown when Make a Meal first opens (gamePhase = 'select').
// Renders on top of a black background — ViroARSceneNavigator is not yet mounted
// at this point, so there's no camera/AR resource contention.
//
// Each card shows the recipe name, description, and the ingredient emojis so
// the child knows what they're looking for before they start.

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Recipe } from '../../types/makeAMeal';
import { RECIPES } from '../../data/recipes';
import { styles } from './RecipeSelectOverlayStyles';

const RECIPE_ICON_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#F59E0B',
  '#7C3AED',
  '#4A90D9',
  '#F97316',
  '#10B981',
  '#EC4899',
  '#06B6D4',
];

interface Props {
  onSelect: (recipe: Recipe) => void;
  onBack: () => void;
}

export const RecipeSelectOverlay = ({ onSelect, onBack }: Props) => (
  <View style={styles.overlay}>
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={onBack}
        accessibilityLabel="Go back"
        accessibilityRole="button"
      >
        <Ionicons name="chevron-back" size={22} color="#FFF" />
      </TouchableOpacity>
      <Text style={styles.title}>Make a Meal</Text>
      <Text style={styles.subtitle}>Pick a recipe to cook!</Text>
    </View>

    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      {RECIPES.map((recipe, idx) => (
        <TouchableOpacity
          key={recipe.id}
          style={styles.card}
          onPress={() => onSelect(recipe)}
          activeOpacity={0.8}
          accessibilityLabel={recipe.name}
          accessibilityHint="Double tap to select this recipe"
          accessibilityRole="button"
        >
          <View
            style={[
              styles.recipeIconCircle,
              {
                backgroundColor:
                  RECIPE_ICON_COLORS[idx % RECIPE_ICON_COLORS.length],
              },
            ]}
          >
            <MaterialCommunityIcons
              name="silverware-fork-knife"
              size={28}
              color="#FFF"
            />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardName}>{recipe.name}</Text>
            <Text style={styles.cardDesc}>{recipe.description}</Text>
            <View style={styles.ingredientsRow}>
              {recipe.ingredients.map(({ word }) => (
                <View key={word} style={styles.ingredientChip}>
                  <MaterialCommunityIcons
                    name="cube-outline"
                    size={12}
                    color="#C4B5FD"
                  />
                  <Text style={styles.ingredientText}>{word}</Text>
                </View>
              ))}
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C4B5FD" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);
