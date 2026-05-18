// 📖 What this does:
// Tracks which premium packs the user has purchased (or simulated-purchased).
// Persisted to AsyncStorage so purchases survive app restarts.
// Firestore is the source of truth — this is a local cache for instant reads.
// On bootstrap we both loadFromStorage (instant) AND syncFromFirestore (so a
// reinstall or new device still restores the user's entitlements).

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp } from '@react-native-firebase/app';
import {
  collection,
  getDocs,
  getFirestore,
} from '@react-native-firebase/firestore';

const STORAGE_KEY = '@lumi/purchases';

interface PurchaseStore {
  purchasedPackIds: string[];
  isPurchased: (packId: string) => boolean;
  addPurchase: (packId: string) => void;
  loadFromStorage: () => Promise<void>;
  syncFromFirestore: (uid: string) => Promise<void>;
}

export const usePurchaseStore = create<PurchaseStore>((set, get) => ({
  purchasedPackIds: [],

  isPurchased: (packId) => get().purchasedPackIds.includes(packId),

  addPurchase: (packId) => {
    const updated = [...new Set([...get().purchasedPackIds, packId])];
    set({ purchasedPackIds: updated });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
  },

  loadFromStorage: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        set({ purchasedPackIds: JSON.parse(raw) });
      }
    } catch {
      // Fail silently — user will re-purchase if storage is corrupt
    }
  },

  // Reads every doc under /users/{uid}/purchases and merges the resulting
  // packIds into local state + AsyncStorage. Idempotent: a missed purchase
  // on a fresh install is restored on the very first authed bootstrap.
  syncFromFirestore: async (uid) => {
    try {
      const snap = await getDocs(
        collection(getFirestore(getApp()), 'users', uid, 'purchases')
      );
      const remoteIds = snap.docs.map((d) => d.id);
      if (remoteIds.length === 0) {
        return;
      }
      const merged = [...new Set([...get().purchasedPackIds, ...remoteIds])];
      set({ purchasedPackIds: merged });
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged)).catch(() => {});
    } catch (e) {
      console.error('[usePurchaseStore] syncFromFirestore failed:', e);
    }
  },
}));
