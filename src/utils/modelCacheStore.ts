// 📖 What this does:
// Tracks how often each word's AR model is viewed by the child (view count + last
// viewed timestamp). Stored in AsyncStorage so it persists across sessions.
//
// This data drives two things now and one thing later:
//   NOW:  getHotModels(n) returns the n most-viewed words — used by the AR Word Find
//         game to prioritise spawning models the child already knows.
//   LATER: When models move to remote storage (Phase 8+), this tells us exactly
//          which models to prefetch on Wi-Fi so the child never waits.
//
// Watch out: this is a write-on-every-view store. Keep writes cheap — it runs
// inside handleViewInAR which is already on the JS thread.

import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'lumi_model_cache';

export interface ModelCacheEntry {
  views: number;
  lastViewed: number; // Unix ms
}

export type ModelCache = Record<string, ModelCacheEntry>;

async function readCache(): Promise<ModelCache> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as ModelCache) : {};
  } catch {
    return {};
  }
}

async function writeCache(cache: ModelCache): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.error('[modelCacheStore] writeCache:', e);
  }
}

/** Increment the view count for a word. Call whenever a model is shown in AR. */
export async function recordModelView(word: string): Promise<void> {
  const cache = await readCache();
  const existing = cache[word] ?? { views: 0, lastViewed: 0 };
  cache[word] = { views: existing.views + 1, lastViewed: Date.now() };
  await writeCache(cache);
}

/** Returns the top n most-viewed words, sorted by view count descending. */
export async function getHotModels(n: number): Promise<string[]> {
  const cache = await readCache();
  return Object.entries(cache)
    .sort(([, a], [, b]) => b.views - a.views)
    .slice(0, n)
    .map(([word]) => word);
}

/** Returns the full cache (for debugging or future remote sync). */
export async function getCacheData(): Promise<ModelCache> {
  return readCache();
}
