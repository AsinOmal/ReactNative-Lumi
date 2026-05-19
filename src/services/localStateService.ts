// 📖 What this does:
// Clears all device-local user-scoped state on sign-out so the next user
// signing in on the same device gets a clean slate. Also exposes a hydrate
// helper that writes Firestore-backed data (saved words, achievements,
// streak/stats) into AsyncStorage on sign-in for instant UI reads.
//
// Why: AsyncStorage keys (lumi_*, hasSeenChildInfoScreen, @lumi/intro_seen,
// pin lockout, etc.) were not namespaced by uid. Without this, sign-out +
// sign-in inherits the previous user's streak, saved words, achievements,
// and skips the child-profile prompt.

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { EarnedAchievement, SavedWord } from '../utils/achievementStore';
import { loadAchievementsFromFirestore } from './achievementService';
import { loadSavedWordsFromFirestore } from './savedWordsService';
import { loadStatsFromFirestore } from './statsService';
import { loadChildProfile, loadIntroSeen } from './userService';

// Per-user keys to wipe on sign-out. We deliberately keep:
//   - @lumi/language          (device-level setting, not user data)
//   - lumi_model_cache        (just "recently viewed" — wiping anyway below
//                              since it's per-account browsing history)
const PER_USER_KEYS = [
  'lumi_scanned_words',
  'lumi_saved_words',
  'lumi_spell_corrections',
  'lumi_session_count',
  'lumi_earned_achievements',
  'lumi_streak_count',
  'lumi_last_scan_date',
  'lumi_wishlist',
  'lumi_model_cache',
  'hasSeenChildInfoScreen',
  '@lumi/intro_seen',
  '@lumi/pin_locked_until',
  '@lumi/pin_attempts',
  'lumi_last_scan_today',
];

export const clearLocalUserState = async (): Promise<void> => {
  try {
    const all = await AsyncStorage.getAllKeys();
    const screenTimeKeys = all.filter((k) => k.startsWith('screenTime_'));
    const bannerKeys = all.filter((k) => k.startsWith('@banner_dismissed_'));
    await AsyncStorage.multiRemove([
      ...PER_USER_KEYS,
      ...screenTimeKeys,
      ...bannerKeys,
    ]);
  } catch (e) {
    console.error('[localStateService] clearLocalUserState:', e);
  }
};

// Drop AsyncStorage keys that grow unbounded over time for long-lived users
// (users who stay signed in and never trigger clearLocalUserState). Two
// classes of keys are pruned:
//   - screenTime_YYYY-MM-DD: per-day totals. Older than 30 days is irrelevant
//     to the in-app screen-time meter (which only cares about today).
//   - @banner_dismissed_<bannerId>: one entry per admin-published banner the
//     user dismissed. We don't know the publish timestamp client-side, so we
//     use a 90-day TTL fallback on the LAST-ACCESSED timestamp stored alongside
//     the dismissal. Older entries are safe to wipe — if the same banner is
//     re-published the user simply sees it again.
const PRUNE_SCREEN_TIME_DAYS = 30;

const isoNDaysAgo = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

export const pruneStaleKeys = async (): Promise<void> => {
  try {
    const all = await AsyncStorage.getAllKeys();
    const screenTimeCutoff = isoNDaysAgo(PRUNE_SCREEN_TIME_DAYS);
    const stale = all.filter((k) => {
      if (k.startsWith('screenTime_')) {
        // 'screenTime_2026-05-19' → '2026-05-19'. String compare is safe
        // because YYYY-MM-DD is lexicographically ordered.
        return k.slice('screenTime_'.length) < screenTimeCutoff;
      }
      return false;
    });
    // Banner dismissals: we don't store the dismiss timestamp, so fall back
    // to "drop if there are more than 30 of them" — admin rarely keeps more
    // than a couple of dismissed banners around per device.
    const bannerKeys = all.filter((k) => k.startsWith('@banner_dismissed_'));
    if (bannerKeys.length > 30) {
      stale.push(...bannerKeys.slice(0, bannerKeys.length - 30));
    }
    if (stale.length > 0) {
      await AsyncStorage.multiRemove(stale);
      if (__DEV__) {
        console.log(
          `[localStateService] pruneStaleKeys removed ${stale.length} keys`
        );
      }
    }
  } catch (e) {
    console.error('[localStateService] pruneStaleKeys:', e);
  }
};

export interface HydrateInput {
  savedWords: SavedWord[];
  achievements: EarnedAchievement[];
  streakCount: number;
  lastScanDate: string;
  spellCorrections: number;
}

// Write Firestore-sourced user data into AsyncStorage in one shot. scannedWords
// is derived from savedWords so the achievement registry's "totalWords" gates
// keep working without a separate Firestore subcollection.
export const hydrateLocalFromFirestore = async (
  data: HydrateInput
): Promise<void> => {
  try {
    const scannedWords = data.savedWords.map((s) => s.word);
    await AsyncStorage.multiSet([
      ['lumi_saved_words', JSON.stringify(data.savedWords)],
      ['lumi_earned_achievements', JSON.stringify(data.achievements)],
      ['lumi_scanned_words', JSON.stringify(scannedWords)],
      ['lumi_streak_count', JSON.stringify(data.streakCount)],
      ['lumi_last_scan_date', JSON.stringify(data.lastScanDate)],
      ['lumi_spell_corrections', JSON.stringify(data.spellCorrections)],
    ]);
  } catch (e) {
    console.error('[localStateService] hydrateLocalFromFirestore:', e);
  }
};

// One-shot fan-out of all Firestore reads needed on sign-in: child profile
// gate, intro gate, plus everything that has to land in AsyncStorage for the
// UI to render correctly post-wipe. useBootstrapSession awaits this so the
// hydrated flag flips on only once everything is in place.
export const hydrateUserOnSignIn = async (
  uid: string
): Promise<{
  childName: string | null;
  childAge: number | null;
  childProfileSeen: boolean;
  introSeen: boolean;
}> => {
  const [profile, introSeen, savedWords, achievements, stats] =
    await Promise.all([
      loadChildProfile(uid),
      loadIntroSeen(uid),
      loadSavedWordsFromFirestore(uid),
      loadAchievementsFromFirestore(uid),
      loadStatsFromFirestore(uid),
    ]);
  await hydrateLocalFromFirestore({
    savedWords,
    achievements,
    streakCount: stats.streakCount,
    lastScanDate: stats.lastScanDate,
    spellCorrections: stats.spellCorrections,
  });
  return { ...profile, introSeen };
};
