// 📖 Phase machine for Write & Scan.
// Owns: phase (difficulty → countdown → reveal → scan → result), the target
// word, and the OCR validation result. Word pool is filtered out of
// MODEL_REGISTRY by length so the difficulty matches what a kid can actually
// hand-write. Validation reuses the same matchWord() used by Scan Mode so
// misspellings within Levenshtein 2 still count as correct.

import { useCallback, useMemo, useRef, useState } from 'react';
import { MODEL_REGISTRY } from '../utils/modelRegistry';
import { matchWord } from '../utils/wordMatcher';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type Phase = 'difficulty' | 'countdown' | 'reveal' | 'scan' | 'result';

export interface RoundResult {
  isCorrect: boolean;
  ocrText: string | null;
}

const ALL_WORDS = Object.keys(MODEL_REGISTRY);

const wordsForDifficulty = (d: Difficulty): string[] => {
  switch (d) {
    case 'easy':
      return ALL_WORDS.filter((w) => w.length <= 5);
    case 'medium':
      return ALL_WORDS.filter((w) => w.length === 6 || w.length === 7);
    case 'hard':
      return ALL_WORDS.filter((w) => w.length >= 8);
  }
};

const pickRandom = <T>(list: T[]): T | undefined =>
  list.length ? list[Math.floor(Math.random() * list.length)] : undefined;

export const useWriteAndScan = () => {
  const [phase, setPhase] = useState<Phase>('difficulty');
  const [targetWord, setTargetWord] = useState<string | null>(null);
  const [result, setResult] = useState<RoundResult | null>(null);
  const difficultyRef = useRef<Difficulty | null>(null);

  const startRound = useCallback((difficulty: Difficulty) => {
    const pool = wordsForDifficulty(difficulty);
    const next = pickRandom(pool);
    if (!next) {
      console.error('[useWriteAndScan] no words for difficulty:', difficulty);
      return;
    }
    difficultyRef.current = difficulty;
    setTargetWord(next);
    setResult(null);
    setPhase('countdown');
  }, []);

  const onCountdownDone = useCallback(() => setPhase('reveal'), []);
  const proceedToScan = useCallback(() => setPhase('scan'), []);

  const submitOcrText = useCallback(
    (ocrText: string | null) => {
      if (!targetWord) {
        return;
      }
      const matched = ocrText ? matchWord(ocrText, [targetWord]) : null;
      setResult({
        isCorrect: matched?.word === targetWord,
        ocrText,
      });
      setPhase('result');
    },
    [targetWord]
  );

  const playAgain = useCallback(() => {
    setPhase('difficulty');
    setTargetWord(null);
    setResult(null);
  }, []);

  const targetModel = useMemo(
    () => (targetWord ? MODEL_REGISTRY[targetWord] : null),
    [targetWord]
  );

  return {
    phase,
    targetWord,
    targetModel,
    result,
    difficulty: difficultyRef.current,
    startRound,
    onCountdownDone,
    proceedToScan,
    submitOcrText,
    playAgain,
  };
};
