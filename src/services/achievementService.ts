/**
 * achievementService.ts
 *
 * Firestore sync for achievements.
 * Schema: /users/{uid}/achievements/{achievementId} — { unlockedAt, triggerWord }
 *
 * AsyncStorage (achievementStore) remains the source of truth for UI performance.
 * Firestore sync is fire-and-forget — called from useWordSaving after a new unlock.
 * loadAchievementsFromFirestore is used on reinstall to restore earned achievements.
 */

import { getApp } from '@react-native-firebase/app';
import { getFirestore, doc, setDoc, collection, getDocs } from '@react-native-firebase/firestore';
import { EarnedAchievement } from '../utils/achievementStore';

const db = () => getFirestore(getApp());

/** Write a single achievement to Firestore. Called after each new unlock. */
export const syncAchievementToFirestore = async (
  uid: string,
  achievement: EarnedAchievement,
): Promise<void> => {
  try {
    const ref = doc(db(), 'users', uid, 'achievements', achievement.id);
    await setDoc(ref, { unlockedAt: achievement.unlockedAt, triggerWord: achievement.triggerWord });
  } catch (e) {
    console.error('[achievementService] syncAchievementToFirestore:', e);
  }
};

/** Load all earned achievements from Firestore (reinstall recovery). */
export const loadAchievementsFromFirestore = async (uid: string): Promise<EarnedAchievement[]> => {
  try {
    const ref = collection(db(), 'users', uid, 'achievements');
    const snap = await getDocs(ref);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return snap.docs.map((d: any) => ({
      id: d.id,
      unlockedAt: d.data().unlockedAt ?? 0,
      triggerWord: d.data().triggerWord ?? 'unknown',
    }));
  } catch (e) {
    console.error('[achievementService] loadAchievementsFromFirestore:', e);
    return [];
  }
};
