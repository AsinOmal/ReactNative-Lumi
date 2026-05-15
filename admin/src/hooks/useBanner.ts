import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { BannerConfig } from '../types';

interface UseBannerResult {
  banner: BannerConfig | null;
  loading: boolean;
  saving: boolean;
  saveBanner: (update: BannerConfig) => Promise<void>;
}

const bannerRef = () => doc(db, 'adminConfig', 'banner');

export const useBanner = (): UseBannerResult => {
  const [banner, setBanner] = useState<BannerConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      bannerRef(),
      (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          setBanner({
            message: d.message ?? '',
            accentColor: d.accentColor ?? '#7B3FC4',
            expiresAt: d.expiresAt?.toDate() ?? new Date(),
            isActive: d.isActive ?? false,
          });
        } else {
          setBanner(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('[useBanner] onSnapshot:', err);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  const saveBanner = async (update: BannerConfig): Promise<void> => {
    setSaving(true);
    try {
      await setDoc(bannerRef(), {
        ...update,
        expiresAt: Timestamp.fromDate(update.expiresAt),
      });
    } catch (e) {
      console.error('[useBanner] saveBanner:', e);
      throw e;
    } finally {
      setSaving(false);
    }
  };

  return { banner, loading, saving, saveBanner };
};
