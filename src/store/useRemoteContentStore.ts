import { create } from 'zustand';
import type { RemoteModelEntry, RemotePack, BannerConfig, RemoteAppConfig } from '../types/remoteContent';
import { fetchRemoteModels, loadCachedRemoteModels } from '../services/remoteContentService';

interface RemoteContentState {
  remoteModels: Record<string, RemoteModelEntry>;
  remotePacks: RemotePack[];
  globalBlocklist: string[];
  appConfig: RemoteAppConfig | null;
  activeBanner: BannerConfig | null;
  loadRemoteModels: () => Promise<void>;
  setRemoteContent: (data: Partial<{
    remotePacks: RemotePack[];
    globalBlocklist: string[];
    appConfig: RemoteAppConfig | null;
    activeBanner: BannerConfig | null;
  }>) => void;
}

export const useRemoteContentStore = create<RemoteContentState>((set) => ({
  remoteModels: {},
  remotePacks: [],
  globalBlocklist: [],
  appConfig: null,
  activeBanner: null,

  loadRemoteModels: async () => {
    // Stale-while-revalidate: surface cached models immediately so the AR
    // hot-path has data on tick 0, then refresh from Firestore in the
    // background. Tier resolution (modelRegistry) prefers downloaded local
    // files over remote URLs, so a stale cache mostly affects unmounted
    // packs — acceptable.
    const cached = await loadCachedRemoteModels();
    if (cached && cached.length > 0) {
      set({ remoteModels: Object.fromEntries(cached.map(m => [m.word, m])) });
    }
    const models = await fetchRemoteModels();
    set({ remoteModels: Object.fromEntries(models.map(m => [m.word, m])) });
  },

  setRemoteContent: (data) => set(data),
}));
