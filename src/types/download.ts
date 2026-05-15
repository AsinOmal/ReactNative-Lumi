/**
 * Three-tier pack asset types.
 *
 * Bundled packs ship inside the binary via require(). Free packs download
 * GLB + audio from Firebase Storage on first use and persist under
 * DocumentDirectoryPath. Premium packs follow the same download flow but
 * gate behind an IAP unlock (Phase 11).
 *
 * See docs/DEVELOPMENT_PLAN.md → Phase 10 for the full architecture.
 */

export type PackType = 'bundled' | 'free' | 'premium';

export type DownloadStatus = 'idle' | 'downloading' | 'downloaded' | 'error';

export interface DownloadResult {
  localModelPaths: Record<string, string>;
  localAudioPaths: Record<string, string>;
}

export interface PackDownloadState {
  packId: string;
  status: DownloadStatus;
  progress: number;
  downloadedFiles: number;
  totalFiles: number;
  assetVersion: string;
  localModelPaths: Record<string, string>;
  localAudioPaths: Record<string, string>;
  errorMessage?: string;
}
