// 📖 What this does:
// Submits a purchase request to Firestore and waits for the Cloud Function
// (processPurchaseRequest) to validate it and write the real entitlement.
// Clients cannot write to /users/{uid}/purchases directly — the security
// boundary lives in firestore.rules. Phase 11 swaps the function's validation
// step for real App Store / Play receipt verification; no client changes.

import { getApp } from '@react-native-firebase/app';
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  onSnapshot,
} from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';
import { usePurchaseStore } from '../store/usePurchaseStore';

const REQUEST_TIMEOUT_MS = 15000;

export class PaymentError extends Error {}

export async function simulatePurchase(packId: string): Promise<void> {
  const uid = getAuth(getApp()).currentUser?.uid;
  if (!uid) {
    throw new PaymentError('Not authenticated');
  }

  const db = getFirestore(getApp());
  const requestsCol = collection(db, 'users', uid, 'purchaseRequests');
  const requestRef = doc(requestsCol);

  try {
    await setDoc(requestRef, {
      packId,
      status: 'pending',
      requestedAt: Date.now(),
    });
  } catch (e) {
    console.error('[mockPurchaseService] request write failed:', e);
    throw new PaymentError('Could not start purchase');
  }

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      unsubscribe();
      reject(new PaymentError('Purchase timed out'));
    }, REQUEST_TIMEOUT_MS);

    const unsubscribe = onSnapshot(
      requestRef,
      (snap) => {
        const data = snap.data() as { status?: string; failureReason?: string } | undefined;
        if (!data) {
          return;
        }
        if (data.status === 'completed') {
          clearTimeout(timeout);
          unsubscribe();
          resolve();
        } else if (data.status === 'failed') {
          clearTimeout(timeout);
          unsubscribe();
          reject(new PaymentError(data.failureReason ?? 'Purchase failed'));
        }
      },
      (err) => {
        clearTimeout(timeout);
        unsubscribe();
        console.error('[mockPurchaseService] snapshot error:', err);
        reject(new PaymentError('Could not confirm purchase'));
      }
    );
  });

  usePurchaseStore.getState().addPurchase(packId);
}
