import { useState, useEffect } from 'react';
import {
  doc,
  getDoc,
  collection,
  getDocs,
  orderBy,
  query,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { AppUser } from '../types';

export interface ActivityEntry {
  id: string;
  word: string;
  timestamp: Date;
  flagged: boolean;
  source: string;
}

export interface UserDetail extends AppUser {
  savedWordCount: number;
  achievementCount: number;
  recentActivity: ActivityEntry[];
}

interface UseUserDetailResult {
  detail: UserDetail | null;
  loading: boolean;
  error: string | null;
}

export const useUserDetail = (uid: string): UseUserDetailResult => {
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      return;
    }
    const load = async () => {
      try {
        const userSnap = await getDoc(doc(db, 'users', uid));
        if (!userSnap.exists()) {
          setError('User not found.');
          setLoading(false);
          return;
        }
        const u = userSnap.data();

        const [wordsSnap, achieveSnap, activitySnap] = await Promise.all([
          getDocs(collection(db, 'users', uid, 'savedWords')),
          getDocs(collection(db, 'users', uid, 'achievements')),
          getDocs(
            query(
              collection(db, 'users', uid, 'activityLog'),
              orderBy('timestamp', 'desc'),
              limit(10)
            )
          ),
        ]);

        setDetail({
          uid,
          email: u.email ?? '',
          displayName: u.displayName ?? '',
          username: u.username ?? '',
          createdAt: u.createdAt?.toDate() ?? new Date(),
          lastActive: u.lastActive?.toDate() ?? new Date(),
          wordCount: u.wordCount ?? 0,
          streak: u.streak ?? 0,
          suspended: u.suspended ?? false,
          savedWordCount: wordsSnap.size,
          achievementCount: achieveSnap.size,
          recentActivity: activitySnap.docs.map((d) => ({
            id: d.id,
            word: d.data().word ?? '',
            timestamp: ((ts) => ts?.toDate?.() ?? new Date(ts ?? 0))(
              d.data().timestamp
            ),
            flagged: d.data().flagged ?? false,
            source: d.data().source ?? '',
          })),
        });
      } catch (e) {
        console.error('[useUserDetail] load failed:', e);
        setError('Failed to load user.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [uid]);

  return { detail, loading, error };
};
