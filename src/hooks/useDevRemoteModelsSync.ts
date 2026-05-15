// 📖 What this does:
// Dev-only hot-update for admin model calibration. Subscribes to /adminModels
// in Firestore so every Save in the admin panel flows into the mobile store
// within ~1s. Pair with exiting + re-entering AR to see the new values
// applied (Viro reads its props once at scene mount).
//
// Why dev-only: onSnapshot bills per change × subscribed users. Production
// keeps the cold-boot fetch to avoid that.

import { useEffect } from 'react';
import { subscribeRemoteModels } from '../services/remoteContentService';
import { useRemoteContentStore } from '../store/useRemoteContentStore';
import { invalidateModelCache } from '../utils/modelRegistry';

export const useDevRemoteModelsSync = (): void => {
  useEffect(() => {
    if (!__DEV__) {
      return;
    }
    const unsub = subscribeRemoteModels((models) => {
      if (models.length === 0) {
        return;
      }
      const map = Object.fromEntries(models.map((m) => [m.word, m]));
      useRemoteContentStore.setState({ remoteModels: map });
      invalidateModelCache(models.map((m) => m.word));
      console.log(`[dev] remoteModels live update — ${models.length} entries`);
    });
    return () => unsub();
  }, []);
};
