/**
 * recipes.ts — Static recipe data for the Make a Meal game.
 *
 * Rules:
 *  - All ingredient words must be keys in MODEL_REGISTRY.
 *  - Keep ingredients between 2–4 per recipe — 5+ models + distractors gets crowded in AR.
 *  - requiredPackIds tells the screen which packs the child needs (used in Phase 8 paywall).
 *    For now all free-tier packs, so no locking is enforced yet.
 */

import { Recipe } from '../types/makeAMeal';

export const RECIPES: Recipe[] = [
  // ── Fruit Recipes ────────────────────────────────────────────────────────────
  {
    id: 'fruit_salad',
    name: 'Fruit Salad',
    emoji: '🥗',
    description: 'A fresh mix of your favourite fruits!',
    requiredPackIds: ['fruits'],
    ingredients: [
      { word: 'apple',      quantity: 1 },
      { word: 'banana',     quantity: 1 },
      { word: 'grape',      quantity: 1 },
    ],
  },
  {
    id: 'tropical_mix',
    name: 'Tropical Mix',
    emoji: '🍹',
    description: 'Taste the tropics in every bite!',
    requiredPackIds: ['fruits'],
    ingredients: [
      { word: 'mango',      quantity: 1 },
      { word: 'pineapple',  quantity: 1 },
      { word: 'orange',     quantity: 1 },
    ],
  },
  {
    id: 'berry_bowl',
    name: 'Berry Bowl',
    emoji: '🫐',
    description: 'Sweet berries and citrus in a bowl!',
    requiredPackIds: ['fruits'],
    ingredients: [
      { word: 'cherry',     quantity: 1 },
      { word: 'strawberry', quantity: 1 },
      { word: 'lemon',      quantity: 1 },
    ],
  },
  {
    id: 'citrus_splash',
    name: 'Citrus Splash',
    emoji: '🍋',
    description: 'Zingy, refreshing and full of vitamin C!',
    requiredPackIds: ['fruits'],
    ingredients: [
      { word: 'lemon',      quantity: 1 },
      { word: 'orange',     quantity: 1 },
      { word: 'watermelon', quantity: 1 },
    ],
  },

  // ── Vegetable Recipes ─────────────────────────────────────────────────────────
  {
    id: 'veggie_stir_fry',
    name: 'Veggie Stir Fry',
    emoji: '🥘',
    description: 'Crunchy veggies cooked in a hot wok!',
    requiredPackIds: ['vegetables'],
    ingredients: [
      { word: 'broccoli',   quantity: 1 },
      { word: 'carrot',     quantity: 1 },
      { word: 'corn',       quantity: 1 },
    ],
  },
  {
    id: 'garden_salad',
    name: 'Garden Salad',
    emoji: '🥙',
    description: 'Fresh from the garden to your plate!',
    requiredPackIds: ['vegetables'],
    ingredients: [
      { word: 'cucumber',   quantity: 1 },
      { word: 'tomato',     quantity: 1 },
      { word: 'onion',      quantity: 1 },
    ],
  },
  {
    id: 'soup_base',
    name: 'Vegetable Soup',
    emoji: '🍲',
    description: 'A warm and cosy bowl of veggie soup!',
    requiredPackIds: ['vegetables'],
    ingredients: [
      { word: 'potato',     quantity: 1 },
      { word: 'carrot',     quantity: 1 },
      { word: 'onion',      quantity: 1 },
    ],
  },
  {
    id: 'spicy_mix',
    name: 'Spicy Mix',
    emoji: '🌶️',
    description: 'For the brave chefs who like it hot!',
    requiredPackIds: ['vegetables'],
    ingredients: [
      { word: 'chili',      quantity: 1 },
      { word: 'eggplant',   quantity: 1 },
      { word: 'tomato',     quantity: 1 },
    ],
  },

  // ── Mixed Recipes ─────────────────────────────────────────────────────────────
  {
    id: 'rainbow_plate',
    name: 'Rainbow Plate',
    emoji: '🌈',
    description: 'Every colour of the rainbow on one plate!',
    requiredPackIds: ['fruits', 'vegetables'],
    ingredients: [
      { word: 'carrot',     quantity: 1 },
      { word: 'corn',       quantity: 1 },
      { word: 'strawberry', quantity: 1 },
      { word: 'grape',      quantity: 1 },
    ],
  },
  {
    id: 'harvest_basket',
    name: 'Harvest Basket',
    emoji: '🧺',
    description: 'The best of the autumn harvest!',
    requiredPackIds: ['fruits', 'vegetables'],
    ingredients: [
      { word: 'pumpkin',    quantity: 1 },
      { word: 'apple',      quantity: 1 },
      { word: 'potato',     quantity: 1 },
      { word: 'corn',       quantity: 1 },
    ],
  },
];
