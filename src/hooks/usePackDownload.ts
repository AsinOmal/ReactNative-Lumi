/**
 * Hook screens use to render a pack's download UI. Wraps the store + service so
 * callers don't reimplement NoSpace/Cancelled handling. Bundled packs always
 * report `'downloaded'` so render branches stay identical once a pack flips to
 * `'free'`.
 */

import { useCallback } from "react";
import { Pack } from "../types/pack";
import { DownloadStatus } from "../types/download";
import { usePackDownloadStore } from "../store/usePackDownloadStore";
import { useRemoteContentStore } from "../store/useRemoteContentStore";
import {
  CancelledError,
  NoSpaceError,
  cancelPackDownload,
  downloadPack,
} from "../services/packDownloadService";
import { strings } from "../constants/strings";
import { invalidateModelCache } from "../utils/modelRegistry";

interface UsePackDownloadReturn {
  status: DownloadStatus;
  progress: number;
  downloadedFiles: number;
  totalFiles: number;
  errorMessage?: string;
  download: () => Promise<void>;
  cancel: () => void;
  remove: () => Promise<void>;
}

export function usePackDownload(pack: Pack): UsePackDownloadReturn {
  const state = usePackDownloadStore((s) => s.packs[pack.id]);
  const startDownload = usePackDownloadStore((s) => s.startDownload);
  const updateProgress = usePackDownloadStore((s) => s.updateProgress);
  const completeDownload = usePackDownloadStore((s) => s.completeDownload);
  const failDownload = usePackDownloadStore((s) => s.failDownload);
  const deleteDownload = usePackDownloadStore((s) => s.deleteDownload);
  const remoteModels = useRemoteContentStore((s) => s.remoteModels);

  const isBundled = pack.packType === "bundled";
  const status: DownloadStatus = isBundled
    ? "downloaded"
    : state?.status ?? "idle";
  const progress = isBundled ? 1 : state?.progress ?? 0;
  const downloadedFiles = isBundled ? 0 : state?.downloadedFiles ?? 0;
  const totalFiles = isBundled ? 0 : state?.totalFiles ?? 0;
  const errorMessage = state?.errorMessage;

  const download = useCallback(async () => {
    if (isBundled) {
      return;
    }
    const assetVersion = pack.assetVersion ?? "1.0.0";
    const totalEstimate = pack.words.filter((w) => remoteModels[w]).length * 2;
    startDownload(pack.id, totalEstimate);
    try {
      const result = await downloadPack(
        pack.id,
        pack.words,
        remoteModels,
        (done) => updateProgress(pack.id, done)
      );
      completeDownload(pack.id, result, assetVersion);
      invalidateModelCache(Object.keys(result.localModelPaths));
    } catch (e) {
      if (e instanceof CancelledError) {
        await deleteDownload(pack.id);
        return;
      }
      const message =
        e instanceof NoSpaceError
          ? strings.downloadNoSpace
          : e instanceof Error
          ? e.message
          : "Download failed";
      failDownload(pack.id, message);
    }
  }, [
    isBundled,
    pack.id,
    pack.words,
    pack.assetVersion,
    remoteModels,
    startDownload,
    updateProgress,
    completeDownload,
    failDownload,
    deleteDownload,
  ]);

  const cancel = useCallback(() => {
    if (isBundled) {
      return;
    }
    cancelPackDownload(pack.id);
  }, [isBundled, pack.id]);

  const remove = useCallback(async () => {
    if (isBundled) {
      return;
    }
    await deleteDownload(pack.id);
    invalidateModelCache(pack.words);
  }, [isBundled, pack.id, pack.words, deleteDownload]);

  return {
    status,
    progress,
    downloadedFiles,
    totalFiles,
    errorMessage,
    download,
    cancel,
    remove,
  };
}
