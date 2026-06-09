/**
 * Model Registry — single entry point for resolving a word to its 3D model,
 * scale/position calibration, syllables, audio, and Sinhala label.
 *
 * All model + audio assets are admin-uploaded to Firebase Storage. Per-word
 * metadata lives in Firestore at `/models/{word}` (see RemoteModelEntry).
 * The in-binary `MODEL_REGISTRY` is intentionally empty — we removed ~77 MB
 * of bundled fruits/vegetables/vehicles GLBs once admin upload was wired.
 *
 * Resolution order in getModel():
 *   1. downloaded local file (file://... — fastest, offline-capable)
 *   2. remote Firestore URL (streamed, still works without download)
 *   3. bundled require() in MODEL_REGISTRY (legacy fallback, currently empty)
 *
 * Calibration reference (preserved for the admin docs at /models/{word}):
 *   Fruits — scale | positionY | positionZ
 *     apple       0.0037  | 0 | -1.0
 *     banana      0.00065 | 0 | -1.0
 *     cherry      0.05    | 0 | -1.0
 *     grape       0.012   | 0 | -1.0
 *     lemon       0.038   | 0 | -1.0
 *     mango       0.6     | 0 | -0.35
 *     orange      0.6     | 0 | -0.35
 *     pineapple   3.5     | 0 | -0.8
 *     strawberry  0.6     | 0 | -1.0
 *     watermelon  0.052   | 0 | -1.0
 *   Vegetables + vehicles — uncalibrated (placeholder 0.1 / 0.5). Test each
 *   on device before publishing.
 *
 * Cache invariants:
 *   - `_entryCache` only stores SUCCESSFUL resolutions (no nulls). A null
 *     would lock in stale "missing" state when packs are mid-hydration.
 *   - LRU-bounded to MAX_CACHE — prevents unbounded growth across long
 *     scanning sessions.
 *   - invalidateModelCache(words) is called by usePackDownload on
 *     complete/remove so a freshly-downloaded GLB swaps in immediately.
 */

import { useRemoteContentStore } from "../store/useRemoteContentStore";
import { usePackDownloadStore } from "../store/usePackDownloadStore";
import type { RemoteModelEntry } from "../types/remoteContent";
import { getAudioUriForPlayback, getModelUriForViro } from "./packStorage";

export type ModelKey = string;

export interface ModelEntry {
  source: number | { uri: string };
  scale: [number, number, number];
  position: [number, number, number];
  syllables: string[];
  audio: string;
  audioUrl?: string;
  emoji: string;
  sinhalaLabel?: string;
}

export type ModelSourceKind = 'bundled' | 'downloaded' | 'remote' | 'missing';

const remoteToEntry = (r: RemoteModelEntry): ModelEntry => ({
  source: { uri: r.modelUrl },
  scale: [r.scale, r.scale, r.scale],
  position: [0, r.positionY, r.positionZ ?? -1.0],
  syllables: r.syllables,
  audio: "",
  audioUrl: r.audioUrl,
  emoji: "",
  sinhalaLabel: r.sinhalaLabel,
});

const downloadedToEntry = (
  r: RemoteModelEntry,
  modelPath: string,
  audioPath: string | undefined,
  assetVersion: string
): ModelEntry => ({
  source: { uri: getModelUriForViro(modelPath, assetVersion) },
  scale: [r.scale, r.scale, r.scale],
  position: [0, r.positionY, r.positionZ ?? -1.0],
  syllables: r.syllables,
  audio: "",
  audioUrl: audioPath ? getAudioUriForPlayback(audioPath) : r.audioUrl,
  emoji: "",
  sinhalaLabel: r.sinhalaLabel,
});

// Map preserves insertion order — used for the LRU eviction policy below.
const _entryCache = new Map<string, ModelEntry>();
// Practical ceiling for a long scan session. 50 is overkill for typical
// usage (the active pack rarely exceeds 10 words) but bounds memory if a
// kid pings through every pack they own.
const MAX_CACHE = 50;

const setCache = (key: string, value: ModelEntry): void => {
  // Re-insert moves the key to the "most recently used" end of insertion
  // order so eviction always drops the genuinely oldest entry.
  _entryCache.delete(key);
  _entryCache.set(key, value);
  if (_entryCache.size > MAX_CACHE) {
    const oldest = _entryCache.keys().next().value;
    if (oldest !== undefined) {
      _entryCache.delete(oldest);
    }
  }
};

export function invalidateModelCache(words: string[]): void {
  words.forEach((w) => _entryCache.delete(w.toLowerCase()));
}

// Tier 1 — miscellaneous words bundled with the binary. Available offline on
// first launch with no download or account required. Scale values are
// placeholders — calibrate on device and update before App Store submission.
export const MODEL_REGISTRY: Record<ModelKey, ModelEntry> = {
  balloon: {
    source: require("../assets/models/misc/balloon.glb"),
    scale: [0.5, 0.5, 0.5],
    position: [0, 0, -1.0],
    syllables: ["bal", "loon"],
    audio: "balloon.mp3",
    emoji: "🎈",
    sinhalaLabel: "බැලූන්",
  },
  cat: {
    source: require("../assets/models/misc/cat.glb"),
    scale: [1, 1, 1],
    position: [0, 0, -1.0],
    syllables: ["cat"],
    audio: "cat.mp3",
    emoji: "🐱",
    sinhalaLabel: "බළලා",
  },
  fish: {
    source: require("../assets/models/misc/fish.glb"),
    scale: [0.1, 0.1, 0.1],
    position: [0, 0, -1.0],
    syllables: ["fish"],
    audio: "fish.mp3",
    emoji: "🐟",
    sinhalaLabel: "මාළුවා",
  },
  hat: {
    source: require("../assets/models/misc/hat.glb"),
    scale: [0.1, 0.1, 0.1],
    position: [0, 0, -1.0],
    syllables: ["hat"],
    audio: "hat.mp3",
    emoji: "🎩",
    sinhalaLabel: "තොප්පිය",
  },
  ship: {
    source: require("../assets/models/misc/ship.glb"),
    scale: [0.00005, 0.00005, 0.00005],
    position: [0, 0, -1.0],
    syllables: ["ship"],
    audio: "ship.mp3",
    emoji: "🚢",
    sinhalaLabel: "නෞකාව",
  },
  teddy: {
    source: require("../assets/models/misc/teddy.glb"),
    scale: [0.7, 0.7, 0.7],
    position: [0, 0, -1.0],
    syllables: ["ted", "dy"],
    audio: "teddy.mp3",
    emoji: "🧸",
    sinhalaLabel: "ටෙඩි",
  },
  dog: {
    source: require("../assets/models/misc/dog.glb"),
    scale: [1, 1, 1],
    position: [0, 0, -1.0],
    syllables: ["dog"],
    audio: "",
    emoji: "🐕",
  },
  icecream: {
    source: require("../assets/models/misc/ice-cream.glb"),
    scale: [0.8, 0.8, 0.8],
    position: [0, 0, -1.0],
    syllables: ["ice", "cream"],
    audio: "",
    emoji: "🍦",
  },
  sunflower: {
    source: require("../assets/models/misc/sunflower.glb"),
    scale: [1, 1, 1],
    position: [0, 0, -1.0],
    syllables: ["sun", "flow", "er"],
    audio: "",
    emoji: "🌻",
  },
  ball: {
    source: require("../assets/models/misc/ball.glb"),
    scale: [1, 1, 1],
    position: [0, 0, -1.0],
    syllables: ["ball"],
    audio: "",
    emoji: "⚽",
  },
};

export const getModel = (word: string): ModelEntry | null => {
  const key = word.toLowerCase();
  const cached = _entryCache.get(key);
  if (cached) {
    // Touch the key so a frequently-used model resists eviction.
    setCache(key, cached);
    return cached;
  }

  const remote = useRemoteContentStore.getState().remoteModels[key];
  let entry: ModelEntry | null = null;

  if (remote?.packId) {
    const dl = usePackDownloadStore.getState().packs[remote.packId];
    const modelPath = dl?.localModelPaths[key];
    if (dl && dl.status === "downloaded" && modelPath) {
      entry = downloadedToEntry(
        remote,
        modelPath,
        dl.localAudioPaths[key],
        dl.assetVersion
      );
    }
  }
  if (!entry && remote?.modelUrl) {
    entry = remoteToEntry(remote);
  }
  if (!entry) {
    entry = MODEL_REGISTRY[key] ?? null;
  }

  if (entry) {
    setCache(key, entry);
  }
  return entry;
};

export const getModelSourceKind = (word: string): ModelSourceKind => {
  const entry = getModel(word);
  if (!entry) {
    return 'missing';
  }
  if (typeof entry.source === 'number') {
    return 'bundled';
  }
  return entry.source.uri.startsWith('file://') ? 'downloaded' : 'remote';
};

export const canPlaceModel = (word: string): boolean => {
  const kind = getModelSourceKind(word);
  return kind === 'bundled' || kind === 'downloaded';
};
