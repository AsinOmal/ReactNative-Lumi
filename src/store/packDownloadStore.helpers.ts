/**
 * Internal helpers for usePackDownloadStore. Kept separate so the store file
 * stays under the 150-line cap.
 */

import { PackDownloadState } from '../types/download';

export type LocalPaths = {
  models: Record<string, string>;
  audio: Record<string, string>;
};

export const emptyState = (
  packId: string,
  totalFiles = 0
): PackDownloadState => ({
  packId,
  status: 'idle',
  progress: 0,
  downloadedFiles: 0,
  totalFiles,
  assetVersion: '',
  localModelPaths: {},
  localAudioPaths: {},
});

/** Immutably merge `partial` into `packs[packId]`, defaulting to an empty state. */
export const patchPack = (
  packs: Record<string, PackDownloadState>,
  packId: string,
  partial: Partial<PackDownloadState>
): Record<string, PackDownloadState> => ({
  ...packs,
  [packId]: { ...(packs[packId] ?? emptyState(packId)), ...partial },
});
