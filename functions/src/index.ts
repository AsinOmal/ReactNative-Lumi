// 📖 What this does:
// Triggered when the admin panel writes a new broadcast document to
// /adminConfig/notifications/broadcasts/{broadcastId}.
// Reads all user FCM tokens from /users, sends a multicast push via
// Firebase Admin SDK, then updates the broadcast doc with the final status.
//
// Why a Cloud Function instead of sending from the browser:
//   The FCM Admin API requires a service-account credential that cannot be
//   safely embedded in the React admin web app. The Function runs server-side
//   with the project's default credential.
//
// Rate limit: max 5 broadcasts per hour. Excess docs are marked 'failed'
// immediately to prevent accidental or malicious notification spam.
//
// Mobile app wiring needed (not in this file):
//   In useAuthStore.ts after sign-in:
//     messaging().getToken().then(token =>
//       updateDoc(doc(db, 'users', uid), { fcmToken: token })
//     )
//   Register onTokenRefresh to keep the token current.
//
// Deploy: cd functions && npm run deploy

import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

const BROADCASTS_PER_HOUR_LIMIT = 5;
const HOUR_MS = 60 * 60 * 1000;

interface BroadcastDoc {
  title: string;
  body: string;
  sentBy: string;
  sentAt?: admin.firestore.Timestamp;
  status?: string;
  recipientCount?: number;
}

const countRecentBroadcasts = async (excludeId: string): Promise<number> => {
  const hourAgo = admin.firestore.Timestamp.fromMillis(Date.now() - HOUR_MS);
  const snap = await db
    .collection('adminConfig')
    .doc('notifications')
    .collection('broadcasts')
    .where('sentAt', '>=', hourAgo)
    .where('status', 'in', ['sent', 'pending'])
    .get();
  // Exclude the document that just triggered this function.
  return snap.docs.filter((d) => d.id !== excludeId).length;
};

export const dispatchBroadcast = onDocumentCreated(
  'adminConfig/notifications/broadcasts/{broadcastId}',
  async (event) => {
    const snap = event.data;
    if (!snap) {
      return;
    }

    const data = snap.data() as BroadcastDoc;

    if (data.status && data.status !== 'pending') {
      return;
    }

    try {
      const recentCount = await countRecentBroadcasts(event.params.broadcastId);
      if (recentCount >= BROADCASTS_PER_HOUR_LIMIT) {
        await snap.ref.update({
          status: 'failed',
          failureReason: 'rate_limit_exceeded',
        });
        logger.warn(
          `dispatchBroadcast ${event.params.broadcastId}: rate limit exceeded (${recentCount} in last hour)`
        );
        return;
      }

      const usersSnap = await db.collection('users').get();
      const tokens: string[] = [];
      usersSnap.forEach((doc) => {
        const token = (doc.data() as { fcmToken?: string }).fcmToken;
        if (token) {
          tokens.push(token);
        }
      });

      if (tokens.length === 0) {
        await snap.ref.update({
          status: 'sent',
          recipientCount: 0,
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        logger.info(`dispatchBroadcast ${event.params.broadcastId}: no tokens`);
        return;
      }

      // FCM supports up to 500 tokens per multicast batch.
      const CHUNK = 500;
      let successCount = 0;
      for (let i = 0; i < tokens.length; i += CHUNK) {
        const chunk = tokens.slice(i, i + CHUNK);
        const result = await admin.messaging().sendEachForMulticast({
          tokens: chunk,
          notification: { title: data.title, body: data.body },
          apns: { payload: { aps: { sound: 'default' } } },
        });
        successCount += result.successCount;
      }

      await snap.ref.update({
        status: 'sent',
        recipientCount: successCount,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      logger.info(
        `dispatchBroadcast ${event.params.broadcastId}: sent to ${successCount}/${tokens.length} devices`
      );
    } catch (err) {
      logger.error('dispatchBroadcast failed:', err);
      await snap.ref.update({ status: 'failed' });
    }
  }
);
