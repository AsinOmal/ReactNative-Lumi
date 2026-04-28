import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { AppConfig } from '../types';

interface UseAppConfigResult {
  config: AppConfig;
  loading: boolean;
  saving: boolean;
  updateConfig: (updates: Partial<AppConfig>) => Promise<void>;
}

const DEFAULT_CONFIG: AppConfig = {
  maintenanceMode: false,
  newUserOnboarding: true,
  premiumPacksEnabled: true,
  arGamesEnabled: true,
};

const configRef = () => doc(db, 'adminConfig', 'featureFlags');

export const useAppConfig = (): UseAppConfigResult => {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      configRef(),
      (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          setConfig({
            maintenanceMode: d.maintenanceMode ?? false,
            newUserOnboarding: d.newUserOnboarding ?? true,
            premiumPacksEnabled: d.premiumPacksEnabled ?? true,
            arGamesEnabled: d.arGamesEnabled ?? true,
          });
        }
        setLoading(false);
      },
      (err) => {
        console.error('[useAppConfig] onSnapshot error:', err);
        setLoading(false);
      },
    );
    return unsub;
  }, []);

  const updateConfig = async (updates: Partial<AppConfig>): Promise<void> => {
    setSaving(true);
    try {
      await setDoc(configRef(), { ...config, ...updates }, { merge: true });
    } catch (e) {
      console.error('[useAppConfig] updateConfig failed:', e);
      throw e;
    } finally {
      setSaving(false);
    }
  };

  return { config, loading, saving, updateConfig };
};
