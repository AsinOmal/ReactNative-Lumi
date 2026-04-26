// 📖 What this does:
// Encapsulates save/unsave for the current scanned word. Writes to AsyncStorage
// (achievementStore) as the primary store, then fire-and-forget syncs to Firestore
// for cross-device persistence and reinstall recovery. Achievement unlocks are also
// synced to Firestore so the parent dashboard reflects real earned data.
//
// Watch out: Firestore writes are best-effort (.catch(() => {})). If offline,
// AsyncStorage is authoritative — Firestore catches up on next connection.

import { useState, useCallback } from 'react';
import { recordScan, removeScan, getProgress } from '../utils/achievementStore';
import { Achievement } from '../utils/achievementRegistry';
import { MatchResult } from '../utils/wordMatcher';
import { useAuthStore } from '../store/useAuthStore';
import { syncAchievementToFirestore } from '../services/achievementService';
import { saveWordToFirestore, removeWordFromFirestore } from '../services/savedWordsService';
import { recordScanToday } from '../services/notificationService';

interface UseWordSavingProps {
  activeWord: string;
  matchResult: MatchResult | null;
}

export const useWordSaving = ({ activeWord, matchResult }: UseWordSavingProps) => {
  const { user } = useAuthStore();
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
      if (user) removeWordFromFirestore(user.uid, activeWord).catch(() => {});
      return;
    }

    setIsWordSaved(true);
    recordScanToday().catch(() => {}); // cancel tonight's reminder — user has scanned today
    const isCorrection = matchResult?.isCorrection ?? false;
    const newAchievements = await recordScan(activeWord, isCorrection);

    if (user) {
      saveWordToFirestore(user.uid, activeWord).catch(() => {});
      newAchievements.forEach(a => {
        syncAchievementToFirestore(user.uid, {
          id: a.id,
          unlockedAt: Date.now(),
          triggerWord: activeWord,
        }).catch(() => {});
      });
    }

    if (newAchievements.length > 0) {
      setAchievementQueue(prev => [...prev, ...newAchievements]);
    }
  }, [activeWord, matchResult, isWordSaved, user]);

  return { isWordSaved, setIsWordSaved, checkWordSavedStatus, handleSaveWord, achievementQueue, setAchievementQueue };
};
