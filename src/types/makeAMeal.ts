export interface Ingredient {
  word: string;    // must match a MODEL_REGISTRY key
  quantity: number;
}

export interface Recipe {
  id: string;
  name: string;
  emoji: string;
  description: string;
  requiredPackIds: string[];  // packs the child needs to have unlocked
  ingredients: Ingredient[];
}

export type GamePhase = 'select' | 'playing' | 'complete';
