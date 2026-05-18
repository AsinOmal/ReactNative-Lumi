// 📖 What this does:
// Aggregates the cross-user savedWords collection-group into a per-word
// leaderboard: how many times has each word been saved, by how many unique
// users, and when was it last saved.
//
// Why client-side aggregation instead of a Cloud Function:
//   savedWords is small (one doc per user per word). For the scale we ship at,
//   pulling the whole collection-group once and reducing in JS is faster than
//   maintaining a pre-aggregated leaderboard collection — and stays correct
//   if a delete happens.

import { useState, useEffect } from 'react';
import { collectionGroup, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export interface SavedWordStat {
  word: string;
  saveCount: number;
  uniqueUsers: number;
  lastSavedAt: Date;
}

interface UseSavedWordsAnalyticsResult {
  items: SavedWordStat[];
  totalSaves: number;
  loading: boolean;
  error: string | null;
}

export const useSavedWordsAnalytics = (): UseSavedWordsAnalyticsResult => {
  const [items, setItems] = useState<SavedWordStat[]>([]);
  const [totalSaves, setTotalSaves] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collectionGroup(db, 'savedWords'));
        // Aggregate: word -> { count, userSet, latestTs }
        const agg = new Map<
          string,
          { count: number; users: Set<string>; lastSavedAt: number }
        >();
        snap.docs.forEach((d) => {
          const data = d.data();
          // word field, or fall back to doc id (the rules enforce doc id == word).
          const word = (data.word ?? d.id).toLowerCase();
          // Parent path: /users/{uid}/savedWords/{word}
          const uid = d.ref.parent.parent?.id ?? '';
          const ts =
            typeof data.savedAt === 'number'
              ? data.savedAt
              : data.savedAt?.toDate?.()?.getTime?.() ?? Date.now();
          const entry = agg.get(word) ?? {
            count: 0,
            users: new Set<string>(),
            lastSavedAt: 0,
          };
          entry.count += 1;
          if (uid) {
            entry.users.add(uid);
          }
          if (ts > entry.lastSavedAt) {
            entry.lastSavedAt = ts;
          }
          agg.set(word, entry);
        });
        const sorted: SavedWordStat[] = Array.from(agg.entries())
          .map(([word, v]) => ({
            word,
            saveCount: v.count,
            uniqueUsers: v.users.size,
            lastSavedAt: new Date(v.lastSavedAt),
          }))
          .sort((a, b) => b.saveCount - a.saveCount);
        setItems(sorted);
        setTotalSaves(snap.size);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error('[useSavedWordsAnalytics] load failed:', e);
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { items, totalSaves, loading, error };
};
