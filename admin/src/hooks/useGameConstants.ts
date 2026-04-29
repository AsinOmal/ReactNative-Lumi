import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { GameConstants } from '../types';

interface UseGameConstantsResult {
  constants: GameConstants;
  loading: boolean;
  saving: boolean;
  updateConstants: (updates: Partial<GameConstants>) => Promise<void>;
}

export const DEFAULT_CONSTANTS: GameConstants = {
  scanIntervalMs: 1000,
  hazardCheckIntervalMs: 5000,
  hazardCooldownMs: 30000,
  arGameDurationSec: 60,
  dailyWordList: [],
};

const constantsRef = () => doc(db, 'adminConfig', 'gameConstants');

export const useGameConstants = (): UseGameConstantsResult => {
  const [constants, setConstants] = useState<GameConstants>(DEFAULT_CONSTANTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      constantsRef(),
      (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          setConstants({
            scanIntervalMs: d.scanIntervalMs ?? DEFAULT_CONSTANTS.scanIntervalMs,
            hazardCheckIntervalMs: d.hazardCheckIntervalMs ?? DEFAULT_CONSTANTS.hazardCheckIntervalMs,
            hazardCooldownMs: d.hazardCooldownMs ?? DEFAULT_CONSTANTS.hazardCooldownMs,
            arGameDurationSec: d.arGameDurationSec ?? DEFAULT_CONSTANTS.arGameDurationSec,
            dailyWordList: d.dailyWordList ?? DEFAULT_CONSTANTS.dailyWordList,
          });
        }
        setLoading(false);
      },
      (err) => {
        console.error('[useGameConstants] onSnapshot:', err);
        setLoading(false);
      },
    );
    return unsub;
  }, []);

  const updateConstants = async (updates: Partial<GameConstants>): Promise<void> => {
    setSaving(true);
    try {
      await setDoc(constantsRef(), { ...constants, ...updates }, { merge: true });
    } catch (e) {
      console.error('[useGameConstants] updateConstants:', e);
      throw e;
    } finally {
      setSaving(false);
    }
  };

  return { constants, loading, saving, updateConstants };
};
