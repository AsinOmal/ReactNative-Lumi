/**
 * Pure helpers for relating words to their parent pack. Lives outside the
 * Zustand store so non-React callers (services, log emitters) can use it
 * without subscribing.
 */

import { Pack } from '../types/pack';

/**
 * Find the pack that owns this word. Case-insensitive match against `pack.words`.
 * Returns null if the word isn't owned by any known pack — callers should treat
 * that as "not gated" (legacy/dev words that pre-date Phase 10).
 */
export function getPackForWord(word: string, packs: Pack[]): Pack | null {
  const key = word.toLowerCase();
  for (const pack of packs) {
    if (pack.words.some((w) => w.toLowerCase() === key)) {
      return pack;
    }
  }
  return null;
}

export interface PackGateDecision {
  status: 'available' | 'gated';
  pack: Pack | null;
}

/**
 * Routing decision for a word entering AR: available iff unowned, bundled, or
 * downloaded for the current assetVersion.
 */
export function decidePackGate(
  word: string,
  packs: Pack[],
  isDownloaded: (packId: string, assetVersion: string) => boolean
): PackGateDecision {
  const pack = getPackForWord(word, packs);
  // Legacy Firestore docs that pre-date Phase 10 have no `packType`. Treat the
  // missing case as 'bundled' (the safe fallback documented in src/types/pack.ts).
  const packType = pack?.packType ?? 'bundled';
  if (!pack || packType === 'bundled') {
    return { status: 'available', pack };
  }
  const ok = isDownloaded(pack.id, pack.assetVersion ?? '1.0.0');
  return { status: ok ? 'available' : 'gated', pack };
}
