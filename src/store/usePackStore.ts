import { create } from 'zustand';
import { Pack, fetchPacks } from '../services/packService';

interface PackState {
  packs: Pack[];
  loading: boolean;
  error: string | null;
  userProgress: Record<string, number>; // packId -> found count
  loadPacks: () => Promise<void>;
  setUserProgress: (packId: string, count: number) => void;
}

export const usePackStore = create<PackState>((set, get) => ({
  packs: [],
  loading: false,
  error: null,
  userProgress: {},

  loadPacks: async () => {
    if (get().loading || get().packs.length > 0) return;
    set({ loading: true, error: null });
    try {
      const packs = await fetchPacks();
      // Sort: free packs first, then premium
      const sorted = packs.sort((a, b) => {
        if (a.isPremium === b.isPremium) return a.name.localeCompare(b.name);
        return a.isPremium ? 1 : -1;
      });
      set({ packs: sorted, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  setUserProgress: (packId, count) =>
    set(state => ({
      userProgress: { ...state.userProgress, [packId]: count },
    })),
}));
