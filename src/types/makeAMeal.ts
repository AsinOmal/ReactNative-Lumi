import type { ImageSourcePropType } from 'react-native';

export interface Ingredient {
  word: string; // must match a MODEL_REGISTRY key
  quantity: number;
}

export interface Recipe {
  id: string;
  name: string;
  emoji: string;
  description: string;
  requiredPackIds: string[]; // packs the child needs to have unlocked
  ingredients: Ingredient[];
  image?: ImageSourcePropType; // illustrated card art for the menu grid
}

export type GamePhase = 'select' | 'playing' | 'complete';
