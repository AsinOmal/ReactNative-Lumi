/**
 * Per-pack download state, persisted to AsyncStorage. `isDownloaded` is
 * version-aware so an admin GLB re-upload (with bumped `assetVersion`) forces
 * re-download. `resetStuckDownloads` runs at boot to clear app-kill leftovers.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DownloadResult, PackDownloadState } from "../types/download";
import { Pack } from "../types/pack";
import { deleteCachedPack } from "../services/packDownloadService";
import {
  getLocalAudioPath,
  getLocalModelPath,
  unlinkPaths,
} from "../utils/packStorage";
import { LocalPaths, emptyState, patchPack } from "./packDownloadStore.helpers";

interface PackDownloadStore {
  packs: Record<string, PackDownloadState>;
  startDownload: (packId: string, totalFiles: number) => void;
  updateProgress: (packId: string, downloaded: number) => void;
  completeDownload: (
    packId: string,
    result: DownloadResult,
    assetVersion: string
  ) => void;
  failDownload: (packId: string, message: string) => void;
  deleteDownload: (packId: string) => Promise<void>;
  resetStuckDownloads: (allPacks: Pack[]) => Promise<void>;
  isDownloaded: (packId: string, assetVersion: string) => boolean;
  getLocalPaths: (packId: string) => LocalPaths | null;
}

export const usePackDownloadStore = create<PackDownloadStore>()(
  persist(
    (set, get) => ({
      packs: {},

      startDownload: (packId, totalFiles) =>
        set((s) => ({
          packs: {
            ...s.packs,
            [packId]: {
              ...emptyState(packId, totalFiles),
              status: "downloading",
            },
          },
        })),

      updateProgress: (packId, downloaded) =>
        set((s) => {
          const cur = s.packs[packId];
          if (!cur) {
            return s;
          }
          const total = cur.totalFiles || 1;
          return {
            packs: patchPack(s.packs, packId, {
              downloadedFiles: downloaded,
              progress: downloaded / total,
            }),
          };
        }),

      completeDownload: (packId, result, assetVersion) =>
        set((s) => ({
          packs: patchPack(s.packs, packId, {
            status: "downloaded",
            progress: 1,
            downloadedFiles: s.packs[packId]?.totalFiles ?? 0,
            assetVersion,
            localModelPaths: result.localModelPaths,
            localAudioPaths: result.localAudioPaths,
            errorMessage: undefined,
          }),
        })),

      failDownload: (packId, message) =>
        set((s) => ({
          packs: patchPack(s.packs, packId, {
            status: "error",
            errorMessage: message,
          }),
        })),

      deleteDownload: async (packId) => {
        const cur = get().packs[packId];
        if (cur) {
          await deleteCachedPack(cur.localModelPaths, cur.localAudioPaths);
        }
        set((s) => {
          const next = { ...s.packs };
          delete next[packId];
          return { packs: next };
        });
      },

      resetStuckDownloads: async (allPacks) => {
        const stuck = Object.values(get().packs).filter(
          (p) => p.status === "downloading"
        );
        if (stuck.length === 0) {
          return;
        }
        for (const s of stuck) {
          const pack = allPacks.find((p) => p.id === s.packId);
          if (!pack) {
            continue;
          }
          const paths = pack.words.flatMap((w) => [
            getLocalModelPath(w),
            getLocalAudioPath(w),
          ]);
          await unlinkPaths(paths);
        }
        set((state) => {
          const next = { ...state.packs };
          stuck.forEach((s) => {
            next[s.packId] = emptyState(s.packId);
          });
          return { packs: next };
        });
      },

      isDownloaded: (packId, assetVersion) => {
        const p = get().packs[packId];
        return (
          !!p && p.status === "downloaded" && p.assetVersion === assetVersion
        );
      },

      getLocalPaths: (packId) => {
        const p = get().packs[packId];
        if (!p || p.status !== "downloaded") {
          return null;
        }
        return { models: p.localModelPaths, audio: p.localAudioPaths };
      },
    }),
    {
      name: "@lumi/pack_download_store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ packs: state.packs }),
    }
  )
);
