import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  orderBy,
  query,
  limit,
  type QuerySnapshot,
  type DocumentData,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import type { NotificationBroadcast } from '../types';

interface UseNotificationsResult {
  broadcasts: NotificationBroadcast[];
  loading: boolean;
  sending: boolean;
  sendBroadcast: (title: string, body: string) => Promise<void>;
}

// Path: /adminConfig/notifications/broadcasts
const broadcastsCol = () =>
  collection(db, 'adminConfig', 'notifications', 'broadcasts');

const docToBroadcast = (
  id: string,
  data: DocumentData
): NotificationBroadcast => ({
  id,
  title: data.title ?? '',
  body: data.body ?? '',
  sentAt: data.sentAt?.toDate() ?? new Date(),
  sentBy: data.sentBy ?? '',
  recipientCount: data.recipientCount,
  status: data.status ?? 'pending',
});

export const useNotifications = (): UseNotificationsResult => {
  const [broadcasts, setBroadcasts] = useState<NotificationBroadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const q = query(broadcastsCol(), orderBy('sentAt', 'desc'), limit(20));
    const unsub = onSnapshot(
      q,
      (snap: QuerySnapshot) => {
        setBroadcasts(snap.docs.map((d) => docToBroadcast(d.id, d.data())));
        setLoading(false);
      },
      (err) => {
        console.error('[useNotifications] onSnapshot error:', err);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  // Writing to Firestore queues the broadcast for dispatch.
  // A Cloud Function (onCreate trigger on this collection) sends the FCM message.
  const sendBroadcast = async (title: string, body: string): Promise<void> => {
    setSending(true);
    try {
      await addDoc(broadcastsCol(), {
        title,
        body,
        sentAt: serverTimestamp(),
        sentBy: auth.currentUser?.email ?? 'unknown',
        status: 'pending',
      });
    } catch (e) {
      console.error('[useNotifications] sendBroadcast failed:', e);
      throw e;
    } finally {
      setSending(false);
    }
  };

  return { broadcasts, loading, sending, sendBroadcast };
};
