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
  savedWords:         'lumi_saved_words',       // SavedWord[] with timestamps
  spellCorrections:   'lumi_spell_corrections',
  sessionCount:       'lumi_session_count',
  earnedAchievements: 'lumi_earned_achievements',
  streakCount:        'lumi_streak_count',
  lastScanDate:       'lumi_last_scan_date',
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

export interface EarnedAchievement {
  id: string;
  unlockedAt: number;
  triggerWord: string;
}

export interface SavedWord {
  word: string;
  savedAt: number; // Unix timestamp (ms)
}

export interface AchievementProgress {
  scannedWords: string[];
  spellCorrections: number;
  sessionCount: number;
  earned: EarnedAchievement[];
}

/** Read current progress from storage */
export async function getProgress(): Promise<AchievementProgress> {
  const [scannedWords, spellCorrections, sessionCount, earnedRaw] =
    await Promise.all([
      getJSON<string[]>(KEYS.scannedWords, []),
      getJSON<number>(KEYS.spellCorrections, 0),
      getJSON<number>(KEYS.sessionCount, 0),
      // Read raw array to handle migration
      getJSON<any[]>(KEYS.earnedAchievements, []),
    ]);

  // Migrate any old 'string[]' IDs to metadata objects safely
  const earned: EarnedAchievement[] = earnedRaw.map(item => {
    if (typeof item === 'string') {
      return { id: item, unlockedAt: Date.now(), triggerWord: 'unknown' };
    }
    return item as EarnedAchievement;
  });

  return { scannedWords, spellCorrections, sessionCount, earned };
}

/**
 * Get all saved words, newest first.
 * Migrates plain string[] (from old installs) to SavedWord[] automatically.
 */
export async function getSavedWords(): Promise<SavedWord[]> {
  const raw = await getJSON<any[]>(KEYS.savedWords, []);
  const words: SavedWord[] = raw.map(item =>
    typeof item === 'string'
      ? { word: item, savedAt: 0 }
      : (item as SavedWord)
  );
  return words.slice().reverse(); // newest first
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

  // Also write to savedWords list (with timestamps) — separate from scannedWords
  if (!progress.scannedWords.includes(word)) {
    const savedWordsList = await getJSON<any[]>(KEYS.savedWords, []);
    const newSavedEntry: SavedWord = { word, savedAt: Date.now() };
    await setJSON(KEYS.savedWords, [...savedWordsList, newSavedEntry]);
  }

  // Persist updates
  await Promise.all([
    setJSON(KEYS.scannedWords, newWords),
    setJSON(KEYS.spellCorrections, newCorrections),
    setJSON(KEYS.sessionCount, newSessionCount),
    recordStreakDay(),
  ]);

  // Check which achievements are newly earned
  const updated: AchievementProgress = {
    scannedWords: newWords,
    spellCorrections: newCorrections,
    sessionCount: newSessionCount,
    earned: progress.earned,
  };

  const newlyEarned = checkAchievements(updated, isCorrection).filter(
    a => !progress.earned.some(e => e.id === a.id),
  );

  if (newlyEarned.length > 0) {
    const now = Date.now();
    const newEarnedObjects: EarnedAchievement[] = newlyEarned.map(a => ({
      id: a.id,
      unlockedAt: now,
      triggerWord: word,
    }));

    const updatedEarned = [
      ...progress.earned,
      ...newEarnedObjects,
    ];
    await setJSON(KEYS.earnedAchievements, updatedEarned);
  }

  return newlyEarned;
}

/**
 * Remove a word from saved progress (unsave).
 * We do not retract achievements or spell correction counts, 
 * just the word itself from the scannedWords list.
 */
export async function removeScan(word: string): Promise<void> {
  const progress = await getProgress();
  const nextWords = progress.scannedWords.filter(w => w !== word);
  // Also remove from named savedWords list
  const savedWordsList = await getJSON<any[]>(KEYS.savedWords, []);
  const nextSavedWords = savedWordsList.filter((s: any) =>
    (typeof s === 'string' ? s : s.word) !== word
  );
  await Promise.all([
    setJSON(KEYS.scannedWords, nextWords),
    setJSON(KEYS.savedWords, nextSavedWords),
  ]);
}

/** Reset session counter (call when app comes to foreground) */
export async function resetSessionCount(): Promise<void> {
  await setJSON(KEYS.sessionCount, 0);
}

// ── Streak ────────────────────────────────────────────────────────────────────

/** Returns today's date as YYYY-MM-DD in local time */
function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Returns yesterday's date as YYYY-MM-DD */
function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Read current streak count */
export async function getStreak(): Promise<number> {
  return getJSON<number>(KEYS.streakCount, 0);
}

/**
 * Update streak based on today's date.
 * - If already recorded today → no change
 * - If last scan was yesterday → increment
 * - Otherwise → reset to 1
 */
async function recordStreakDay(): Promise<void> {
  const today = todayISO();
  const yesterday = yesterdayISO();
  const [lastDate, currentStreak] = await Promise.all([
    getJSON<string>(KEYS.lastScanDate, ''),
    getJSON<number>(KEYS.streakCount, 0),
  ]);

  if (lastDate === today) return; // already counted today

  const newStreak = lastDate === yesterday ? currentStreak + 1 : 1;
  await Promise.all([
    setJSON(KEYS.streakCount, newStreak),
    setJSON(KEYS.lastScanDate, today),
  ]);
}

// ── Achievement Criteria ──────────────────────────────────────────────────────

function checkAchievements(p: AchievementProgress, isCorrection: boolean): Achievement[] {
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
  if (!isCorrection)                 add('perfect_scan');
  if (p.sessionCount >= 3)           add('speed_scanner');

  return earned;
}
