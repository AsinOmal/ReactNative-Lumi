// 📖 What this does:
// Two-view analytics for flagged activityLog events:
//   1. Top-flagged words (aggregate by word, count, unique users)
//   2. Recent flagged events list (capped at 200 most recent)
//
// Schema: /users/{uid}/activityLog/{id} → { word, flagged, source, timestamp, reviewed? }
// Only docs with flagged == true are read.

import { useEffect, useState } from 'react';
import {
  collectionGroup,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase';

export interface FlaggedTopWord {
  word: string;
  count: number;
  uniqueUsers: number;
}

export interface FlaggedEvent {
  id: string;
  uid: string;
  word: string;
  source: string;
  timestamp: Date;
  reviewed: boolean;
}

interface UseFlaggedEventsAnalyticsResult {
  topWords: FlaggedTopWord[];
  recent: FlaggedEvent[];
  totalCount: number;
  loading: boolean;
  error: string | null;
}

const RECENT_LIMIT = 200;

export const useFlaggedEventsAnalytics =
  (): UseFlaggedEventsAnalyticsResult => {
    const [topWords, setTopWords] = useState<FlaggedTopWord[]>([]);
    const [recent, setRecent] = useState<FlaggedEvent[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const load = async () => {
        try {
          // Pull all flagged events for the top-words aggregate. Then pull the
          // recent slice separately so the table is always fresh-first.
          // The flagged-count is small enough at our scale that fetching all
          // is cheap; if it ever explodes, switch to a Cloud-Function counter.
          const [allSnap, recentSnap] = await Promise.all([
            getDocs(
              query(
                collectionGroup(db, 'activityLog'),
                where('flagged', '==', true)
              )
            ),
            getDocs(
              query(
                collectionGroup(db, 'activityLog'),
                where('flagged', '==', true),
                orderBy('timestamp', 'desc'),
                limit(RECENT_LIMIT)
              )
            ).catch(() => null),
          ]);

          // Aggregate top-words client-side.
          const agg = new Map<
            string,
            { count: number; users: Set<string> }
          >();
          allSnap.docs.forEach((d) => {
            const data = d.data();
            const word = ((data.word as string) ?? '').toLowerCase();
            if (!word) return;
            const uid = d.ref.parent.parent?.id ?? '';
            const cur = agg.get(word) ?? {
              count: 0,
              users: new Set<string>(),
            };
            cur.count += 1;
            if (uid) {
              cur.users.add(uid);
            }
            agg.set(word, cur);
          });
          const sortedTop: FlaggedTopWord[] = Array.from(agg.entries())
            .map(([word, v]) => ({
              word,
              count: v.count,
              uniqueUsers: v.users.size,
            }))
            .sort((a, b) => b.count - a.count);

          // Build the recent list. Fall back to the unsorted pull if the
          // ordered query failed (likely a missing composite index — degrade
          // gracefully so the analytics still loads).
          const source = recentSnap ?? allSnap;
          const recentList: FlaggedEvent[] = source.docs.map((d) => {
            const data = d.data();
            const ts =
              typeof data.timestamp === 'number'
                ? data.timestamp
                : (data.timestamp?.toDate?.()?.getTime?.() ?? 0);
            return {
              id: d.id,
              uid: d.ref.parent.parent?.id ?? '',
              word: (data.word as string) ?? '',
              source: (data.source as string) ?? 'unknown',
              timestamp: new Date(ts),
              reviewed: !!data.reviewed,
            };
          });
          // If we fell back to allSnap (no orderBy), sort client-side.
          if (!recentSnap) {
            recentList.sort(
              (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
            );
          }

          setTopWords(sortedTop);
          setRecent(recentList.slice(0, RECENT_LIMIT));
          setTotalCount(allSnap.size);
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.error('[useFlaggedEventsAnalytics] load failed:', e);
          setError(msg);
        } finally {
          setLoading(false);
        }
      };
      load();
    }, []);

    return { topWords, recent, totalCount, loading, error };
  };
