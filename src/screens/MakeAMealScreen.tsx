// 📖 What this does:
// Orchestrator for the Make a Meal game. Follows the same two-phase camera
// lifecycle as ARWordFindScreen: ViroARSceneNavigator only mounts when
// gamePhase is 'playing' or 'complete' (not during recipe select). safeGoBack
// hides the view for 350ms before navigation so Metal textures release cleanly.
//
// Stable callback refs: ViroNode reads viroAppProps once at mount — all
// callbacks that change over the game lifetime use the double-ref pattern.

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, Animated, Alert, ActivityIndicator,
} from 'react-native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { MakeAMealScene } from '../components/ar/MakeAMealScene';
import { RecipeSelectOverlay } from '../components/makeAmeal/RecipeSelectOverlay';
import { IngredientProgressHUD } from '../components/makeAmeal/IngredientProgressHUD';
import { MealCelebrationOverlay } from '../components/makeAmeal/MealCelebrationOverlay';

import { useMakeAMealStore } from '../store/useMakeAMealStore';
import { useMakeAMeal } from '../hooks/useMakeAMeal';
import { loadGameSounds, releaseGameSounds } from '../utils/gameSound';
import { shuffleArray } from '../utils/arrayUtils';
import { Recipe } from '../types/makeAMeal';
import { styles } from './MakeAMealScreenStyles';

const MEAL_POSITIONS: [number, number, number][] = [
  [-1.5,  0.4, -1.8], [ 0.0,  0.7, -1.5], [ 1.5,  0.4, -1.8],
  [-1.2, -0.4, -2.1], [ 1.2, -0.4, -2.1], [ 0.0, -0.3, -2.3],
  [ 0.5,  0.2, -1.2],
];

export const MakeAMealScreen = () => {
  const navigation = useNavigation();
  const { activeRecipe, collectedIngredients, gamePhase, setActiveRecipe, setGamePhase, playAgain, resetGame } = useMakeAMealStore();
  const [isLeaving, setIsLeaving] = useState(false);
  const [sceneKey, setSceneKey] = useState(0);
  const [loadedWords, setLoadedWords] = useState<Set<string>>(new Set());
  const [positions] = useState(() => shuffleArray(MEAL_POSITIONS));
  // Viro must never be conditionally unmounted mid-screen — only navigation.goBack() is safe.
  // Once started, keep it mounted; hide with opacity when on recipe select.
  const [viroEverStarted, setViroEverStarted] = useState(false);

  const { spawnWords, feedback, feedbackAnim, handleIngredientTap, handleDistractorTap } = useMakeAMeal({
    recipe: activeRecipe,
    onComplete: () => setGamePhase('complete'),
  });

  // Gate on ingredients only — distractors can pop in after; child can start collecting sooner
  const ingredientWords = activeRecipe?.ingredients.map(i => i.word) ?? [];
  const allLoaded = ingredientWords.length > 0 && ingredientWords.every(w => loadedWords.has(w));

  // Double-ref stable callbacks — Viro reads viroAppProps once at mount
  const onIngredientRef = useRef<(w: string) => void>(() => {});
  const onDistractorRef = useRef<(w: string) => void>(() => {});
  const onModelLoadedRef = useRef<(w: string) => void>(() => {});
  useEffect(() => { onIngredientRef.current = handleIngredientTap; }, [handleIngredientTap]);
  useEffect(() => { onDistractorRef.current = handleDistractorTap; }, [handleDistractorTap]);
  useEffect(() => { onModelLoadedRef.current = (w: string) => setLoadedWords(prev => { const s = new Set(prev); s.add(w); return s; }); }, []);
  const stableOnIngredient    = useRef((w: string) => onIngredientRef.current(w)).current;
  const stableOnDistractor    = useRef((w: string) => onDistractorRef.current(w)).current;
  const stableOnModelLoaded   = useRef((w: string) => onModelLoadedRef.current(w)).current;

  useEffect(() => { loadGameSounds(); return () => { releaseGameSounds(); resetGame(); }; }, []);

  // Full exit — let the useEffect cleanup call resetGame on unmount
  const safeGoBack = useCallback(() => {
    releaseGameSounds();
    setIsLeaving(true);
    setTimeout(() => navigation.goBack(), 350);
  }, [navigation]);

  // Viro stays mounted (viroEverStarted=true) — safe to reset game state immediately
  const handleBackToSelect = useCallback(() => {
    resetGame(); // gamePhase → 'select' → Viro opacity 0, stays mounted
  }, [resetGame]);

  const handleRecipeSelect = useCallback((recipe: Recipe) => {
    setActiveRecipe(recipe);
    setLoadedWords(new Set());
    setViroEverStarted(true);
    setSceneKey(k => k + 1);
    setGamePhase('playing');
  }, [setActiveRecipe, setGamePhase]);

  // Hide Viro first before forcing a remount via sceneKey — same Metal release concern
  const handlePlayAgain = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      playAgain();
      setLoadedWords(new Set());
      setSceneKey(k => k + 1);
      setIsLeaving(false);
    }, 350);
  }, [playAgain]);

  const viroHidden = isLeaving || gamePhase === 'select';

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Viro stays mounted once started — never conditionally unmounted (Metal crash).
          Hidden via opacity when on recipe select or leaving. */}
      <View style={[StyleSheet.absoluteFill, viroHidden && { opacity: 0 }]}>
        {viroEverStarted && (
          <ViroARSceneNavigator
            key={sceneKey}
            autofocus
            initialScene={{ scene: MakeAMealScene as any }}
            viroAppProps={{
              spawnWords,
              ingredients: activeRecipe?.ingredients.map(i => i.word) ?? [],
              collected: collectedIngredients,
              onIngredientTap: stableOnIngredient,
              onDistractorTap: stableOnDistractor,
              onModelLoaded: stableOnModelLoaded,
              positions,
            }}
            style={StyleSheet.absoluteFill}
          />
        )}
      </View>

      {/* HUD overlay */}
      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.header} pointerEvents="box-none">
          <TouchableOpacity style={styles.closeBtn} onPress={() =>
            Alert.alert('Quit Recipe?', 'Your progress will be lost.', [
              { text: 'Keep Cooking', style: 'cancel' },
              { text: 'Quit', style: 'destructive', onPress: safeGoBack },
            ])
          }>
            <Ionicons name="close" size={22} color="#FFF" />
          </TouchableOpacity>
          {activeRecipe && !viroHidden && (
            <View style={styles.recipePill}>
              <Text style={styles.recipeEmoji}>{activeRecipe.emoji}</Text>
              <Text style={styles.recipeName}>{activeRecipe.name}</Text>
            </View>
          )}
        </View>

        {gamePhase === 'playing' && activeRecipe && (
          <>
            <IngredientProgressHUD recipe={activeRecipe} collected={collectedIngredients} />
            {feedback !== null && (
              <Animated.View pointerEvents="none" style={[styles.feedbackBanner, feedback === 'correct' ? styles.feedbackGreen : styles.feedbackRed, { opacity: feedbackAnim }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name={feedback === 'correct' ? 'checkmark-circle' : 'close-circle'} size={18} color="#FFF" />
                  <Text style={styles.feedbackText}>{feedback === 'correct' ? 'Got one!' : 'Not quite!'}</Text>
                </View>
              </Animated.View>
            )}
          </>
        )}
      </SafeAreaView>

      {/* Loading cover — shown until all spawn models report onLoadEnd */}
      {gamePhase === 'playing' && !allLoaded && (
        <View style={styles.loadingCover} pointerEvents="none">
          <ActivityIndicator size="large" color="#A78BFA" />
          <Text style={styles.loadingText}>Preparing your kitchen...</Text>
        </View>
      )}

      {gamePhase === 'select' && <RecipeSelectOverlay onSelect={handleRecipeSelect} onBack={safeGoBack} />}
      {gamePhase === 'complete' && activeRecipe && (
        <MealCelebrationOverlay recipe={activeRecipe} onPlayAgain={handlePlayAgain} onDone={handleBackToSelect} />
      )}
    </View>
  );
};
