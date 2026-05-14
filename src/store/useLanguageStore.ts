/**
 * useLanguageStore.ts
 *
 * Stores the user's language preference and whether they have seen the
 * App Introduction Guide. Both are persisted to AsyncStorage so they survive
 * app restarts.
 *
 * Why two concerns in one store:
 *   The language is chosen at the end of the intro guide, so both state
 *   values are always read and written together. Splitting them into two
 *   stores would add sync complexity for no benefit.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppLanguage = 'en' | 'si';

const LANGUAGE_KEY = '@lumi/language';
const INTRO_SEEN_KEY = '@lumi/intro_seen';

interface LanguageState {
  language: AppLanguage;
  introSeen: boolean;
  setLanguage: (lang: AppLanguage) => void;
  markIntroSeen: () => void;
  loadFromStorage: () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'en',
  introSeen: false,

  setLanguage: (lang) => {
    set({ language: lang });
    AsyncStorage.setItem(LANGUAGE_KEY, lang).catch(() => {});
  },

  markIntroSeen: () => {
    set({ introSeen: true });
    AsyncStorage.setItem(INTRO_SEEN_KEY, 'true').catch(() => {});
  },

  loadFromStorage: async () => {
    try {
      const [lang, seen] = await Promise.all([
        AsyncStorage.getItem(LANGUAGE_KEY),
        AsyncStorage.getItem(INTRO_SEEN_KEY),
      ]);
      set({
        language: (lang as AppLanguage | null) ?? 'en',
        introSeen: seen === 'true',
      });
    } catch (e) {
      console.error('[useLanguageStore] loadFromStorage:', e);
    }
  },
}));
