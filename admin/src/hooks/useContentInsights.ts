import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  collectionGroup,
  getDocs,
  getCountFromServer,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase';

export interface InsightStat {
  label: string;
  count: number;
}

export interface InsightAlert {
  id: string;
  title: string;
  body: string;
  tone: 'success' | 'warning' | 'info';
}

export interface ContentInsightSummary {
  totalUsers: number;
  totalScans: number;
  totalUnknowns: number;
  totalWishlistRequests: number;
  totalSavedWords: number;
  totalModelViews: number;
  totalPackPreviews: number;
  previewTimeouts: number;
  previewMinutes: number;
  unreadFeedback: number;
  unreadReports: number;
}

interface UseContentInsightsResult {
  summary: ContentInsightSummary;
  alerts: InsightAlert[];
  topScannedWords: InsightStat[];
  topUnknownWords: InsightStat[];
  topWishlistedWords: InsightStat[];
  loading: boolean;
}

const DEFAULT_SUMMARY: ContentInsightSummary = {
  totalUsers: 0,
  totalScans: 0,
  totalUnknowns: 0,
  totalWishlistRequests: 0,
  totalSavedWords: 0,
  totalModelViews: 0,
  totalPackPreviews: 0,
  previewTimeouts: 0,
  previewMinutes: 0,
  unreadFeedback: 0,
  unreadReports: 0,
};

const highestMilestone = (count: number, marks: number[]) =>
  marks.filter((mark) => count >= mark).slice(-1)[0] ?? null;

const sortStats = (tally: Record<string, number>): InsightStat[] =>
  Object.entries(tally)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

const formatCount = (count: number, noun: string) =>
  `${count.toLocaleString('en-US')} ${noun}${count === 1 ? '' : 's'}`;

export const useContentInsights = (): UseContentInsightsResult => {
  const [summary, setSummary] =
    useState<ContentInsightSummary>(DEFAULT_SUMMARY);
  const [alerts, setAlerts] = useState<InsightAlert[]>([]);
  const [topScannedWords, setTopScannedWords] = useState<InsightStat[]>([]);
  const [topUnknownWords, setTopUnknownWords] = useState<InsightStat[]>([]);
  const [topWishlistedWords, setTopWishlistedWords] = useState<InsightStat[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [
          usersCountSnap,
          activitySnap,
          contentEventsSnap,
          wishlistSnap,
          feedbackSnap,
          savedWordsCountSnap,
          previewSnap,
        ] = await Promise.all([
          getCountFromServer(collection(db, 'users')),
          getDocs(
            query(
              collectionGroup(db, 'activityLog'),
              orderBy('timestamp', 'desc'),
              limit(1000)
            )
          ),
          getDocs(
            query(
              collectionGroup(db, 'contentEvents'),
              orderBy('createdAt', 'desc'),
              limit(1000)
            )
          ),
          getDocs(collection(db, 'wishlist')),
          getDocs(collection(db, 'feedback')),
          getCountFromServer(collectionGroup(db, 'savedWords')),
          getDocs(collectionGroup(db, 'packPreviewSessions')),
        ]);

        const scanTally: Record<string, number> = {};
        const unknownTally: Record<string, number> = {};
        const wishTally: Record<string, number> = {};
        let totalScans = 0;
        let totalUnknowns = 0;
        let totalWishlistRequests = 0;
        let totalModelViews = 0;
        let previewTimeouts = 0;
        let previewMinutes = 0;

        activitySnap.docs.forEach((d) => {
          const data = d.data();
          if (data.source === 'ocr_scan') {
            totalScans += 1;
            const word = (data.word as string) || 'unknown';
            scanTally[word] = (scanTally[word] ?? 0) + 1;
          }
        });

        contentEventsSnap.docs.forEach((d) => {
          const data = d.data();
          const word = (data.word as string) || 'unknown';
          if (data.type === 'scan_unknown') {
            totalUnknowns += 1;
            unknownTally[word] = (unknownTally[word] ?? 0) + 1;
          }
          if (data.type === 'ar_model_opened') {
            totalModelViews += 1;
          }
        });

        wishlistSnap.docs.forEach((d) => {
          const data = d.data();
          const word = (data.word as string) || d.id;
          const count = (data.requestCount as number) ?? 0;
          totalWishlistRequests += count;
          wishTally[word] = (wishTally[word] ?? 0) + count;
        });

        previewSnap.docs.forEach((d) => {
          const data = d.data();
          previewMinutes += (data.durationMs as number) ?? 0;
          if (data.loadTimedOut) {
            previewTimeouts += 1;
          }
        });

        const unreadFeedback = feedbackSnap.docs.filter(
          (d) => !(d.data().isRead ?? false) && d.data().type === 'feedback'
        ).length;
        const unreadReports = feedbackSnap.docs.filter(
          (d) => !(d.data().isRead ?? false) && d.data().type === 'model_report'
        ).length;

        const counts: ContentInsightSummary = {
          totalUsers: usersCountSnap.data().count,
          totalScans,
          totalUnknowns,
          totalWishlistRequests,
          totalSavedWords: savedWordsCountSnap.data().count,
          totalModelViews,
          totalPackPreviews: previewSnap.size,
          previewTimeouts,
          previewMinutes: Math.round(previewMinutes / 60_000),
          unreadFeedback,
          unreadReports,
        };

        const nextAlerts: InsightAlert[] = [];
        const userMilestone = highestMilestone(
          counts.totalUsers,
          [100, 250, 500, 1000, 2500]
        );
        const scanMilestone = highestMilestone(
          counts.totalScans,
          [100, 500, 1000, 5000, 10000]
        );
        const wishMilestone = highestMilestone(
          counts.totalWishlistRequests,
          [10, 25, 50, 100, 250]
        );

        if (userMilestone) {
          nextAlerts.push({
            id: `users-${userMilestone}`,
            title: `User population reached ${userMilestone.toLocaleString(
              'en-US'
            )}`,
            body: `${formatCount(counts.totalUsers, 'user')} are now in Lumi.`,
            tone: 'success',
          });
        }

        if (scanMilestone) {
          nextAlerts.push({
            id: `scans-${scanMilestone}`,
            title: `${scanMilestone.toLocaleString('en-US')} words scanned`,
            body: 'The scan flow is getting steady use. Review the top words to tune content.',
            tone: 'success',
          });
        }

        if (wishMilestone) {
          nextAlerts.push({
            id: `wishlist-${wishMilestone}`,
            title: `${wishMilestone.toLocaleString('en-US')} words wishlisted`,
            body: 'Kids are asking for more content. Check the wishlist for the next pack ideas.',
            tone: 'info',
          });
        }

        if (counts.unreadFeedback > 0) {
          nextAlerts.push({
            id: 'feedback-unread',
            title: `${counts.unreadFeedback} new feedback item${
              counts.unreadFeedback === 1 ? '' : 's'
            }`,
            body: 'Open Support Inbox to review parent messages.',
            tone: 'warning',
          });
        }

        if (counts.unreadReports > 0) {
          nextAlerts.push({
            id: 'reports-unread',
            title: `${counts.unreadReports} new model report${
              counts.unreadReports === 1 ? '' : 's'
            }`,
            body: 'One or more pack models failed to load in preview.',
            tone: 'warning',
          });
        }

        if (counts.previewTimeouts > 0) {
          nextAlerts.push({
            id: 'preview-timeouts',
            title: `${counts.previewTimeouts} slow pack preview${
              counts.previewTimeouts === 1 ? '' : 's'
            }`,
            body: 'Review the pack preview warnings before publishing more models.',
            tone: 'warning',
          });
        }

        if (counts.totalUnknowns > 0) {
          nextAlerts.push({
            id: 'unknown-words',
            title: `${counts.totalUnknowns} unknown scan${
              counts.totalUnknowns === 1 ? '' : 's'
            } captured`,
            body: 'These words are missing from the catalog and are the best source for new content.',
            tone: 'info',
          });
        }

        setSummary(counts);
        setAlerts(nextAlerts.slice(0, 6));
        setTopScannedWords(sortStats(scanTally));
        setTopUnknownWords(sortStats(unknownTally));
        setTopWishlistedWords(sortStats(wishTally));
      } catch (e) {
        console.error('[useContentInsights] load failed:', e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return useMemo(
    () => ({
      summary,
      alerts,
      topScannedWords,
      topUnknownWords,
      topWishlistedWords,
      loading,
    }),
    [
      alerts,
      loading,
      summary,
      topScannedWords,
      topUnknownWords,
      topWishlistedWords,
    ]
  );
};
