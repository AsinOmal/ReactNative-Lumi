// 📖 What this does:
// Aggregates the cross-user `screenTime` collection-group into:
//   - a per-user leaderboard (total minutes over the time-window, days active)
//   - a 14-day trend (sum of minutes across all users per day)
//
// Schema: /users/{uid}/screenTime/{YYYY-MM-DD} → { totalMinutes: number }

import { useEffect, useState } from 'react';
import { collectionGroup, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export type ScreenTimeRange = '7d' | '30d' | 'all';

export interface UserScreenTimeStat {
  uid: string;
  totalMinutes: number;
  daysActive: number;
  lastActiveDate: string; // YYYY-MM-DD
}

export interface ScreenTimeTrendPoint {
  date: string;
  totalMinutes: number;
}

interface UseScreenTimeAnalyticsResult {
  perUser: UserScreenTimeStat[];
  trend: ScreenTimeTrendPoint[];
  totalMinutes: number;
  loading: boolean;
  error: string | null;
}

const fmtShort = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const todayKey = (): string => new Date().toISOString().slice(0, 10);

const daysAgoKey = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

export const useScreenTimeAnalytics = (
  range: ScreenTimeRange = '7d'
): UseScreenTimeAnalyticsResult => {
  const [perUser, setPerUser] = useState<UserScreenTimeStat[]>([]);
  const [trend, setTrend] = useState<ScreenTimeTrendPoint[]>([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const snap = await getDocs(collectionGroup(db, 'screenTime'));

        // Build the date floor for the current range.
        const cutoff =
          range === 'all'
            ? '0000-00-00'
            : range === '30d'
              ? daysAgoKey(29)
              : daysAgoKey(6);

        // Aggregate per-user inside the range.
        const userAgg = new Map<
          string,
          { totalMinutes: number; days: Set<string>; lastActive: string }
        >();
        let grandTotal = 0;

        snap.docs.forEach((d) => {
          const dateKey = d.id; // YYYY-MM-DD
          if (dateKey < cutoff) {
            return;
          }
          const data = d.data();
          const minutes = (data.totalMinutes as number) ?? 0;
          const uid = d.ref.parent.parent?.id ?? '';
          if (!uid) {
            return;
          }
          grandTotal += minutes;
          const cur = userAgg.get(uid) ?? {
            totalMinutes: 0,
            days: new Set<string>(),
            lastActive: '',
          };
          cur.totalMinutes += minutes;
          cur.days.add(dateKey);
          if (dateKey > cur.lastActive) {
            cur.lastActive = dateKey;
          }
          userAgg.set(uid, cur);
        });

        // 14-day trend uses the same docs but a fixed window so the chart
        // stays comparable regardless of the leaderboard range filter.
        const trendBuckets: Record<string, number> = {};
        const today = new Date();
        for (let i = 13; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          trendBuckets[d.toISOString().slice(0, 10)] = 0;
        }
        snap.docs.forEach((d) => {
          if (d.id in trendBuckets) {
            trendBuckets[d.id] +=
              (d.data().totalMinutes as number) ?? 0;
          }
        });

        setPerUser(
          Array.from(userAgg.entries())
            .map(([uid, v]) => ({
              uid,
              totalMinutes: v.totalMinutes,
              daysActive: v.days.size,
              lastActiveDate: v.lastActive,
            }))
            .sort((a, b) => b.totalMinutes - a.totalMinutes)
        );
        setTrend(
          Object.entries(trendBuckets).map(([dateKey, mins]) => ({
            date: fmtShort(new Date(dateKey)),
            totalMinutes: mins,
          }))
        );
        setTotalMinutes(grandTotal);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error('[useScreenTimeAnalytics] load failed:', e);
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [range]);

  return { perUser, trend, totalMinutes, loading, error };
};

export const todayDateKey = todayKey;
