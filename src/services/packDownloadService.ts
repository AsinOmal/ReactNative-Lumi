/**
 * Pack download orchestration. Module-level Maps key by packId so
 * `cancelPackDownload` can reach in-flight handles without prop drilling.
 * Concurrency batching prevents radio thrash on weak networks.
 */

import RNBlobUtil, {
  StatefulPromise,
  FetchBlobResponse,
} from "react-native-blob-util";
import { config } from "../constants/config";
import {
  AssetTask,
  buildAssetTasks,
  ensureCacheDirs,
  unlinkPaths,
} from "../utils/packStorage";
import { chunk } from "../utils/arrayUtils";
import { DownloadResult } from "../types/download";
import { RemoteModelEntry } from "../types/remoteContent";

export class NoSpaceError extends Error {
  constructor() {
    super("Not enough free space");
    this.name = "NoSpaceError";
  }
}
export class CancelledError extends Error {
  constructor() {
    super("Download cancelled");
    this.name = "CancelledError";
  }
}

const inFlight = new Map<string, StatefulPromise<FetchBlobResponse>[]>();
const cancelled = new Set<string>();

async function checkDiskSpace(): Promise<void> {
  const stats = await RNBlobUtil.fs.df();
  const free = Number((stats as { free?: number }).free ?? 0);
  if (free > 0 && free < config.DOWNLOAD_MIN_FREE_BYTES) {
    throw new NoSpaceError();
  }
}

async function fetchOne(packId: string, task: AssetTask): Promise<void> {
  const handle = RNBlobUtil.config({ path: task.path, fileCache: false }).fetch(
    "GET",
    task.url
  );
  const handles = inFlight.get(packId) ?? [];
  handles.push(handle);
  inFlight.set(packId, handles);
  await handle;
  if (cancelled.has(packId)) {
    throw new CancelledError();
  }
  const exists = await RNBlobUtil.fs.exists(task.path);
  if (!exists) {
    throw new Error(`Validation failed: ${task.path}`);
  }
  const stat = await RNBlobUtil.fs.stat(task.path);
  if (Number(stat.size) <= 0) {
    throw new Error(`Empty file: ${task.path}`);
  }
}

async function fetchWithRetry(packId: string, task: AssetTask): Promise<void> {
  try {
    await fetchOne(packId, task);
  } catch (e) {
    if (e instanceof CancelledError || cancelled.has(packId)) {
      throw new CancelledError();
    }
    console.warn(`[packDownloadService] retrying ${task.word}/${task.kind}`);
    await fetchOne(packId, task);
  }
}

export async function downloadPack(
  packId: string,
  words: string[],
  remoteModels: Record<string, RemoteModelEntry>,
  onProgress: (downloaded: number, total: number) => void
): Promise<DownloadResult> {
  cancelled.delete(packId);
  inFlight.set(packId, []);
  const tasks = buildAssetTasks(words, remoteModels);
  try {
    await ensureCacheDirs();
    await checkDiskSpace();
    if (tasks.length === 0) {
      throw new Error("No remote assets resolved for pack");
    }
    const total = tasks.length;
    let done = 0;
    for (const batch of chunk(tasks, config.DOWNLOAD_CONCURRENCY)) {
      if (cancelled.has(packId)) {
        throw new CancelledError();
      }
      await Promise.all(
        batch.map(async (t) => {
          await fetchWithRetry(packId, t);
          done += 1;
          onProgress(done, total);
        })
      );
    }
    const localModelPaths: Record<string, string> = {};
    const localAudioPaths: Record<string, string> = {};
    tasks.forEach((t) => {
      if (t.kind === "model") {
        localModelPaths[t.word] = t.path;
      } else {
        localAudioPaths[t.word] = t.path;
      }
    });
    return { localModelPaths, localAudioPaths };
  } catch (e) {
    await unlinkPaths(tasks.map((t) => t.path));
    throw e;
  } finally {
    inFlight.delete(packId);
    cancelled.delete(packId);
  }
}

export function cancelPackDownload(packId: string): void {
  cancelled.add(packId);
  const handles = inFlight.get(packId) ?? [];
  handles.forEach((h) => {
    try {
      h.cancel();
    } catch (e) {
      console.warn("[packDownloadService] cancel:", e);
    }
  });
  inFlight.delete(packId);
}

export async function deleteCachedPack(
  localModelPaths: Record<string, string>,
  localAudioPaths: Record<string, string>
): Promise<void> {
  await unlinkPaths([
    ...Object.values(localModelPaths),
    ...Object.values(localAudioPaths),
  ]);
}
