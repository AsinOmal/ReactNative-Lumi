// 📖 What this does:
// One-stop hook that screens (PackDetailCTA, PackGateScreen) consume to render
// download state for a given pack. Wraps the Zustand download store + the
// imperative download service so each surface gets identical NoSpace /
// Cancelled / generic-error handling without re-implementing it.
//
// Bundled packs are normalised to status='downloaded' so the same render
// branches keep working when a pack later flips from 'bundled' to 'free'.
//
// Watch out: callers should treat status transitions as the source of truth —
// progress fields are only meaningful while status === 'downloading'.

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
import { useStrings } from "./useStrings";
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
  const strings = useStrings();
  const state = usePackDownloadStore((s) => s.packs[pack.id]);
  const startDownload = usePackDownloadStore((s) => s.startDownload);
  const updateProgress = usePackDownloadStore((s) => s.updateProgress);
  const completeDownload = usePackDownloadStore((s) => s.completeDownload);
  const failDownload = usePackDownloadStore((s) => s.failDownload);
  const deleteDownload = usePackDownloadStore((s) => s.deleteDownload);
  const remoteModels = useRemoteContentStore((s) => s.remoteModels);

  // Legacy Firestore docs without `packType` default to bundled (see src/types/pack.ts).
  const isBundled = (pack.packType ?? "bundled") === "bundled";
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
          : strings.downloadFailed;
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
    try {
      await deleteDownload(pack.id);
    } catch (e) {
      console.error("[usePackDownload] remove:", e);
    } finally {
      // Always invalidate so a partial cleanup still forces re-resolution.
      invalidateModelCache(pack.words);
    }
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
