// 📖 What this does:
// Aggregates the cross-user achievements collection-group into a per-id
// leaderboard so the admin can see *which* achievements are unlocking most,
// who's unlocking them, and the most recent unlock time.
//
// Schema: /users/{uid}/achievements/{achievementId} → { unlockedAt, triggerWord }

import { useEffect, useState } from 'react';
import { collectionGroup, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export interface AchievementStat {
  achievementId: string;
  unlockCount: number;
  uniqueUsers: number;
  lastUnlockedAt: Date;
}

interface UseAchievementsAnalyticsResult {
  items: AchievementStat[];
  totalUnlocks: number;
  loading: boolean;
  error: string | null;
}

export const useAchievementsAnalytics = (): UseAchievementsAnalyticsResult => {
  const [items, setItems] = useState<AchievementStat[]>([]);
  const [totalUnlocks, setTotalUnlocks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collectionGroup(db, 'achievements'));
        const agg = new Map<
          string,
          { count: number; users: Set<string>; lastUnlockedAt: number }
        >();
        snap.docs.forEach((d) => {
          const data = d.data();
          // Achievement id is the doc id (per the mobile write path).
          const id = d.id;
          const uid = d.ref.parent.parent?.id ?? '';
          const ts =
            typeof data.unlockedAt === 'number'
              ? data.unlockedAt
              : (data.unlockedAt?.toDate?.()?.getTime?.() ?? Date.now());
          const cur = agg.get(id) ?? {
            count: 0,
            users: new Set<string>(),
            lastUnlockedAt: 0,
          };
          cur.count += 1;
          if (uid) {
            cur.users.add(uid);
          }
          if (ts > cur.lastUnlockedAt) {
            cur.lastUnlockedAt = ts;
          }
          agg.set(id, cur);
        });
        const sorted: AchievementStat[] = Array.from(agg.entries())
          .map(([achievementId, v]) => ({
            achievementId,
            unlockCount: v.count,
            uniqueUsers: v.users.size,
            lastUnlockedAt: new Date(v.lastUnlockedAt),
          }))
          .sort((a, b) => b.unlockCount - a.unlockCount);
        setItems(sorted);
        setTotalUnlocks(snap.size);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error('[useAchievementsAnalytics] load failed:', e);
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { items, totalUnlocks, loading, error };
};
