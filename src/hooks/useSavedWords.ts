// 📖 What this does:
// Manages saved words (Firestore onSnapshot) and wishlist (AsyncStorage) for
// SavedWordsScreen. The snapshot listener gives real-time updates — if the user
// saves a word on the Scan tab and immediately opens Saved Words, the list updates
// without needing a pull-to-refresh.
//
// Watch out: unsubscribe MUST be called on unmount. The returned cleanup from
// useEffect handles this. Do not call subscribeToSavedWords outside a useEffect.

import { useState, useEffect, useCallback } from 'react';
import { SavedWord } from '../utils/achievementStore';
import { WishlistEntry, getWishlist, removeWish } from '../utils/wishlistStore';
import { subscribeToSavedWords } from '../services/savedWordsService';

export const useSavedWords = (uid: string | null) => {
  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
  const [wishlist, setWishlist] = useState<WishlistEntry[]>([]);

  // Real-time Firestore listener — unsubscribes automatically on uid change or unmount
  useEffect(() => {
    if (!uid) {
      return;
    }
    const unsub = subscribeToSavedWords(uid, setSavedWords);
    return unsub;
  }, [uid]);

  const loadWishlist = useCallback(() => {
    getWishlist()
      .then(setWishlist)
      .catch(() => {});
  }, []);

  const handleRemoveWish = useCallback(async (word: string) => {
    try {
      await removeWish(word);
      setWishlist((prev) => prev.filter((w) => w.word !== word));
    } catch (e) {
      console.error('[useSavedWords] handleRemoveWish:', e);
    }
  }, []);

  return { savedWords, wishlist, loadWishlist, handleRemoveWish };
};
