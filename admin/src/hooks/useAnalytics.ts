import { useState, useEffect } from 'react';
import {
  collection,
  collectionGroup,
  query,
  getDocs,
  where,
  getCountFromServer,
  type DocumentData,
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
  wishlistRequests: number;
  screenTimeTodayMin: number;
  packPreviewSessions: number;
  packPreviewMinutes: number;
}

export interface PackPreviewStat {
  label: string;
  count: number;
}

export interface SlowPreviewRow {
  id: string;
  packName: string;
  word: string;
  durationMs: number;
}

interface UseAnalyticsResult {
  dailyPoints: DailyPoint[];
  kpis: AnalyticsKpis;
  topPreviewPacks: PackPreviewStat[];
  topPreviewWords: PackPreviewStat[];
  slowPreviewRows: SlowPreviewRow[];
  loading: boolean;
}

const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// Falls back to 0 if a required index is missing.
const safeCount = async (
  ref: Parameters<typeof getCountFromServer>[0]
): Promise<number> => {
  try {
    return (await getCountFromServer(ref)).data().count;
  } catch {
    return 0;
  }
};

export const useAnalytics = (): UseAnalyticsResult => {
  const [dailyPoints, setDailyPoints] = useState<DailyPoint[]>([]);
  const [kpis, setKpis] = useState<AnalyticsKpis>({
    totalUsers: 0,
    activeLastWeek: 0,
    activeToday: 0,
    wordsSaved: 0,
    achievementsUnlocked: 0,
    gamesPlayed: 0,
    flaggedEvents: 0,
    avgStreak: 0,
    wishlistRequests: 0,
    screenTimeTodayMin: 0,
    packPreviewSessions: 0,
    packPreviewMinutes: 0,
  });
  const [topPreviewPacks, setTopPreviewPacks] = useState<PackPreviewStat[]>([]);
  const [topPreviewWords, setTopPreviewWords] = useState<PackPreviewStat[]>([]);
  const [slowPreviewRows, setSlowPreviewRows] = useState<SlowPreviewRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const now = new Date();
        const MS_DAY = 86_400_000;
        const todayMs = new Date().setHours(0, 0, 0, 0);
        const todayKey = new Date().toISOString().slice(0, 10);

        const [
          snap,
          wordsSaved,
          achievementsUnlocked,
          gamesPlayed,
          flaggedEvents,
          wishlistSnap,
          screenTimeSnap,
          previewSnap,
        ] = await Promise.all([
          getDocs(collection(db, 'users')),
          safeCount(collectionGroup(db, 'savedWords')),
          safeCount(collectionGroup(db, 'achievements')),
          safeCount(collectionGroup(db, 'gameProgress')),
          safeCount(
            query(
              collectionGroup(db, 'activityLog'),
              where('flagged', '==', true)
            )
          ),
          getDocs(collection(db, 'wishlist')).catch(() => null),
          // ScreenTime docs are keyed by YYYY-MM-DD per user. Filtering a
          // collectionGroup by doc id isn't a clean Firestore query, so we
          // pull the whole group and filter client-side — fine because the
          // collection is small (N users × recent days). Returns null on
          // permission failure so the KPI degrades to 0 instead of crashing.
          getDocs(collectionGroup(db, 'screenTime')).catch(() => null),
          getDocs(collectionGroup(db, 'packPreviewSessions')).catch(() => null),
        ]);
        const users = snap.docs.map((d) => d.data() as DocumentData);
        const wishlistRequests =
          wishlistSnap?.docs.reduce(
            (sum, d) => sum + ((d.data().requestCount as number) ?? 0),
            0
          ) ?? 0;
        const screenTimeTodayMin =
          screenTimeSnap?.docs
            .filter((d) => d.id === todayKey)
            .reduce(
              (sum, d) => sum + ((d.data().totalMinutes as number) ?? 0),
              0
            ) ?? 0;
        const previewDocs = previewSnap?.docs ?? [];
        const packTally: Record<string, number> = {};
        const wordTally: Record<string, number> = {};
        let previewDurationMs = 0;

        for (const d of previewDocs) {
          const data = d.data();
          const packName = (data.packName as string) || 'Unknown pack';
          const word = (data.word as string) || 'unknown';
          const durationMs = (data.durationMs as number) ?? 0;
          previewDurationMs += durationMs;
          packTally[packName] = (packTally[packName] ?? 0) + 1;
          wordTally[word] = (wordTally[word] ?? 0) + 1;
        }

        const sortStats = (tally: Record<string, number>) =>
          Object.entries(tally)
            .map(([label, count]) => ({ label, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

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
          if (key in buckets) {
            buckets[key]++;
          }
          if (now.getTime() - lastActive.getTime() < 7 * MS_DAY) {
            activeLastWeek++;
          }
          if (lastActive.getTime() >= todayMs) {
            activeToday++;
          }
        }

        setDailyPoints(
          Object.entries(buckets).map(([date, activeUsers]) => ({
            date,
            activeUsers,
          }))
        );
        setKpis({
          totalUsers: users.length,
          activeLastWeek,
          activeToday,
          wordsSaved,
          achievementsUnlocked,
          gamesPlayed,
          flaggedEvents,
          avgStreak: users.length ? Math.round(totalStreak / users.length) : 0,
          wishlistRequests,
          screenTimeTodayMin,
          packPreviewSessions: previewDocs.length,
          packPreviewMinutes: Math.round(previewDurationMs / 60_000),
        });
        setTopPreviewPacks(sortStats(packTally));
        setTopPreviewWords(sortStats(wordTally));
        setSlowPreviewRows(
          previewDocs
            .filter((d) => d.data().loadTimedOut)
            .map((d) => ({
              id: d.id,
              packName: (d.data().packName as string) || 'Unknown pack',
              word: (d.data().word as string) || 'unknown',
              durationMs: (d.data().durationMs as number) ?? 0,
            }))
            .sort((a, b) => b.durationMs - a.durationMs)
            .slice(0, 6)
        );
      } catch (e) {
        console.error('[useAnalytics] load failed:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return {
    dailyPoints,
    kpis,
    topPreviewPacks,
    topPreviewWords,
    slowPreviewRows,
    loading,
  };
};
