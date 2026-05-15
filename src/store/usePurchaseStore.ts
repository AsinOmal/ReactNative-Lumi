// 📖 What this does:
// Tracks which premium packs the user has purchased (or simulated-purchased).
// Persisted to AsyncStorage so purchases survive app restarts.
// Firestore is the source of truth — this is a local cache for instant reads.

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@lumi/purchases';

interface PurchaseStore {
  purchasedPackIds: string[];
  isPurchased: (packId: string) => boolean;
  addPurchase: (packId: string) => void;
  loadFromStorage: () => Promise<void>;
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
}));
