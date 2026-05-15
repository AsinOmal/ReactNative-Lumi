// 📖 What this does:
// Stores wished words in AsyncStorage (personal, instant) and increments a
// community requestCount in Firestore /wishlist/{word} (aggregate, fire-and-forget).
// The admin Wishlist screen reads Firestore to see which words users want most.
// Firestore writes are best-effort — a failure never blocks the local wish.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp } from '@react-native-firebase/app';
import { getFirestore, doc, setDoc, increment } from '@react-native-firebase/firestore';

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
 * Saves locally and increments the community count in Firestore.
 * Silently ignores duplicates (same word already wished by this user).
 * Returns true if the word was newly added.
 */
export async function wishWord(word: string): Promise<boolean> {
  const key = word.toLowerCase();
  const list = await load();
  if (list.some(e => e.word === key)) return false;

  list.push({ word: key, wishedAt: Date.now() });
  await AsyncStorage.setItem(KEY, JSON.stringify(list));

  // Fire-and-forget community aggregate — never throws to caller
  setDoc(
    doc(getFirestore(getApp()), 'wishlist', key),
    { word: key, requestCount: increment(1), lastWishedAt: Date.now() },
    { merge: true },
  ).catch(() => {});

  return true;
}

/** Returns true if the word has already been wished by this user */
export async function isWished(word: string): Promise<boolean> {
  const list = await load();
  return list.some(e => e.word === word.toLowerCase());
}

/** Remove a word from the local wishlist (does not decrement community count) */
export async function removeWish(word: string): Promise<void> {
  const list = await load();
  const next = list.filter(e => e.word !== word.toLowerCase());
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}
