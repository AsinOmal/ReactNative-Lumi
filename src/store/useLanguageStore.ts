/**
 * useLanguageStore.ts
 *
 * Stores the user's language preference. Persisted to AsyncStorage so it
 * survives app restarts. Language is device-level (the intro-seen flag and
 * other user-scoped data moved to /users/{uid} via useAuthStore).
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppLanguage = 'en' | 'si';

const LANGUAGE_KEY = '@lumi/language';

interface LanguageState {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  loadFromStorage: () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'en',

  setLanguage: (lang) => {
    set({ language: lang });
    AsyncStorage.setItem(LANGUAGE_KEY, lang).catch(() => {});
  },

  loadFromStorage: async () => {
    try {
      const lang = await AsyncStorage.getItem(LANGUAGE_KEY);
      set({ language: (lang as AppLanguage | null) ?? 'en' });
    } catch (e) {
      console.error('[useLanguageStore] loadFromStorage:', e);
    }
  },
}));
