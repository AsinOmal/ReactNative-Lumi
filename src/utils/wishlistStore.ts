/**
 * wishlistStore.ts
 *
 * Stores wished words locally in AsyncStorage.
 * When Firestore is integrated this can sync to /wishlist collection.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'lumi_wishlist';

export interface WishlistEntry {
  word: string;
  wishedAt: number;
}

async function load(): Promise<WishlistEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Returns all wished words, newest first */
export async function getWishlist(): Promise<WishlistEntry[]> {
  const list = await load();
  return list.slice().reverse();
}

/**
 * Add a word to the wishlist.
 * Silently ignores duplicates (same word already wished).
 * Returns true if the word was newly added.
 */
export async function wishWord(word: string): Promise<boolean> {
  const list = await load();
  if (list.some(e => e.word === word.toLowerCase())) return false;
  list.push({ word: word.toLowerCase(), wishedAt: Date.now() });
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
  return true;
}

/** Returns true if the word has already been wished */
export async function isWished(word: string): Promise<boolean> {
  const list = await load();
  return list.some(e => e.word === word.toLowerCase());
}
