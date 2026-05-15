/**
 * useParentalControlsStore.ts
 *
 * Zustand store for the Parental Controls system.
 *
 * Key design choice — mergedBlocklist is a Set<string>:
 *   The scan hot-path calls mergedBlocklist.has(word) on every OCR frame.
 *   Set.has() is O(1) vs Array.includes() O(n). With the blocklist potentially
 *   being 50–100 words, this keeps the scan loop snappy.
 *   The set is built once on loadSettings() and never recalculated mid-session.
 *
 * isParentUnlocked resets on every cold app start — parents must re-authenticate
 * each session. This prevents a child from keeping the app open to stay unlocked.
 */

import { create } from 'zustand';
import { ParentSettings } from '../types/parentalControls';
import { subscribeToParentSettings, saveParentSettings } from '../services/parentalControlsService';
import { STATIC_BLOCKLIST } from '../data/blocklist';

const DEFAULT_SETTINGS: ParentSettings = {
  dailyLimitMinutes: 0,
  timedModeEnabled: false,
  customBlocklist: [],
  pinHash: null,
  updatedAt: 0,
};

interface ParentalControlsState {
  isParentUnlocked: boolean;
  settings: ParentSettings;
  mergedBlocklist: Set<string>;
  todayMinutes: number;          // live value written by useScreenTime
  _unsubSettings: (() => void) | null;
  setTodayMinutes: (m: number) => void;
  setParentUnlocked: (unlocked: boolean) => void;
  loadSettings: (uid: string) => void;
  unloadSettings: () => void;
  updateSettings: (uid: string, patch: Partial<ParentSettings>) => Promise<void>;
  mergeGlobalBlocklist: (globalWords: string[]) => void;
}

export const useParentalControlsStore = create<ParentalControlsState>((set, get) => ({
  isParentUnlocked: false,
  settings: DEFAULT_SETTINGS,
  mergedBlocklist: new Set(STATIC_BLOCKLIST),
  todayMinutes: 0,
  _unsubSettings: null,
  setTodayMinutes: (m) => set({ todayMinutes: m }),

  setParentUnlocked: (unlocked) => set({ isParentUnlocked: unlocked }),

  loadSettings: (uid) => {
    // Cancel any previous listener before subscribing
    get()._unsubSettings?.();
    const unsub = subscribeToParentSettings(uid, (loaded) => {
      const settings = loaded ?? DEFAULT_SETTINGS;
      const merged = new Set([...STATIC_BLOCKLIST, ...settings.customBlocklist]);
      set({ settings, mergedBlocklist: merged });
    });
    set({ _unsubSettings: unsub });
  },

  unloadSettings: () => {
    get()._unsubSettings?.();
    set({ _unsubSettings: null, settings: DEFAULT_SETTINGS });
  },

  updateSettings: async (uid, patch) => {
    try {
      const current = get().settings;
      const next = { ...current, ...patch };
      await saveParentSettings(uid, next);
      const merged = new Set([...STATIC_BLOCKLIST, ...next.customBlocklist]);
      set({ settings: next, mergedBlocklist: merged });
    } catch (e) {
      console.error('[useParentalControlsStore] updateSettings:', e);
    }
  },

  mergeGlobalBlocklist: (globalWords) => {
    const { settings } = get();
    const merged = new Set([...STATIC_BLOCKLIST, ...settings.customBlocklist, ...globalWords]);
    set({ mergedBlocklist: merged });
  },
}));
