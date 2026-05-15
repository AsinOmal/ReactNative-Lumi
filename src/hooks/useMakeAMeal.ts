// 📖 What this does:
// Core game logic for Make a Meal. Builds the AR spawn list (ingredients +
// distractors), handles ingredient/distractor taps with debounce, manages
// feedback animation, and detects recipe completion.
//
// isTapping ref: debounces rapid taps — without it a fast child can double-tap
// and collect the same ingredient twice or trigger two feedback flashes.
//
// Completion check: uses `collectedIngredients.length + 1` because the Zustand
// update from addCollected hasn't propagated yet at the moment we check.

import { useState, useEffect, useRef, useCallback } from 'react';
import { Animated } from 'react-native';
import { Recipe } from '../types/makeAMeal';
import { MODEL_REGISTRY } from '../utils/modelRegistry';
import { shuffleArray } from '../utils/arrayUtils';
import { playSound } from '../utils/gameSound';
import { config } from '../constants/config';
import { useMakeAMealStore } from '../store/useMakeAMealStore';

interface UseMakeAMealProps {
  recipe: Recipe | null;
  onComplete: () => void;
}

export const useMakeAMeal = ({ recipe, onComplete }: UseMakeAMealProps) => {
  const { collectedIngredients, addCollected } = useMakeAMealStore();
  const [spawnWords, setSpawnWords] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const isTapping = useRef(false);

  // Rebuild spawn list whenever the recipe changes
  useEffect(() => {
    if (!recipe) {
      setSpawnWords([]);
      return;
    }
    const ingredientWords = recipe.ingredients.map((i) => i.word);
    const distractors = shuffleArray(
      Object.keys(MODEL_REGISTRY).filter((w) => !ingredientWords.includes(w))
    ).slice(0, config.MAKE_A_MEAL_DISTRACTOR_COUNT);
    setSpawnWords(shuffleArray([...ingredientWords, ...distractors]));
  }, [recipe]);

  const flashFeedback = useCallback(
    (type: 'correct' | 'wrong', cb?: () => void) => {
      setFeedback(type);
      Animated.sequence([
        Animated.timing(feedbackAnim, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.delay(type === 'correct' ? 600 : 400),
        Animated.timing(feedbackAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setFeedback(null);
        cb?.();
      });
    },
    [feedbackAnim]
  );

  const handleIngredientTap = useCallback(
    (word: string) => {
      if (isTapping.current || collectedIngredients.includes(word) || !recipe) {
        return;
      }
      isTapping.current = true;
      playSound('correct');
      addCollected(word);
      const newCount = collectedIngredients.length + 1;
      flashFeedback('correct', () => {
        isTapping.current = false;
        if (newCount >= recipe.ingredients.length) {
          playSound('victory');
          onComplete();
        }
      });
    },
    [collectedIngredients, recipe, addCollected, flashFeedback, onComplete]
  );

  const handleDistractorTap = useCallback(
    (_word: string) => {
      if (isTapping.current) {
        return;
      }
      isTapping.current = true;
      playSound('wrong');
      flashFeedback('wrong', () => {
        isTapping.current = false;
      });
    },
    [flashFeedback]
  );

  return {
    spawnWords,
    feedback,
    feedbackAnim,
    handleIngredientTap,
    handleDistractorTap,
  };
};
