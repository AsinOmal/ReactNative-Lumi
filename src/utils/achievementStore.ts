/**
 * achievementStore.ts
 *
 * AsyncStorage-backed store for tracking achievement progress.
 * All data is stored locally — no Firestore dependency.
 *
 * Keys:
 *   lumi_scanned_words        string[]  — unique canonical words saved
 *   lumi_spell_corrections    number    — total spell corrections recorded
 *   lumi_session_count        number    — words saved in current app session
 *   lumi_earned_achievements  string[]  — achievement IDs already earned
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACHIEVEMENTS, Achievement } from './achievementRegistry';

const KEYS = {
  scannedWords:       'lumi_scanned_words',
  spellCorrections:   'lumi_spell_corrections',
  sessionCount:       'lumi_session_count',
  earnedAchievements: 'lumi_earned_achievements',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function setJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface AchievementProgress {
  scannedWords: string[];
  spellCorrections: number;
  sessionCount: number;
  earnedIds: string[];
}

/** Read current progress from storage */
export async function getProgress(): Promise<AchievementProgress> {
  const [scannedWords, spellCorrections, sessionCount, earnedIds] =
    await Promise.all([
      getJSON<string[]>(KEYS.scannedWords, []),
      getJSON<number>(KEYS.spellCorrections, 0),
      getJSON<number>(KEYS.sessionCount, 0),
      getJSON<string[]>(KEYS.earnedAchievements, []),
    ]);
  return { scannedWords, spellCorrections, sessionCount, earnedIds };
}

/**
 * Record a word save event and return any newly unlocked achievements.
 *
 * @param word         Canonical word that was saved (e.g. "apple")
 * @param isCorrection Whether this save involved a spelling correction
 */
export async function recordScan(
  word: string,
  isCorrection: boolean,
): Promise<Achievement[]> {
  const progress = await getProgress();

  // Update stats
  const newWords = progress.scannedWords.includes(word)
    ? progress.scannedWords
    : [...progress.scannedWords, word];

  const newCorrections = isCorrection
    ? progress.spellCorrections + 1
    : progress.spellCorrections;

  const newSessionCount = progress.sessionCount + 1;

  // Persist updates
  await Promise.all([
    setJSON(KEYS.scannedWords, newWords),
    setJSON(KEYS.spellCorrections, newCorrections),
    setJSON(KEYS.sessionCount, newSessionCount),
  ]);

  // Check which achievements are newly earned
  const updated: AchievementProgress = {
    scannedWords: newWords,
    spellCorrections: newCorrections,
    sessionCount: newSessionCount,
    earnedIds: progress.earnedIds,
  };

  const newlyEarned = checkAchievements(updated).filter(
    a => !progress.earnedIds.includes(a.id),
  );

  if (newlyEarned.length > 0) {
    const updatedEarned = [
      ...progress.earnedIds,
      ...newlyEarned.map(a => a.id),
    ];
    await setJSON(KEYS.earnedAchievements, updatedEarned);
  }

  return newlyEarned;
}

/** Reset session counter (call when app comes to foreground) */
export async function resetSessionCount(): Promise<void> {
  await setJSON(KEYS.sessionCount, 0);
}

// ── Achievement Criteria ──────────────────────────────────────────────────────

function checkAchievements(p: AchievementProgress): Achievement[] {
  const earned: Achievement[] = [];
  const totalWords = p.scannedWords.length;
  const add = (id: string) => {
    const a = ACHIEVEMENTS.find(x => x.id === id);
    if (a) earned.push(a);
  };

  if (totalWords >= 1)  add('first_scan');
  if (totalWords >= 3)  add('word_trio');
  if (totalWords >= 5)  add('half_pack');
  if (totalWords >= 10) add('pack_master');

  if (p.spellCorrections >= 3)       add('spell_hero');
  if (!p.scannedWords.length || true) { /* perfect_scan checked per-event */ }
  if (p.sessionCount >= 3)           add('speed_scanner');

  return earned;
}

/** Check perfect_scan separately (exact match, no correction) */
export function checkPerfectScan(
  isCorrection: boolean,
  earnedIds: string[],
): Achievement | null {
  if (isCorrection) return null;
  if (earnedIds.includes('perfect_scan')) return null;
  return ACHIEVEMENTS.find(a => a.id === 'perfect_scan') ?? null;
}
