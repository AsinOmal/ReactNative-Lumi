import { useState, useRef, useCallback, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  useCameraDevice,
  useCameraPermission,
  Camera,
} from 'react-native-vision-camera';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import {
  MatchResult,
  matchWord,
  detectUnknownWord,
} from '../utils/wordMatcher';
import { recognizeTextInImage } from '../utils/visionOCR';
import { config } from '../constants/config';
import { ScanMode } from '../types';
import { useParentalControlsStore } from '../store/useParentalControlsStore';
import { useAuthStore } from '../store/useAuthStore';
import { logActivityEvent } from '../services/parentalControlsService';

interface UseScanOCRProps {
  mode: ScanMode;
  allSupportedWords: string[];
}

// 📖 What this does:
// This hook encapsulates all the heavy camera logic and OCR scanning loops.
// It manages permissions, camera references, App state (backgrounding),
// and the debounce logic to ensure words have to be matched across multiple consecutive frames.
export const useScanOCR = ({ mode, allSupportedWords }: UseScanOCRProps) => {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const cameraRef = useRef<Camera>(null);

  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [unknownWord, setUnknownWord] = useState<string | null>(null);

  const isScanning = useRef(false);
  const scanTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isAppActive, setIsAppActive] = useState(
    AppState.currentState === 'active'
  );
  const [isScreenFocused, setIsScreenFocused] = useState(true);
  const isFocused = useIsFocused(); // True native navigation focus state

  // Debouncing refs
  const lastCandidateRef = useRef<string | null>(null);
  const consecutiveCountRef = useRef(0);
  const firstCandidateResultRef = useRef<MatchResult | null>(null);
  // Tracks the most-recently-logged word so we don't re-fire logActivityEvent
  // every frame the user holds the camera steady on the same word. Without
  // this, a 5-second hold at SCAN_INTERVAL_MS = 500ms emits ~10 duplicate
  // activity-log entries — distorts analytics ("moon, moon, apple, apple…").
  // Reset whenever the OCR sees a different candidate (or no candidate).
  const loggedWordRef = useRef<string | null>(null);

  const lastUnknownCandidateRef = useRef<string | null>(null);
  const unknownConsecutiveRef = useRef(0);

  // Parental controls — read from store (never recalculated in the scan hot-path)
  const { mergedBlocklist } = useParentalControlsStore();
  const { user } = useAuthStore();

  // Stop camera & OCR when navigating away
  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      return () => {
        setIsScreenFocused(false);
        if (scanTimerRef.current) {
          clearInterval(scanTimerRef.current);
          scanTimerRef.current = null;
        }
        isScanning.current = false;
      };
    }, [])
  );

  // Stop camera when locked / backgrounded
  useEffect(() => {
    const sub = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        const active = nextState === 'active';
        setIsAppActive(active);
        if (!active && scanTimerRef.current) {
          clearInterval(scanTimerRef.current);
          scanTimerRef.current = null;
          isScanning.current = false;
        }
      }
    );
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const runOCR = useCallback(async () => {
    if (
      !cameraRef.current ||
      mode !== 'scan' ||
      isScanning.current ||
      !isAppActive ||
      !isScreenFocused ||
      !isFocused
    ) {
      return;
    }

    isScanning.current = true;
    try {
      const snapshot = await cameraRef.current.takePhoto({
        enableShutterSound: false,
      });
      const text = await recognizeTextInImage(snapshot.path);
      const matched = matchWord(text, allSupportedWords);

      if (matched?.word === lastCandidateRef.current) {
        consecutiveCountRef.current += 1;
      } else {
        lastCandidateRef.current = matched?.word ?? null;
        consecutiveCountRef.current = matched ? 1 : 0;
        firstCandidateResultRef.current = matched;
        // Candidate just changed — clear the "already-logged" guard so the
        // next confirmation fires a fresh log entry.
        loggedWordRef.current = null;
      }

      if (
        matched &&
        consecutiveCountRef.current >= config.REQUIRED_CONSECUTIVE_FRAMES
      ) {
        // ── Blocklist check — before surfacing to child UI ────────────────────
        // Log every confirmed match for parent activity log (flagged or not).
        // Blocked words: log silently, show nothing to the child.
        const isBlocked = mergedBlocklist.has(matched.word);
        // Suppress duplicate logs for the same held word — only the first
        // confirmation per candidate writes to Firestore.
        if (user && loggedWordRef.current !== matched.word) {
          logActivityEvent(user.uid, {
            word: matched.word,
            flagged: isBlocked,
            source: 'ocr_scan',
          }).catch(() => {
            // Fire-and-forget — don't stall the scan loop on a Firestore write error
          });
          loggedWordRef.current = matched.word;
        }

        if (!isBlocked) {
          setMatchResult(firstCandidateResultRef.current ?? matched);
        } else {
          setMatchResult(null); // silently discard — no child-facing feedback
        }
        setUnknownWord(null);
        lastUnknownCandidateRef.current = null;
        unknownConsecutiveRef.current = 0;
      } else if (!matched) {
        setMatchResult(null);

        const unknown = detectUnknownWord(text, allSupportedWords);
        if (unknown && unknown === lastUnknownCandidateRef.current) {
          unknownConsecutiveRef.current += 1;
        } else {
          lastUnknownCandidateRef.current = unknown;
          unknownConsecutiveRef.current = unknown ? 1 : 0;
        }

        if (
          unknown &&
          unknownConsecutiveRef.current >= config.REQUIRED_UNKNOWN_CONSECUTIVE
        ) {
          setUnknownWord(unknown);
        } else if (!unknown) {
          setUnknownWord(null);
        }
      }
    } catch {
      // Silently ignore — camera unavailable when backgrounded/locked
    } finally {
      isScanning.current = false;
    }
  }, [
    mode,
    isAppActive,
    isScreenFocused,
    isFocused,
    allSupportedWords,
    mergedBlocklist,
    user,
  ]);

  useEffect(() => {
    if (mode === 'scan' && isAppActive && isScreenFocused && isFocused) {
      scanTimerRef.current = setInterval(runOCR, config.SCAN_INTERVAL_MS);
    } else {
      if (scanTimerRef.current) {
        clearInterval(scanTimerRef.current);
        scanTimerRef.current = null;
      }
    }
    return () => {
      if (scanTimerRef.current) {
        clearInterval(scanTimerRef.current);
        scanTimerRef.current = null;
      }
    };
  }, [mode, isAppActive, isScreenFocused, isFocused, runOCR]);

  return {
    cameraRef,
    device,
    hasPermission,
    isAppActive,
    isFocused,
    matchResult,
    unknownWord,
    setMatchResult,
    setUnknownWord,
  };
};
