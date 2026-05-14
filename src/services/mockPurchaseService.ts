// 📖 What this does:
// Simulates a payment flow with a 2-second processing delay, then writes the
// purchase record to Firestore and updates the local purchase store.
// Swappable for real IAP (StoreKit / Google Play) when the app publishes.

import { getApp } from '@react-native-firebase/app';
import { getFirestore, doc, setDoc } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';
import { usePurchaseStore } from '../store/usePurchaseStore';

const SIMULATED_DELAY_MS = 2000;

export class PaymentError extends Error {}

export async function simulatePurchase(packId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));

  const uid = getAuth(getApp()).currentUser?.uid;
  if (!uid) throw new PaymentError('Not authenticated');

  try {
    const db = getFirestore(getApp());
    await setDoc(doc(db, 'users', uid, 'purchases', packId), {
      purchasedAt: Date.now(),
      simulated: true,
    });
  } catch (e) {
    console.error('[mockPurchaseService] Firestore write failed:', e);
    throw new PaymentError('Could not record purchase');
  }

  usePurchaseStore.getState().addPurchase(packId);
}
