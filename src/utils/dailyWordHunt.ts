/**
 * dailyWordHunt.ts
 *
 * Generates a deterministic daily target word seeded by today's date.
 * The same word is the hunt target for everyone on the same calendar day.
 */

import { MODEL_REGISTRY } from './modelRegistry';

/** Today's date as YYYY-MM-DD in local time */
export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Deterministic hash from a date string */
function dateHash(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
  }
  return hash;
}

const ALL_WORDS = Object.keys(MODEL_REGISTRY);

/** Returns today's hunt word (always the same word for the same calendar day) */
export function getDailyWord(): string {
  const today = todayISO();
  const idx = dateHash(today) % ALL_WORDS.length;
  return ALL_WORDS[idx];
}

/** True if the user has already saved today's hunt word */
export function isDailyWordFound(scannedWords: string[]): boolean {
  return scannedWords.includes(getDailyWord());
}
