import { useState, useEffect } from 'react';
import {
  collection,
  collectionGroup,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  getCountFromServer,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { DashboardStats } from '../types';

export interface WordStat {
  word: string;
  count: number;
}

export interface ActivityRow {
  id: string;
  uid: string;
  email: string;
  username: string;
  word: string;
  game: string;
  timestamp: string;
  flagged: boolean;
}

interface UseDashboardResult {
  stats: DashboardStats | null;
  recentActivity: ActivityRow[];
  topWords: WordStat[];
  loading: boolean;
}

const toMs = (v: unknown): number =>
  !v
    ? 0
    : typeof (v as any).toDate === 'function'
    ? (v as any).toDate().getTime()
    : typeof v === 'number'
    ? v
    : 0;

const formatRelative = (ms: number): string => {
  const mins = Math.floor((Date.now() - ms) / 60_000);
  if (mins < 1) {
    return 'Just now';
  }
  if (mins < 60) {
    return `${mins} min ago`;
  }
  const hrs = Math.floor(mins / 60);
  return hrs < 24 ? `${hrs}h ago` : `${Math.floor(hrs / 24)}d ago`;
};

// Falls back to 0 if a required composite index is missing.
const fetchFlaggedCount = async (): Promise<number> => {
  try {
    return (
      await getCountFromServer(
        query(collectionGroup(db, 'activityLog'), where('flagged', '==', true))
      )
    ).data().count;
  } catch {
    return 0;
  }
};
const fetchGroupCount = async (col: string): Promise<number> => {
  try {
    return (await getCountFromServer(collectionGroup(db, col))).data().count;
  } catch {
    return 0;
  }
};

// Count distinct users who have any activityLog entry today.
// Fetches the 500 most recent entries (no where-filter to avoid index requirement)
// and counts distinct uids whose timestamp falls within today.
const fetchActiveTodayCount = async (todayMs: number): Promise<number> => {
  try {
    const snap = await getDocs(
      query(
        collectionGroup(db, 'activityLog'),
        orderBy('timestamp', 'desc'),
        limit(500)
      )
    );
    const uids = new Set(
      snap.docs
        .filter((d) => {
          const ts = d.data().timestamp;
          return toMs(ts) >= todayMs;
        })
        .map((d) => d.ref.path.split('/')[1])
    );
    return uids.size;
  } catch {
    return 0;
  }
};
const fetchWeeklySavedCount = async (): Promise<number> => {
  try {
    return (
      await getCountFromServer(
        query(
          collectionGroup(db, 'savedWords'),
          where('savedAt', '>=', Date.now() - 7 * 86_400_000)
        )
      )
    ).data().count;
  } catch {
    return 0;
  }
};
const fetchTopWords = async (): Promise<WordStat[]> => {
  try {
    const snap = await getDocs(collectionGroup(db, 'savedWords'));
    const tally: Record<string, number> = {};
    snap.docs.forEach((d) => {
      const w = d.data().word as string;
      if (w) {
        tally[w] = (tally[w] ?? 0) + 1;
      }
    });
    return Object.entries(tally)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  } catch {
    return [];
  }
};

export const useDashboard = (): UseDashboardResult => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityRow[]>([]);
  const [topWords, setTopWords] = useState<WordStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const todayMs = new Date().setHours(0, 0, 0, 0);

        const [
          usersSnap,
          activitySnap,
          flaggedEvents,
          wordsSaved,
          wordsSavedThisWeek,
          achievementsUnlocked,
          gamesPlayed,
          rawTopWords,
          activeToday,
        ] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(
            query(
              collectionGroup(db, 'activityLog'),
              orderBy('timestamp', 'desc'),
              limit(5)
            )
          ),
          fetchFlaggedCount(),
          fetchGroupCount('savedWords'),
          fetchWeeklySavedCount(),
          fetchGroupCount('achievements'),
          fetchGroupCount('gameProgress'),
          fetchTopWords(),
          fetchActiveTodayCount(todayMs),
        ]);

        let newUsersToday = 0;
        const uidToUser = new Map<
          string,
          { email: string; username: string }
        >();

        for (const d of usersSnap.docs) {
          const u = d.data();
          if (toMs(u.createdAt) >= todayMs) {
            newUsersToday++;
          }
          uidToUser.set(d.id, {
            email: u.email ?? d.id,
            username: u.username ?? '',
          });
        }

        setStats({
          totalUsers: usersSnap.size,
          newUsersToday,
          activeToday,
          wordsSaved,
          wordsSavedThisWeek,
          gamesPlayed,
          achievementsUnlocked,
          flaggedEvents,
        });
        setTopWords(rawTopWords);

        setRecentActivity(
          activitySnap.docs.map((d) => {
            const data = d.data();
            const uid = d.ref.path.split('/')[1] ?? '';
            const userInfo = uidToUser.get(uid);
            return {
              id: d.id,
              uid,
              email: userInfo?.email ?? uid,
              username: userInfo?.username ?? '',
              word: data.word ?? '',
              game: data.source ?? 'Scan',
              timestamp: formatRelative(toMs(data.timestamp)),
              flagged: data.flagged ?? false,
            };
          })
        );
      } catch (e) {
        console.error('[useDashboard] load failed:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { stats, recentActivity, topWords, loading };
};
