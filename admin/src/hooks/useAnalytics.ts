import { useState, useEffect } from 'react';
import { collection, getDocs, type DocumentData } from 'firebase/firestore';
import { db } from '../firebase';

export interface DailyPoint {
  date: string;
  activeUsers: number;
}

export interface AnalyticsKpis {
  totalUsers: number;
  activeLastWeek: number;
  totalWords: number;
  avgStreak: number;
}

interface UseAnalyticsResult {
  dailyPoints: DailyPoint[];
  kpis: AnalyticsKpis;
  loading: boolean;
}

const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export const useAnalytics = (): UseAnalyticsResult => {
  const [dailyPoints, setDailyPoints] = useState<DailyPoint[]>([]);
  const [kpis, setKpis] = useState<AnalyticsKpis>({
    totalUsers: 0, activeLastWeek: 0, totalWords: 0, avgStreak: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const users = snap.docs.map(d => d.data() as DocumentData);

        const now = new Date();
        const MS_DAY = 86_400_000;

        // Seed 14-day buckets keyed by formatted date
        const buckets: Record<string, number> = {};
        for (let i = 13; i >= 0; i--) {
          buckets[fmtDate(new Date(now.getTime() - i * MS_DAY))] = 0;
        }

        let totalWords = 0;
        let totalStreak = 0;
        let activeLastWeek = 0;

        for (const u of users) {
          totalWords += u.wordCount ?? 0;
          totalStreak += u.streak ?? 0;
          const lastActive: Date = u.lastActive?.toDate() ?? new Date(0);
          const key = fmtDate(lastActive);
          if (key in buckets) buckets[key]++;
          if (now.getTime() - lastActive.getTime() < 7 * MS_DAY) activeLastWeek++;
        }

        setDailyPoints(Object.entries(buckets).map(([date, activeUsers]) => ({ date, activeUsers })));
        setKpis({
          totalUsers: users.length,
          activeLastWeek,
          totalWords,
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
