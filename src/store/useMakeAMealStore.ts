// 📖 What this does:
// Zustand store for the Make a Meal game state. Holds which recipe is active,
// which ingredients have been collected, and the current game phase.
//
// resetGame() is called on both safeGoBack and component unmount so no stale
// game state leaks into the next session.
// playAgain() keeps the same recipe but clears collected ingredients — used
// when the child wants to repeat the same recipe immediately.

import { create } from 'zustand';
import { Recipe, GamePhase } from '../types/makeAMeal';

interface MakeAMealState {
  activeRecipe: Recipe | null;
  collectedIngredients: string[];
  gamePhase: GamePhase;
  setActiveRecipe: (recipe: Recipe) => void;
  addCollected: (word: string) => void;
  setGamePhase: (phase: GamePhase) => void;
  playAgain: () => void;
  resetGame: () => void;
}

export const useMakeAMealStore = create<MakeAMealState>((set) => ({
  activeRecipe: null,
  collectedIngredients: [],
  gamePhase: 'select',

  setActiveRecipe: (recipe) => set({ activeRecipe: recipe }),
  addCollected: (word) => set((s) => ({
    collectedIngredients: s.collectedIngredients.includes(word)
      ? s.collectedIngredients
      : [...s.collectedIngredients, word],
  })),
  setGamePhase: (phase) => set({ gamePhase: phase }),

  // Keep same recipe, clear progress — child wants to replay
  playAgain: () => set({ collectedIngredients: [], gamePhase: 'playing' }),

  // Full reset — return to recipe select
  resetGame: () => set({ activeRecipe: null, collectedIngredients: [], gamePhase: 'select' }),
}));
