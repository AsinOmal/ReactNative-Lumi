/**
 * useAmbientStore.ts
 *
 * Persists the mute/unmute preference for the ambient background music.
 * The actual audio lifecycle lives in utils/ambientSound.ts — this store is
 * just the source of truth for the UI toggle and survives app restarts.
 *
 * Why a separate store from useLanguageStore / usePurchaseStore:
 *   Audio preference is a distinct concern that doesn't belong to auth,
 *   language, or commerce. Co-locating it would couple unrelated reducers.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAmbientMuted } from '../utils/ambientSound';

const STORAGE_KEY = '@lumi/ambient_muted';

interface AmbientStore {
  muted: boolean;
  toggleMute: () => void;
  loadFromStorage: () => Promise<void>;
}

export const useAmbientStore = create<AmbientStore>((set, get) => ({
  muted: false,

  toggleMute: () => {
    const next = !get().muted;
    if (__DEV__) {
      console.log(`[useAmbientStore] toggleMute called, next=${next}`);
    }
    set({ muted: next });
    setAmbientMuted(next);
    AsyncStorage.setItem(STORAGE_KEY, next ? '1' : '0').catch(() => {});
  },

  loadFromStorage: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const muted = raw === '1';
      set({ muted });
      setAmbientMuted(muted);
    } catch {
      // Default unmuted on read failure — preferable to silently broken music
    }
  },
}));
