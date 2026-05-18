/**
 * useBootstrapSession.ts
 *
 * Handles the full cold-boot auth flow so AppRoutes stays as pure routing logic.
 * On auth confirmed: creates the user doc if new, checks for account suspension,
 * loads parental settings, then fetches all remote content in parallel.
 *
 * Why suspended check after createUserIfNew (not before):
 *   createUserIfNew uses merge:true so it won't overwrite an existing suspended flag.
 *   We read the doc immediately after to see the current server state.
 *
 * Why Promise.all for remote content (not sequential):
 *   The four fetches are independent — running them in parallel shaves ~3× off boot time
 *   on a cold start with a slow connection. Each fetch returns a safe empty on failure.
 */

import { useState, useEffect } from 'react';
import { getApp } from '@react-native-firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from '@react-native-firebase/auth';
import { useAuthStore } from '../store/useAuthStore';
import { useParentalControlsStore } from '../store/useParentalControlsStore';
import { useRemoteContentStore } from '../store/useRemoteContentStore';
import { usePackDownloadStore } from '../store/usePackDownloadStore';
import { createUserIfNew, isUserSuspended } from '../services/userService';
import {
  fetchRemotePacks,
  fetchGlobalBlocklist,
  fetchActiveBanner,
  subscribeActiveBanner,
} from '../services/remoteContentService';
import { useLanguageStore } from '../store/useLanguageStore';
import { usePurchaseStore } from '../store/usePurchaseStore';
import { useAmbientStore } from '../store/useAmbientStore';
import { startAmbient, stopAmbient } from '../utils/ambientSound';
import { fetchPacks } from '../services/packService';
import {
  registerFcmToken,
  setupTokenRefresh,
  setupForegroundMessageHandler,
} from '../services/notificationService';
import {
  clearLocalUserState,
  hydrateUserOnSignIn,
} from '../services/localStateService';

interface BootstrapResult {
  initializing: boolean;
  suspendedError: boolean;
}

export const useBootstrapSession = (): BootstrapResult => {
  const {
    initializing,
    setUser,
    setInitializing,
    setHydrated,
    setChildProfile,
    setIntroSeen,
  } = useAuthStore();
  const { loadSettings, unloadSettings, mergeGlobalBlocklist } =
    useParentalControlsStore();
  const { loadRemoteModels, setRemoteContent } = useRemoteContentStore();
  const [suspendedError, setSuspendedError] = useState(false);

  useEffect(() => {
    let activeUid: string | null = null;
    let unsubTokenRefresh: (() => void) | null = null;
    let unsubBanner: (() => void) | null = null;
    let unsubForegroundFcm: (() => void) | null = null;
    const authInstance = getAuth(getApp());
    const unsub = onAuthStateChanged(authInstance, async (userState) => {
      // Capture this callback's session identity; any later await checks this
      // against activeUid to detect sign-in/sign-out churn mid-flight.
      activeUid = userState?.uid ?? null;
      const sessionUid = activeUid;

      setUser(userState);
      if (initializing) {
        setInitializing(false);
      }

      if (!userState) {
        // Wipe device-local user-scoped state so the next user signing in on
        // this device doesn't inherit streaks, saved words, achievements, or
        // skip the child-profile prompt.
        setHydrated(false);
        setChildProfile(null, null, false);
        setIntroSeen(false);
        await clearLocalUserState();
        setSuspendedError(false);
        unloadSettings();
        unsubTokenRefresh?.();
        unsubBanner?.();
        unsubBanner = null;
        unsubForegroundFcm?.();
        unsubForegroundFcm = null;
        stopAmbient();
        return;
      }

      // Load language + intro preference and purchase history before anything
      // else so the first screen renders with the correct state.
      useLanguageStore
        .getState()
        .loadFromStorage()
        .catch(() => {});
      // AsyncStorage is the instant local cache; Firestore is the source of
      // truth so a reinstall or new-device sign-in still restores premium
      // entitlements. Both run in parallel — the later one wins via merge.
      usePurchaseStore
        .getState()
        .loadFromStorage()
        .catch(() => {});
      usePurchaseStore
        .getState()
        .syncFromFirestore(sessionUid)
        .catch(() => {});
      useAmbientStore
        .getState()
        .loadFromStorage()
        .then(() => startAmbient())
        .catch(() => {});

      try {
        await createUserIfNew(userState);
      } catch (e) {
        console.warn('[useBootstrapSession] createUserIfNew:', e);
      }
      if (sessionUid !== activeUid) {
        return;
      }

      const suspended = await isUserSuspended(userState.uid);
      if (sessionUid !== activeUid) {
        return;
      }
      if (suspended) {
        setSuspendedError(true);
        await signOut(authInstance).catch(() => {});
        return;
      }

      registerFcmToken(userState.uid).catch(() => {});
      unsubTokenRefresh?.();
      unsubTokenRefresh = setupTokenRefresh(userState.uid);
      unsubForegroundFcm?.();
      unsubForegroundFcm = setupForegroundMessageHandler();

      // Live banner subscription — admin publishes propagate without cold boot.
      unsubBanner?.();
      unsubBanner = subscribeActiveBanner((activeBanner) => {
        setRemoteContent({ activeBanner });
      });

      loadSettings(userState.uid);

      // Hydrate auth-store gates AND mirror Firestore data into AsyncStorage
      // so streaks/saved-words/achievements display correctly even though the
      // local store was just wiped on sign-out.
      try {
        const data = await hydrateUserOnSignIn(userState.uid);
        if (sessionUid !== activeUid) {
          return;
        }
        setChildProfile(data.childName, data.childAge, data.childProfileSeen);
        setIntroSeen(data.introSeen);
      } catch (e) {
        console.warn('[useBootstrapSession] hydrate:', e);
      }
      setHydrated(true);
      if (sessionUid !== activeUid) {
        return;
      }

      loadRemoteModels().catch(() => {});

      try {
        const [remotePacks, blocklist, activeBanner] = await Promise.all([
          fetchRemotePacks(),
          fetchGlobalBlocklist(),
          fetchActiveBanner(),
        ]);
        if (sessionUid !== activeUid) {
          return;
        }
        setRemoteContent({
          remotePacks,
          globalBlocklist: blocklist,
          activeBanner,
        });
        mergeGlobalBlocklist(blocklist);
      } catch (e) {
        console.warn('[useBootstrapSession] remote content fetch:', e);
      }

      // Boot-time stuck-download recovery: if the app was killed mid-download,
      // AsyncStorage still says status: 'downloading' but the native task is
      // gone. Wipe partial files and reset to 'idle' so the UI doesn't show a
      // phantom progress bar forever. Runs after pack metadata is loaded so
      // we know each pack's word list (= which files to clean).
      try {
        const packs = await fetchPacks();
        if (sessionUid !== activeUid) {
          return;
        }
        await usePackDownloadStore.getState().resetStuckDownloads(packs);
      } catch (e) {
        console.warn('[useBootstrapSession] resetStuckDownloads:', e);
      }
    });
    return () => {
      unsub();
      unsubTokenRefresh?.();
      unsubBanner?.();
      unsubForegroundFcm?.();
      stopAmbient();
    };
  }, []);

  return { initializing, suspendedError };
};
