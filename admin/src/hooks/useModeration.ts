import { useState, useEffect } from 'react';
import {
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  collectionGroup,
  query,
  where,
  getDocs,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { FlaggedEvent } from '../types';

interface UseModerationResult {
  blocklist: string[];
  flaggedEvents: FlaggedEvent[];
  loadingBlocklist: boolean;
  loadingFlags: boolean;
  addToBlocklist: (word: string) => Promise<void>;
  removeFromBlocklist: (word: string) => Promise<void>;
  reviewEvent: (id: string, uid: string) => Promise<void>;
}

const moderationDocRef = () => doc(db, 'adminConfig', 'moderation');

export const useModeration = (): UseModerationResult => {
  const [blocklist, setBlocklist] = useState<string[]>([]);
  const [flaggedEvents, setFlaggedEvents] = useState<FlaggedEvent[]>([]);
  const [loadingBlocklist, setLoadingBlocklist] = useState(true);
  const [loadingFlags, setLoadingFlags] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      moderationDocRef(),
      (snap) => {
        setBlocklist(snap.data()?.globalBlocklist ?? []);
        setLoadingBlocklist(false);
      },
      (err) => {
        console.error('[useModeration] blocklist error:', err);
        setLoadingBlocklist(false);
      }
    );
    return unsub;
  }, []);

  useEffect(() => {
    // Requires a Firestore composite index on activityLog: flagged ASC, timestamp DESC
    const load = async () => {
      try {
        const q = query(
          collectionGroup(db, 'activityLog'),
          where('flagged', '==', true)
        );
        const snap = await getDocs(q);
        setFlaggedEvents(
          snap.docs.map((d) => {
            const data = d.data() as DocumentData;
            const uid = d.ref.path.split('/')[1] ?? '';
            return {
              id: d.id,
              uid,
              userEmail: data.email ?? uid,
              word: data.word ?? '',
              timestamp: data.timestamp?.toDate() ?? new Date(),
              reviewed: data.reviewed ?? false,
            } as FlaggedEvent;
          })
        );
      } catch (e) {
        console.error('[useModeration] flagged events error:', e);
      } finally {
        setLoadingFlags(false);
      }
    };
    load();
  }, []);

  const addToBlocklist = async (word: string): Promise<void> => {
    const trimmed = word.trim().toLowerCase();
    if (!trimmed || blocklist.includes(trimmed)) {
      return;
    }
    try {
      await setDoc(
        moderationDocRef(),
        { globalBlocklist: [...blocklist, trimmed] },
        { merge: true }
      );
    } catch (e) {
      console.error('[useModeration] addToBlocklist failed:', e);
      throw e;
    }
  };

  const removeFromBlocklist = async (word: string): Promise<void> => {
    try {
      await setDoc(
        moderationDocRef(),
        { globalBlocklist: blocklist.filter((w) => w !== word) },
        { merge: true }
      );
    } catch (e) {
      console.error('[useModeration] removeFromBlocklist failed:', e);
      throw e;
    }
  };

  const reviewEvent = async (id: string, uid: string): Promise<void> => {
    try {
      await updateDoc(doc(db, 'users', uid, 'activityLog', id), {
        reviewed: true,
      });
      setFlaggedEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, reviewed: true } : e))
      );
    } catch (e) {
      console.error('[useModeration] reviewEvent failed:', e);
      throw e;
    }
  };

  return {
    blocklist,
    flaggedEvents,
    loadingBlocklist,
    loadingFlags,
    addToBlocklist,
    removeFromBlocklist,
    reviewEvent,
  };
};
