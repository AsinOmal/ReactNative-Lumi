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
 * Routing decision for a word entering AR. Order of checks:
 *   1. No owning pack → available (legacy/dev words pre-dating Phase 10).
 *   2. Premium + not purchased → gated regardless of packType. This is the
 *      most important rule: admin's "Premium Pack" toggle is the visible
 *      source of truth, and the packType dropdown can legitimately be left
 *      as 'bundled' for packs whose assets happen to ship in the binary —
 *      we never want a paid pack to slip through just because that field
 *      wasn't set.
 *   3. Bundled → available (no download needed).
 *   4. Otherwise → available iff downloaded for the current assetVersion.
 */
export function decidePackGate(
  word: string,
  packs: Pack[],
  isDownloaded: (packId: string, assetVersion: string) => boolean,
  isPurchased: (packId: string) => boolean
): PackGateDecision {
  const pack = getPackForWord(word, packs);
  if (!pack) {
    return { status: 'available', pack: null };
  }
  if (pack.isPremium && !isPurchased(pack.id)) {
    return { status: 'gated', pack };
  }
  // Legacy Firestore docs that pre-date Phase 10 have no `packType`. Treat the
  // missing case as 'bundled' (the safe fallback documented in src/types/pack.ts).
  const packType = pack.packType ?? 'bundled';
  if (packType === 'bundled') {
    return { status: 'available', pack };
  }
  const ok = isDownloaded(pack.id, pack.assetVersion ?? '1.0.0');
  return { status: ok ? 'available' : 'gated', pack };
}
