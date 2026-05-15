import type { PackType } from './download';

/**
 * Pack metadata — represents a Firestore /packs/{packId} document.
 *
 * Moved here from src/services/packService.ts in Phase 10 so download-system
 * modules can reference Pack without pulling in the Firestore client.
 *
 * packType / assetVersion / estimatedSizeMB are optional because Firestore
 * docs that pre-date Phase 10 will not have them. Consumers default missing
 * values to 'bundled' / '1.0.0' / 0 — which makes legacy packs treated as
 * already-available (no download flow), the safe fallback.
 */
export interface Pack {
  id: string;
  name: string;
  description?: string;
  wordCount: number;
  isPremium: boolean;
  isPublished?: boolean;
  words: string[];
  colorFrom: string;
  colorTo: string;
  coverImageUrl?: string;
  packType?: PackType;
  assetVersion?: string;
  estimatedSizeMB?: number;
  gateImageUrl?: string;
  detailImageUrl?: string;
}
