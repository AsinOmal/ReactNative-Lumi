import { create } from 'zustand';
import type { RemoteModelEntry, RemotePack, BannerConfig, RemoteAppConfig } from '../types/remoteContent';
import { fetchRemoteModels } from '../services/remoteContentService';

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
    const models = await fetchRemoteModels();
    set({ remoteModels: Object.fromEntries(models.map(m => [m.word, m])) });
  },

  setRemoteContent: (data) => set(data),
}));
