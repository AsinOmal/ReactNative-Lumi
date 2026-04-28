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

interface BroadcastDoc {
  title: string;
  body: string;
  sentBy: string;
  sentAt?: admin.firestore.Timestamp;
  status?: string;
  recipientCount?: number;
}

export const dispatchBroadcast = onDocumentCreated(
  'adminConfig/notifications/broadcasts/{broadcastId}',
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const data = snap.data() as BroadcastDoc;

    // Guard against re-runs or already-processed docs
    if (data.status && data.status !== 'pending') return;

    try {
      // Collect all user FCM tokens from /users collection
      const usersSnap = await db.collection('users').get();
      const tokens: string[] = [];
      usersSnap.forEach(doc => {
        const token = (doc.data() as { fcmToken?: string }).fcmToken;
        if (token) tokens.push(token);
      });

      if (tokens.length === 0) {
        await snap.ref.update({ status: 'sent', recipientCount: 0, sentAt: admin.firestore.FieldValue.serverTimestamp() });
        logger.info(`dispatchBroadcast ${event.params.broadcastId}: no tokens`);
        return;
      }

      // FCM supports up to 500 tokens per multicast batch
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

      logger.info(`dispatchBroadcast ${event.params.broadcastId}: sent to ${successCount}/${tokens.length} devices`);
    } catch (err) {
      logger.error('dispatchBroadcast failed:', err);
      await snap.ref.update({ status: 'failed' });
    }
  }
);
