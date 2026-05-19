/**
 * dailyWordHunt.ts
 *
 * Generates a deterministic daily target word seeded by today's date.
 * The same word is the hunt target for everyone on the same calendar day.
 */

import { MODEL_REGISTRY } from './modelRegistry';
import { usePackStore } from '../store/usePackStore';
import { SavedWord } from './achievementStore';

/** Today's date as YYYY-MM-DD in local time */
export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Deterministic hash from a date string */
function dateHash(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
  }
  return hash;
}

// Build the hunt pool from the bundled registry PLUS every word in every
// loaded pack — admin-uploaded packs (now including Fruits, after assets were
// migrated to Storage) only exist in usePackStore, not in MODEL_REGISTRY.
// Without this union, an empty MODEL_REGISTRY caused `idx = N % 0 = NaN` and
// the banner rendered with word === undefined → charAt crash.
function getHuntPool(): string[] {
  const packs = usePackStore.getState().packs;
  return [
    ...new Set([
      ...Object.keys(MODEL_REGISTRY),
      ...packs.flatMap((p) => p.words),
    ]),
  ];
}

/** Returns today's hunt word (always the same word for the same calendar day) */
export function getDailyWord(): string {
  const pool = getHuntPool();
  if (pool.length === 0) {
    return '';
  }
  const today = todayISO();
  const idx = dateHash(today) % pool.length;
  return pool[idx];
}

// 📖 What this does:
// Returns true only if the user saved today's daily word *today*. Older logic just checked
// `scannedWords.includes(getDailyWord())`, which marked the hunt as complete whenever the
// daily picker happened to land on a word the user had ever saved — so the hunt would
// "auto-complete" the moment a previously-saved word came back around.
export function isDailyWordFound(savedWords: SavedWord[]): boolean {
  const target = getDailyWord();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayMs = todayStart.getTime();
  return savedWords.some((w) => w.word === target && w.savedAt >= todayMs);
}
