import { useState, useEffect } from 'react';
import {
  collection, collectionGroup, query, getDocs, where,
  getCountFromServer, type DocumentData,
} from 'firebase/firestore';
import { db } from '../firebase';

export interface DailyPoint {
  date: string;
  activeUsers: number;
}

export interface AnalyticsKpis {
  totalUsers: number;
  activeLastWeek: number;
  activeToday: number;
  wordsSaved: number;
  achievementsUnlocked: number;
  gamesPlayed: number;
  flaggedEvents: number;
  avgStreak: number;
}

interface UseAnalyticsResult {
  dailyPoints: DailyPoint[];
  kpis: AnalyticsKpis;
  loading: boolean;
}

const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// Falls back to 0 if a required index is missing.
const safeCount = async (ref: Parameters<typeof getCountFromServer>[0]): Promise<number> => {
  try { return (await getCountFromServer(ref)).data().count; }
  catch { return 0; }
};

export const useAnalytics = (): UseAnalyticsResult => {
  const [dailyPoints, setDailyPoints] = useState<DailyPoint[]>([]);
  const [kpis, setKpis] = useState<AnalyticsKpis>({
    totalUsers: 0, activeLastWeek: 0, activeToday: 0,
    wordsSaved: 0, achievementsUnlocked: 0, gamesPlayed: 0,
    flaggedEvents: 0, avgStreak: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const now = new Date();
        const MS_DAY = 86_400_000;
        const todayMs = new Date().setHours(0, 0, 0, 0);

        const [snap, wordsSaved, achievementsUnlocked, gamesPlayed, flaggedEvents] = await Promise.all([
          getDocs(collection(db, 'users')),
          safeCount(collectionGroup(db, 'savedWords')),
          safeCount(collectionGroup(db, 'achievements')),
          safeCount(collectionGroup(db, 'gameProgress')),
          safeCount(query(collectionGroup(db, 'activityLog'), where('flagged', '==', true))),
        ]);
        const users = snap.docs.map(d => d.data() as DocumentData);

        // Seed 14-day buckets keyed by formatted date
        const buckets: Record<string, number> = {};
        for (let i = 13; i >= 0; i--) {
          buckets[fmtDate(new Date(now.getTime() - i * MS_DAY))] = 0;
        }

        let totalStreak = 0;
        let activeLastWeek = 0;
        let activeToday = 0;

        for (const u of users) {
          totalStreak += u.streak ?? 0;
          const lastActive: Date = u.lastActive?.toDate() ?? new Date(0);
          const key = fmtDate(lastActive);
          if (key in buckets) buckets[key]++;
          if (now.getTime() - lastActive.getTime() < 7 * MS_DAY) activeLastWeek++;
          if (lastActive.getTime() >= todayMs) activeToday++;
        }

        setDailyPoints(Object.entries(buckets).map(([date, activeUsers]) => ({ date, activeUsers })));
        setKpis({
          totalUsers: users.length,
          activeLastWeek,
          activeToday,
          wordsSaved,
          achievementsUnlocked,
          gamesPlayed,
          flaggedEvents,
          avgStreak: users.length ? Math.round(totalStreak / users.length) : 0,
        });
      } catch (e) {
        console.error('[useAnalytics] load failed:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { dailyPoints, kpis, loading };
};
