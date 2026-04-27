import { create } from 'zustand';
import type { RemoteModelEntry } from '../types/remoteContent';
import { fetchRemoteModels } from '../services/remoteContentService';

interface RemoteContentState {
  remoteModels: Record<string, RemoteModelEntry>;
  loadRemoteModels: () => Promise<void>;
}

export const useRemoteContentStore = create<RemoteContentState>((set) => ({
  remoteModels: {},

  loadRemoteModels: async () => {
    const models = await fetchRemoteModels();
    set({
      remoteModels: Object.fromEntries(models.map(m => [m.word, m])),
    });
  },
}));
