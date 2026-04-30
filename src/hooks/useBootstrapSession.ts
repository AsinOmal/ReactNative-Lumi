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

import { useState, useEffect } from "react";
import { getApp } from "@react-native-firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "@react-native-firebase/auth";
import { useAuthStore } from "../store/useAuthStore";
import { useParentalControlsStore } from "../store/useParentalControlsStore";
import { useRemoteContentStore } from "../store/useRemoteContentStore";
import { createUserIfNew, isUserSuspended } from "../services/userService";
import {
  fetchRemotePacks,
  fetchGlobalBlocklist,
} from "../services/remoteContentService";
import {
  registerFcmToken,
  setupTokenRefresh,
} from "../services/notificationService";

interface BootstrapResult {
  initializing: boolean;
  suspendedError: boolean;
}

export const useBootstrapSession = (): BootstrapResult => {
  const { initializing, setUser, setInitializing } = useAuthStore();
  const { loadSettings, mergeGlobalBlocklist } = useParentalControlsStore();
  const { loadRemoteModels, setRemoteContent } = useRemoteContentStore();
  const [suspendedError, setSuspendedError] = useState(false);

  useEffect(() => {
    let unsubTokenRefresh: (() => void) | null = null;
    const authInstance = getAuth(getApp());
    const unsub = onAuthStateChanged(authInstance, async (userState) => {
      setUser(userState);
      if (initializing) {
        setInitializing(false);
      }

      if (!userState) {
        setSuspendedError(false);
        unsubTokenRefresh?.();
        return;
      }

      try {
        await createUserIfNew(userState);
      } catch (e) {
        console.warn("[useBootstrapSession] createUserIfNew:", e);
      }

      const suspended = await isUserSuspended(userState.uid);
      if (suspended) {
        setSuspendedError(true);
        await signOut(authInstance).catch(() => {});
        return;
      }

      registerFcmToken(userState.uid).catch(() => {});
      unsubTokenRefresh?.();
      unsubTokenRefresh = setupTokenRefresh(userState.uid);

      try {
        await loadSettings(userState.uid);
      } catch (e) {
        console.warn("[useBootstrapSession] loadSettings:", e);
      }

      loadRemoteModels().catch(() => {});

      try {
        const [packs, blocklist] = await Promise.all([
          fetchRemotePacks(),
          fetchGlobalBlocklist(),
        ]);
        setRemoteContent({ remotePacks: packs, globalBlocklist: blocklist });
        mergeGlobalBlocklist(blocklist);
      } catch (e) {
        console.warn("[useBootstrapSession] remote content fetch:", e);
      }
    });
    return () => {
      unsub();
      unsubTokenRefresh?.();
    };
  }, []);

  return { initializing, suspendedError };
};
