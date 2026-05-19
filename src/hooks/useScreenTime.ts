/**
 * useScreenTime.ts
 *
 * Tracks session duration and persists daily accumulated screen time.
 *
 * Why dual persistence (AsyncStorage + Firestore):
 *   AsyncStorage — fast reads on mount, works offline.
 *   Firestore — survives reinstall, feeds the Parent Dashboard.
 *
 * Why we push todayMinutes into the Zustand store:
 *   ScreenTimeSummary and other components need the live value without
 *   reading AsyncStorage themselves (which only has the last flushed value).
 *   Writing to the store on every tick keeps all consumers up to date.
 *
 * Screen time is flushed to storage on: background, unmount, and every 60s
 * tick so the parent dashboard always shows a reasonably current value.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useParentalControlsStore } from '../store/useParentalControlsStore';
import { useAuthStore } from '../store/useAuthStore';
import {
  getScreenTimeForDate,
  saveScreenTimeForDate,
} from '../services/parentalControlsService';
import { config } from '../constants/config';

const todayKey = () => `screenTime_${new Date().toISOString().slice(0, 10)}`;

export const useScreenTime = () => {
  const { user } = useAuthStore();
  const { settings, setTodayMinutes: setStoreTodayMinutes } =
    useParentalControlsStore();
  const settingsLoaded = useParentalControlsStore((s) => s.settingsLoaded);
  const graceUntilMs = useParentalControlsStore((s) => s.graceUntilMs);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [screenTimeLoaded, setScreenTimeLoaded] = useState(false);
  // `nowMs` exists only to trigger a re-render the moment a grace window
  // expires. A single setTimeout fires at `graceUntilMs` and bumps this state,
  // so consumers re-evaluate `graceActive` without burning a polling tick.
  const [nowMs, setNowMs] = useState(Date.now());
  const sessionStartRef = useRef<number>(Date.now());
  const accumulatedRef = useRef<number>(0);
  // Ref mirror of screenTimeLoaded so flush() can read it without changing
  // identity on every load() completion (avoids re-subscribing the AppState
  // listener mid-session).
  const screenTimeLoadedRef = useRef(false);

  const pushMinutes = useCallback(
    (total: number) => {
      setTodayMinutes(total);
      setStoreTodayMinutes(total);
    },
    [setStoreTodayMinutes]
  );

  useEffect(() => {
    // Reset the loaded flag whenever the user identity changes so we don't
    // start enforcing with a stale accumulatedRef carried over from the
    // previous account on the same device.
    screenTimeLoadedRef.current = false;
    setScreenTimeLoaded(false);
    const load = async () => {
      try {
        const cached = await AsyncStorage.getItem(todayKey());
        const minutes = cached ? parseFloat(cached) : 0;
        accumulatedRef.current = minutes;
        pushMinutes(minutes);

        if (user) {
          const remote = await getScreenTimeForDate(user.uid);
          const best = Math.max(minutes, remote);
          if (best !== minutes) {
            accumulatedRef.current = best;
            pushMinutes(best);
            await AsyncStorage.setItem(todayKey(), String(best));
          }
        }
      } catch (e) {
        console.error('[useScreenTime] load:', e);
      } finally {
        // Flip loaded only after the merge with Firestore (if any) is done.
        // From this point onward, flush() may persist the live total.
        screenTimeLoadedRef.current = true;
        setScreenTimeLoaded(true);
      }
    };
    load();
    sessionStartRef.current = Date.now();
  }, [user]);

  const flush = useCallback(async () => {
    // Guard against the cold-start race: a flush triggered before load() has
    // merged the persisted total would otherwise write 0 (initial
    // accumulatedRef value) back to AsyncStorage and Firestore — corrupting
    // the day's total and effectively resetting the screen-time gate.
    if (!screenTimeLoadedRef.current) {
      return;
    }
    const elapsedMs = Date.now() - sessionStartRef.current;
    const elapsedMin = elapsedMs / 60000;
    const total = accumulatedRef.current + elapsedMin;
    accumulatedRef.current = total;
    sessionStartRef.current = Date.now();
    pushMinutes(total);

    try {
      await AsyncStorage.setItem(todayKey(), String(total));
      if (user) {
        await saveScreenTimeForDate(user.uid, total);
      }
    } catch (e) {
      console.error('[useScreenTime] flush:', e);
    }
  }, [user, pushMinutes]);

  // Flush on background/foreground transitions
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'background' || state === 'inactive') {
        flush();
      }
      if (state === 'active') {
        sessionStartRef.current = Date.now();
      }
    });
    return () => {
      sub.remove();
      flush();
    };
  }, [flush]);

  // Live tick every 60s — keeps dashboard display current between flushes
  useEffect(() => {
    const tick = setInterval(() => {
      const elapsed = (Date.now() - sessionStartRef.current) / 60000;
      pushMinutes(accumulatedRef.current + elapsed);
    }, 60000);
    return () => clearInterval(tick);
  }, [pushMinutes]);

  // Schedule a single re-render at exactly the grace expiry instant. Without
  // this, the gate stays hidden indefinitely after a +5 grant because nothing
  // forces React to re-evaluate `graceActive`.
  useEffect(() => {
    if (graceUntilMs == null) {
      return;
    }
    const remaining = graceUntilMs - Date.now();
    if (remaining <= 0) {
      setNowMs(Date.now());
      return;
    }
    const t = setTimeout(() => setNowMs(Date.now()), remaining + 100);
    return () => clearTimeout(t);
  }, [graceUntilMs]);

  const dailyLimitMinutes = settings.dailyLimitMinutes;
  const isAtWarning =
    dailyLimitMinutes > 0 &&
    todayMinutes >=
      dailyLimitMinutes * (config.SCREEN_TIME_WARNING_PERCENT / 100);
  const isAtLimit = dailyLimitMinutes > 0 && todayMinutes >= dailyLimitMinutes;
  const graceActive = graceUntilMs != null && nowMs < graceUntilMs;
  // AppRoutes blocks the child UI on this — both the AsyncStorage/Firestore
  // total AND the parent settings must be in hand before the limit gate can
  // be trusted. Without this, the gate opens during the cold-start window
  // where both values still read 0.
  const loaded = screenTimeLoaded && settingsLoaded;

  return {
    todayMinutes,
    dailyLimitMinutes,
    isAtWarning,
    isAtLimit,
    graceActive,
    loaded,
  };
};
