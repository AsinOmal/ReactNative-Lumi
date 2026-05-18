/**
 * recipes.ts — Static recipe data for the Make a Meal game.
 *
 * Rules:
 *  - All ingredient words must be keys in MODEL_REGISTRY.
 *  - Keep ingredients between 2–4 per recipe — 5+ models + distractors gets crowded in AR.
 *  - requiredPackIds tells the screen which packs the child needs (used in Phase 8 paywall).
 *    For now all free-tier packs, so no locking is enforced yet.
 *
 * Curated to 5 recipes: a child shouldn't have to scroll through a long list,
 * and 5 covers the three flavour profiles (fruit, vegetable, mixed) with one
 * fallback each, plus a "rainbow" variety pick.
 */

import { Recipe } from '../types/makeAMeal';

export const RECIPES: Recipe[] = [
  // ── Fruit ────────────────────────────────────────────────────────────────────
  {
    id: 'fruit_salad',
    name: 'Fruit Salad',
    emoji: '🥗',
    description: 'A fresh mix of your favourite fruits!',
    requiredPackIds: ['fruits'],
    image: require('../assets/images/meals/fruit-salad.png'),
    ingredients: [
      { word: 'apple', quantity: 1 },
      { word: 'banana', quantity: 1 },
      { word: 'grape', quantity: 1 },
    ],
  },
  {
    id: 'tropical_mix',
    name: 'Tropical Mix',
    emoji: '🍹',
    description: 'Taste the tropics in every bite!',
    requiredPackIds: ['fruits'],
    image: require('../assets/images/meals/tropical-mix.png'),
    ingredients: [
      { word: 'mango', quantity: 1 },
      { word: 'pineapple', quantity: 1 },
      { word: 'orange', quantity: 1 },
    ],
  },

  // ── Vegetable ────────────────────────────────────────────────────────────────
  {
    id: 'veggie_stir_fry',
    name: 'Veggie Stir Fry',
    emoji: '🥘',
    description: 'Crunchy veggies cooked in a hot wok!',
    requiredPackIds: ['vegetables'],
    image: require('../assets/images/meals/veggie-stir-fry.png'),
    ingredients: [
      { word: 'broccoli', quantity: 1 },
      { word: 'carrot', quantity: 1 },
      { word: 'corn', quantity: 1 },
    ],
  },
  {
    id: 'garden_salad',
    name: 'Garden Salad',
    emoji: '🥙',
    description: 'Fresh from the garden to your plate!',
    requiredPackIds: ['vegetables'],
    image: require('../assets/images/meals/garden-salad.png'),
    ingredients: [
      { word: 'cucumber', quantity: 1 },
      { word: 'tomato', quantity: 1 },
      { word: 'onion', quantity: 1 },
    ],
  },

  // ── Mixed ────────────────────────────────────────────────────────────────────
  {
    id: 'rainbow_plate',
    name: 'Rainbow Plate',
    emoji: '🌈',
    description: 'Every colour of the rainbow on one plate!',
    requiredPackIds: ['fruits', 'vegetables'],
    image: require('../assets/images/meals/rainbow-plate.png'),
    ingredients: [
      { word: 'carrot', quantity: 1 },
      { word: 'corn', quantity: 1 },
      { word: 'strawberry', quantity: 1 },
      { word: 'grape', quantity: 1 },
    ],
  },
];
