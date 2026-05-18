// 📖 What this does:
// Full-screen recipe picker shown when Make a Meal first opens (gamePhase =
// 'select'). Renders on top of a black background — ViroARSceneNavigator
// isn't mounted yet, so there's no camera / AR resource contention.
//
// Layout follows the LibraryScreen / PlaygroundScreen pattern: a cloudy
// panorama header with title block + scene-specific hero art, then a 2-column
// grid below on the warm meal backdrop. The previous dark-wood-only treatment
// hid the dark-brown title text — this header gives the title a cream sky to
// sit on so it always reads.

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageBackground,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Recipe } from '../../types/makeAMeal';
import { RECIPES } from '../../data/recipes';
import { colors } from '../../constants/colors';
import { styles } from './RecipeSelectOverlayStyles';

const BODY_BG = require('../../assets/backgrounds/make-a-meal-bg.png');
const HEADER_BG = require('../../assets/backgrounds/library-screen-header.png');
const HEADER_ICON = require('../../assets/images/make-a-meal-art.png');

interface Props {
  onSelect: (recipe: Recipe) => void;
  onBack: () => void;
}

export const RecipeSelectOverlay = ({ onSelect, onBack }: Props) => {
  const insets = useSafeAreaInsets();
  return (
    <ImageBackground source={BODY_BG} style={styles.overlay} resizeMode="cover">
      {/* Translucent cream veil over the wood so card titles + chip text stay
          readable. Matches the ImageBackdrop veil used by Library/Playground. */}
      <View style={styles.bodyVeil} pointerEvents="none" />

      <ImageBackground
        source={HEADER_BG}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
        imageStyle={styles.headerImage}
        resizeMode="cover"
      >
        <TouchableOpacity
          style={[styles.backBtn, { top: insets.top + 14 }]}
          onPress={onBack}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={22} color="#3D2008" />
        </TouchableOpacity>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Make a Meal</Text>
          <View style={styles.countRow}>
            <Ionicons name="restaurant" size={18} color={colors.accentYellow} />
            <Text style={styles.subtitle}>Pick a recipe to cook!</Text>
          </View>
        </View>
        <Image
          source={HEADER_ICON}
          style={styles.headerIcon}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </ImageBackground>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {RECIPES.map((recipe) => (
            <TouchableOpacity
              key={recipe.id}
              style={styles.card}
              onPress={() => onSelect(recipe)}
              activeOpacity={0.85}
              accessibilityLabel={recipe.name}
              accessibilityHint="Double tap to select this recipe"
              accessibilityRole="button"
            >
              <View style={styles.cardImageWrap}>
                {recipe.image ? (
                  <Image
                    source={recipe.image}
                    style={styles.cardImage}
                    resizeMode="contain"
                  />
                ) : (
                  <MaterialCommunityIcons
                    name="silverware-fork-knife"
                    size={56}
                    color="#C48A4A"
                  />
                )}
              </View>
              <Text style={styles.cardName} numberOfLines={1}>
                {recipe.name}
              </Text>
              <View style={styles.cardChip}>
                <MaterialCommunityIcons
                  name="cube-outline"
                  size={12}
                  color="#7A4A1F"
                />
                <Text style={styles.cardChipText}>
                  {recipe.ingredients.length} ingredients
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ImageBackground>
  );
};
