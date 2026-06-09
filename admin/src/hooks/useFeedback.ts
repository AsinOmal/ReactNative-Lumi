import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  orderBy,
  query,
  type QuerySnapshot,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { FeedbackItem } from '../types';

interface UseFeedbackResult {
  items: FeedbackItem[];
  unreadCount: number;
  loading: boolean;
  markRead: (id: string) => Promise<void>;
}

const docToFeedback = (id: string, data: DocumentData): FeedbackItem => ({
  id,
  uid: data.uid ?? '',
  email: data.email ?? '',
  type: data.type === 'model_report' ? 'model_report' : 'feedback',
  message: data.message ?? '',
  appVersion: data.appVersion ?? '',
  submittedAt: data.submittedAt?.toDate() ?? new Date(),
  isRead: data.isRead ?? false,
  packId: data.packId,
  packName: data.packName,
  word: data.word,
  reason: data.reason,
  durationMs: data.durationMs,
});

export const useFeedback = (): UseFeedbackResult => {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'feedback'), orderBy('submittedAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap: QuerySnapshot) => {
        setItems(snap.docs.map((d) => docToFeedback(d.id, d.data())));
        setLoading(false);
      },
      (err) => {
        console.error('[useFeedback] onSnapshot error:', err);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  const markRead = async (id: string): Promise<void> => {
    try {
      await updateDoc(doc(db, 'feedback', id), { isRead: true });
    } catch (e) {
      console.error('[useFeedback] markRead failed:', e);
      throw e;
    }
  };

  const unreadCount = items.filter((i) => !i.isRead).length;

  return { items, unreadCount, loading, markRead };
};
