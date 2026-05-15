// 📖 What this does:
// Game logic for Scan & Count. Manages session progress (Firestore), picks random
// target words and distractors per round, tracks which target instances are found.
// Stable callbacks (double-ref) are returned for Viro — the screen never needs to
// remount the hook. advanceRound() is called by the screen after the roundWon
// animation plays, keeping the timing entirely in the orchestrator.

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';
import { MODEL_REGISTRY } from '../utils/modelRegistry';
import { config } from '../constants/config';

const ALL_WORDS = Object.keys(MODEL_REGISTRY);
const TOTAL = config.SCAN_AND_COUNT_ROUNDS;
const MAX = config.SCAN_AND_COUNT_MAX_TARGETS;

const pickWords = (n: number): string[] =>
  [...ALL_WORDS].sort(() => Math.random() - 0.5).slice(0, n);

const pickDistractors = (exclude: string): string[] =>
  ALL_WORDS.filter((w) => w !== exclude)
    .sort(() => Math.random() - 0.5)
    .slice(0, config.SCAN_AND_COUNT_DISTRACTOR_COUNT);

interface Props {
  uid: string | null;
  onRoundComplete: () => void;
  onSessionComplete: () => void;
  onDistractorTap: () => void;
}

export const useScanAndCount = ({
  uid,
  onRoundComplete,
  onSessionComplete,
  onDistractorTap,
}: Props) => {
  const [loading, setLoading] = useState(true);
  const [startingNumber, setStartingNumber] = useState(1);
  const [currentRound, setCurrentRound] = useState(0);
  const [roundWords, setRoundWords] = useState<string[]>([]);
  const [foundIndices, setFoundIndices] = useState<number[]>([]);
  const [modelLoadedCount, setModelLoadedCount] = useState(0);
  const [targetLoadedCount, setTargetLoadedCount] = useState(0);

  const foundRef = useRef<number[]>([]);
  const startingRef = useRef(1);
  const roundRef = useRef(0);
  const onRoundRef = useRef(onRoundComplete);
  const onSessionRef = useRef(onSessionComplete);
  const onDistractorRef = useRef(onDistractorTap);
  const onTargetRef = useRef<(i: number) => void>(() => {});
  const onLoadedRef = useRef<(isTarget: boolean) => void>(() => {});

  useEffect(() => {
    onRoundRef.current = onRoundComplete;
  }, [onRoundComplete]);
  useEffect(() => {
    onSessionRef.current = onSessionComplete;
  }, [onSessionComplete]);
  useEffect(() => {
    onDistractorRef.current = onDistractorTap;
  }, [onDistractorTap]);

  const initSession = useCallback((start: number) => {
    startingRef.current = start;
    roundRef.current = 0;
    foundRef.current = [];
    setStartingNumber(start);
    setRoundWords(pickWords(TOTAL));
    setCurrentRound(0);
    setFoundIndices([]);
    setModelLoadedCount(0);
    setTargetLoadedCount(0);
    setLoading(false);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        if (!uid) {
          initSession(1);
          return;
        }
        const snap = await getDoc(
          doc(
            getFirestore(getApp()),
            'users',
            uid,
            'gameProgress',
            'scanAndCount'
          )
        );
        if (snap.exists()) {
          const { startingNumber: sn, lastPlayedAt } = snap.data() as {
            startingNumber: number;
            lastPlayedAt: number;
          };
          const expired =
            (Date.now() - lastPlayedAt) / 86400000 >
            config.SCAN_AND_COUNT_RESET_DAYS;
          initSession(expired ? 1 : sn);
        } else {
          initSession(1);
        }
      } catch (e) {
        console.error('[useScanAndCount] load:', e);
        initSession(1);
      }
    };
    load();
  }, [uid, initSession]);

  const saveProgress = useCallback(async () => {
    if (!uid) {
      return;
    }
    try {
      await setDoc(
        doc(
          getFirestore(getApp()),
          'users',
          uid,
          'gameProgress',
          'scanAndCount'
        ),
        {
          startingNumber:
            startingRef.current + config.SCAN_AND_COUNT_PROGRESSION_STEP,
          lastPlayedAt: Date.now(),
        }
      );
    } catch (e) {
      console.error('[useScanAndCount] save:', e);
    }
  }, [uid]);

  const targetWord = roundWords[currentRound] ?? 'apple';
  const targetCount = Math.min(startingNumber + currentRound, MAX);
  const distractors = useMemo(() => pickDistractors(targetWord), [targetWord]);

  useEffect(() => {
    onTargetRef.current = (index: number) => {
      if (foundRef.current.includes(index)) {
        return;
      }
      const next = [...foundRef.current, index];
      foundRef.current = next;
      setFoundIndices(next);
      const needed = Math.min(startingRef.current + roundRef.current, MAX);
      if (next.length >= needed) {
        if (roundRef.current + 1 >= TOTAL) {
          saveProgress();
          onSessionRef.current();
        } else {
          onRoundRef.current();
        }
      }
    };
    onLoadedRef.current = (isTarget: boolean) => {
      setModelLoadedCount((c) => c + 1);
      if (isTarget) {
        setTargetLoadedCount((c) => c + 1);
      }
    };
  });

  const advanceRound = useCallback(() => {
    const next = currentRound + 1;
    roundRef.current = next;
    foundRef.current = [];
    setCurrentRound(next);
    setFoundIndices([]);
    setModelLoadedCount(0);
    setTargetLoadedCount(0);
  }, [currentRound]);

  const stableOnTargetTap = useRef((i: number) =>
    onTargetRef.current(i)
  ).current;
  const stableOnDistractorTap = useRef(() => onDistractorRef.current()).current;
  const stableOnModelLoaded = useRef((isTarget: boolean) =>
    onLoadedRef.current(isTarget)
  ).current;

  return {
    loading,
    currentRound,
    totalRounds: TOTAL,
    targetWord,
    targetCount,
    distractors,
    foundIndices,
    modelLoadedCount,
    targetLoadedCount,
    advanceRound,
    stableOnTargetTap,
    stableOnDistractorTap,
    stableOnModelLoaded,
  };
};
