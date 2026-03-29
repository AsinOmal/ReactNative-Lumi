/**
 * Extracted TypeScript interfaces for global usage.
 */

// From components/ar/ARWordScene.tsx
export interface ViroAppProps {
  word: string;
  onModelLoaded: () => void;
}

export interface ViroWordFindProps {
  targetWord: string;
  foundWords: string[];
  onCorrect: (w: string) => void;
  onWrong: (w: string) => void;
  onModelLoaded: (w: string) => void;
  randomizedPositions: [number, number, number][];
}

// Global UI Mode State
export type ScanMode = 'scan' | 'ar';
