/**
 * Pure path helpers for downloaded pack assets. No filesystem I/O — all logic
 * here is deterministic so it can be unit-tested without mocking RNBlobUtil.
 *
 * Why per-word (not per-pack) directories:
 *   The plan stores models under DocumentDir/lumi_models/{word}.glb. Words are
 *   globally unique across packs, so flattening avoids re-downloads if the same
 *   word appears in two packs (rare today, but cheap to support).
 *
 * Why query-string cache-bust on the Viro URI:
 *   ViroReact's native GLB cache keys on the URI string. When an admin re-uploads
 *   a model and bumps `assetVersion`, the file:// path doesn't change but the
 *   bytes do. Appending `?v={assetVersion}` forces Viro to treat it as a new
 *   asset and reload it. The OS filesystem ignores the query string.
 */

import RNBlobUtil from "react-native-blob-util";
import { config } from "../constants/config";
import { RemoteModelEntry } from "../types/remoteContent";

const docsDir = RNBlobUtil.fs.dirs.DocumentDir;

export interface AssetTask {
  word: string;
  url: string;
  path: string;
  kind: "model" | "audio";
}

export function getLocalModelPath(word: string): string {
  return `${docsDir}/${config.MODELS_CACHE_SUBDIR}/${word}.glb`;
}

export function getLocalAudioPath(word: string): string {
  return `${docsDir}/${config.AUDIO_CACHE_SUBDIR}/${word}.mp3`;
}

export function getModelUriForViro(path: string, assetVersion: string): string {
  return `file://${path}?v=${encodeURIComponent(assetVersion)}`;
}

export function getAudioUriForPlayback(path: string): string {
  return `file://${path}`;
}

/** Ensure the parent directory exists. RNBlobUtil writes fail silently if not. */
export async function ensureCacheDirs(): Promise<void> {
  try {
    const modelsDir = `${docsDir}/${config.MODELS_CACHE_SUBDIR}`;
    const audioDir = `${docsDir}/${config.AUDIO_CACHE_SUBDIR}`;
    const [modelsExists, audioExists] = await Promise.all([
      RNBlobUtil.fs.isDir(modelsDir),
      RNBlobUtil.fs.isDir(audioDir),
    ]);
    if (!modelsExists) {
      await RNBlobUtil.fs.mkdir(modelsDir);
    }
    if (!audioExists) {
      await RNBlobUtil.fs.mkdir(audioDir);
    }
  } catch (e) {
    console.error("[packStorage] ensureCacheDirs:", e);
    throw e;
  }
}

/** Resolve the {model,audio} download tasks for a pack from its remote metadata. */
export function buildAssetTasks(
  words: string[],
  remoteModels: Record<string, RemoteModelEntry>
): AssetTask[] {
  const tasks: AssetTask[] = [];
  for (const word of words) {
    const entry = remoteModels[word];
    if (!entry) {
      continue;
    }
    if (entry.modelUrl) {
      tasks.push({
        word,
        url: entry.modelUrl,
        path: getLocalModelPath(word),
        kind: "model",
      });
    }
    if (entry.audioUrl) {
      tasks.push({
        word,
        url: entry.audioUrl,
        path: getLocalAudioPath(word),
        kind: "audio",
      });
    }
  }
  return tasks;
}

/** Best-effort delete of a list of files. Used for partial-cleanup on cancel/error. */
export async function unlinkPaths(paths: string[]): Promise<void> {
  await Promise.all(
    paths.map(async (p) => {
      try {
        if (await RNBlobUtil.fs.exists(p)) {
          await RNBlobUtil.fs.unlink(p);
        }
      } catch (e) {
        console.warn("[packStorage] unlinkPaths:", e);
      }
    })
  );
}
