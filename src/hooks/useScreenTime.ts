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
import { getScreenTimeForDate, saveScreenTimeForDate } from '../services/parentalControlsService';
import { config } from '../constants/config';

const todayKey = () => `screenTime_${new Date().toISOString().slice(0, 10)}`;

export const useScreenTime = () => {
  const { user } = useAuthStore();
  const { settings, setTodayMinutes: setStoreTodayMinutes } = useParentalControlsStore();
  const [todayMinutes, setTodayMinutes] = useState(0);
  const sessionStartRef = useRef<number>(Date.now());
  const accumulatedRef = useRef<number>(0);

  const pushMinutes = useCallback((total: number) => {
    setTodayMinutes(total);
    setStoreTodayMinutes(total);
  }, [setStoreTodayMinutes]);

  useEffect(() => {
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
      }
    };
    load();
    sessionStartRef.current = Date.now();
  }, [user]);

  const flush = useCallback(async () => {
    const elapsedMs = Date.now() - sessionStartRef.current;
    const elapsedMin = elapsedMs / 60000;
    const total = accumulatedRef.current + elapsedMin;
    accumulatedRef.current = total;
    sessionStartRef.current = Date.now();
    pushMinutes(total);

    try {
      await AsyncStorage.setItem(todayKey(), String(total));
      if (user) await saveScreenTimeForDate(user.uid, total);
    } catch (e) {
      console.error('[useScreenTime] flush:', e);
    }
  }, [user, pushMinutes]);

  // Flush on background/foreground transitions
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'background' || state === 'inactive') flush();
      if (state === 'active') sessionStartRef.current = Date.now();
    });
    return () => { sub.remove(); flush(); };
  }, [flush]);

  // Live tick every 60s — keeps dashboard display current between flushes
  useEffect(() => {
    const tick = setInterval(() => {
      const elapsed = (Date.now() - sessionStartRef.current) / 60000;
      pushMinutes(accumulatedRef.current + elapsed);
    }, 60000);
    return () => clearInterval(tick);
  }, [pushMinutes]);

  const dailyLimitMinutes = settings.dailyLimitMinutes;
  const isAtWarning = dailyLimitMinutes > 0 && todayMinutes >= dailyLimitMinutes * (config.SCREEN_TIME_WARNING_PERCENT / 100);
  const isAtLimit = dailyLimitMinutes > 0 && todayMinutes >= dailyLimitMinutes;

  return { todayMinutes, dailyLimitMinutes, isAtWarning, isAtLimit };
};
