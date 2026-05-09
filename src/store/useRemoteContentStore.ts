import { create } from 'zustand';
import type { RemoteModelEntry, RemotePack, BannerConfig, RemoteAppConfig } from '../types/remoteContent';
import { fetchRemoteModels, loadCachedRemoteModels } from '../services/remoteContentService';
import { invalidateModelCache } from '../utils/modelRegistry';

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
      // Bust the modelRegistry's in-memory entry cache so AR scenes pick up
      // the latest scale/positionY whenever remote calibration changes.
      invalidateModelCache(cached.map(m => m.word));
    }
    const models = await fetchRemoteModels();
    // Empty fetch == transient error or offline. Don't wipe the cached state
    // we just rendered from AsyncStorage.
    if (models.length === 0) return;
    set({ remoteModels: Object.fromEntries(models.map(m => [m.word, m])) });
    invalidateModelCache(models.map(m => m.word));
  },

  setRemoteContent: (data) => set(data),
}));
