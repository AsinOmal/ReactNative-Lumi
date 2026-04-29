/**
 * useRemoteConfig.ts
 *
 * Replaces the one-shot fetches for featureFlags and banner with persistent
 * onSnapshot listeners. Fires immediately with current Firestore values, then
 * pushes updates in real-time (typically < 2s) whenever an admin changes them.
 *
 * Why `enabled` param: hooks can't be called conditionally, but listeners
 * should only run when a user is authenticated. Passing `enabled={!!user}`
 * from AppRoutes lets the effect start/stop cleanly on login/logout.
 */

import { useEffect } from 'react';
import { getApp } from '@react-native-firebase/app';
import { getFirestore, doc, onSnapshot } from '@react-native-firebase/firestore';
import { useRemoteContentStore } from '../store/useRemoteContentStore';
import type { RemoteAppConfig, BannerConfig } from '../types/remoteContent';

export const useRemoteConfig = (enabled: boolean): void => {
  const { setRemoteContent } = useRemoteContentStore();

  useEffect(() => {
    if (!enabled) return;

    const db = getFirestore(getApp());

    const unsubFlags = onSnapshot(
      doc(db, 'adminConfig', 'featureFlags') as any,
      (snap: any) => {
        if (!snap.exists()) return;
        const d = snap.data();
        const appConfig: RemoteAppConfig = {
          maintenanceMode:    d?.maintenanceMode    ?? false,
          newUserOnboarding:  d?.newUserOnboarding  ?? true,
          premiumPacksEnabled: d?.premiumPacksEnabled ?? true,
          arGamesEnabled:     d?.arGamesEnabled     ?? true,
        };
        setRemoteContent({ appConfig });
      },
      (err: any) => console.error('[useRemoteConfig] featureFlags:', err),
    );

    const unsubBanner = onSnapshot(
      doc(db, 'adminConfig', 'banner') as any,
      (snap: any) => {
        if (!snap.exists()) { setRemoteContent({ activeBanner: null }); return; }
        const d = snap.data();
        const expiresAt: Date = d?.expiresAt?.toDate() ?? new Date(0);
        if (!d?.isActive || expiresAt < new Date()) {
          setRemoteContent({ activeBanner: null });
          return;
        }
        const activeBanner: BannerConfig = {
          message:     d?.message     ?? '',
          accentColor: d?.accentColor ?? '#7B3FC4',
          expiresAt,
          isActive: true,
        };
        setRemoteContent({ activeBanner });
      },
      (err: any) => console.error('[useRemoteConfig] banner:', err),
    );

    return () => { unsubFlags(); unsubBanner(); };
  }, [enabled]);
};
