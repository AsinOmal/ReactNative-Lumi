import { useState, useCallback } from 'react';
import { recordScan, removeScan, getProgress } from '../utils/achievementStore';
import { Achievement } from '../utils/achievementRegistry';
import { MatchResult } from '../utils/wordMatcher';

interface UseWordSavingProps {
  activeWord: string;
  matchResult: MatchResult | null;
}

// 📖 What this does:
// Encapsulates the logic and state for tracking if the current activeWord 
// has been saved by the user (checking Firestore/Zustand), allowing the user 
// to save/unsave it, and pushing any newly unlocked achievements into a queue.
export const useWordSaving = ({ activeWord, matchResult }: UseWordSavingProps) => {
  const [isWordSaved, setIsWordSaved] = useState(false);
  const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([]);

  const checkWordSavedStatus = useCallback(async (word: string) => {
    const progress = await getProgress();
    setIsWordSaved(progress.scannedWords.includes(word));
  }, []);

  const handleSaveWord = useCallback(async () => {
    if (isWordSaved) {
      setIsWordSaved(false);
      await removeScan(activeWord);
      return;
    }
    
    setIsWordSaved(true);
    const isCorrection = matchResult?.isCorrection ?? false;
    const newAchievements = await recordScan(activeWord, isCorrection);
    if (newAchievements.length > 0) {
      setAchievementQueue(prev => [...prev, ...newAchievements]);
    }
  }, [activeWord, matchResult, isWordSaved]);

  return { isWordSaved, setIsWordSaved, checkWordSavedStatus, handleSaveWord, achievementQueue, setAchievementQueue };
};
