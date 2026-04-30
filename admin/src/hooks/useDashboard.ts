import { useState, useEffect } from 'react';
import {
  collection, collectionGroup, query, orderBy, limit,
  getDocs, where, getCountFromServer,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { DashboardStats } from '../types';

export interface ActivityRow {
  uid: string;
  email: string;
  word: string;
  game: string;
  timestamp: string;
  flagged: boolean;
}

interface UseDashboardResult {
  stats: DashboardStats | null;
  recentActivity: ActivityRow[];
  loading: boolean;
}

const toMs = (val: unknown): number => {
  if (!val) return 0;
  if (typeof (val as any).toDate === 'function') return (val as any).toDate().getTime();
  return typeof val === 'number' ? val : 0;
};

const formatRelative = (ms: number): string => {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// Requires a COLLECTION_GROUP_ASC index on activityLog.flagged — falls back to 0 if missing.
const fetchFlaggedCount = async (): Promise<number> => {
  try {
    const snap = await getCountFromServer(
      query(collectionGroup(db, 'activityLog'), where('flagged', '==', true)),
    );
    return snap.data().count;
  } catch {
    return 0;
  }
};

export const useDashboard = (): UseDashboardResult => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const todayMs = new Date().setHours(0, 0, 0, 0);

        // Run independently so a missing index doesn't crash the whole load
        const [usersSnap, activitySnap, flaggedEvents] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(query(collectionGroup(db, 'activityLog'), orderBy('timestamp', 'desc'), limit(5))),
          fetchFlaggedCount(),
        ]);

        let newUsersToday = 0;
        let activeToday = 0;
        let wordsSaved = 0;
        const uidToEmail = new Map<string, string>();

        for (const d of usersSnap.docs) {
          const u = d.data();
          if (toMs(u.createdAt) >= todayMs) newUsersToday++;
          if (toMs(u.lastActive) >= todayMs) activeToday++;
          wordsSaved += u.wordCount ?? 0;
          uidToEmail.set(d.id, u.email ?? d.id);
        }

        setStats({
          totalUsers: usersSnap.size,
          newUsersToday,
          activeToday,
          wordsSaved,
          wordsSavedThisWeek: 0,
          gamesPlayed: 0,
          achievementsUnlocked: 0,
          flaggedEvents,
        });

        setRecentActivity(activitySnap.docs.map(d => {
          const data = d.data();
          const uid = d.ref.path.split('/')[1] ?? '';
          return {
            uid,
            email: uidToEmail.get(uid) ?? uid,
            word: data.word ?? '',
            game: data.source ?? 'Scan',
            timestamp: formatRelative(toMs(data.timestamp)),
            flagged: data.flagged ?? false,
          };
        }));
      } catch (e) {
        console.error('[useDashboard] load failed:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { stats, recentActivity, loading };
};
