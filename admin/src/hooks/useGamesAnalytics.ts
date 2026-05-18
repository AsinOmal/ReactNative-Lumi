// 📖 What this does:
// Aggregates the cross-user `gameProgress` collection-group into a per-game
// leaderboard. Each doc represents one user's progress in one game (doc id =
// game id, e.g. 'scanAndCount'). We count the number of users with progress
// per game and surface the most-recent play time.
//
// Caveat: only games that persist progress show up here. If a mobile game
// doesn't write to gameProgress (some don't yet), it won't appear — that's
// a mobile-side gap, not an admin bug.

import { useEffect, useState } from 'react';
import { collectionGroup, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export type GameSortMode = 'most' | 'least';

export interface GameStat {
  gameId: string;
  players: number; // unique users with progress in this game
  lastPlayedAt: Date;
}

interface UseGamesAnalyticsResult {
  items: GameStat[];
  totalPlayers: number;
  loading: boolean;
  error: string | null;
}

// Friendly display names for known game ids. Falls back to the raw id for
// games added later that haven't been mapped here.
export const GAME_DISPLAY: Record<string, string> = {
  scanAndCount: 'Scan & Count',
  arWordFind: 'AR Word Find',
  makeAMeal: 'Make a Meal',
  writeAndScan: 'Write & Scan',
};

export const useGamesAnalytics = (
  sortMode: GameSortMode = 'most'
): UseGamesAnalyticsResult => {
  const [items, setItems] = useState<GameStat[]>([]);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collectionGroup(db, 'gameProgress'));
        const agg = new Map<
          string,
          { users: Set<string>; lastPlayedAt: number }
        >();
        snap.docs.forEach((d) => {
          const data = d.data();
          const gameId = d.id;
          const uid = d.ref.parent.parent?.id ?? '';
          const ts =
            typeof data.lastPlayedAt === 'number'
              ? data.lastPlayedAt
              : (data.lastPlayedAt?.toDate?.()?.getTime?.() ?? 0);
          const cur = agg.get(gameId) ?? {
            users: new Set<string>(),
            lastPlayedAt: 0,
          };
          if (uid) {
            cur.users.add(uid);
          }
          if (ts > cur.lastPlayedAt) {
            cur.lastPlayedAt = ts;
          }
          agg.set(gameId, cur);
        });
        const list: GameStat[] = Array.from(agg.entries()).map(
          ([gameId, v]) => ({
            gameId,
            players: v.users.size,
            lastPlayedAt: new Date(v.lastPlayedAt),
          })
        );
        list.sort((a, b) =>
          sortMode === 'least'
            ? a.players - b.players
            : b.players - a.players
        );
        setItems(list);
        setTotalPlayers(
          list.reduce((sum, g) => sum + g.players, 0)
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error('[useGamesAnalytics] load failed:', e);
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sortMode]);

  return { items, totalPlayers, loading, error };
};
