// 📖 What this does:
// Mirrors device-local progress stats (streak count, last-scan date, total
// words found, spell corrections) to /users/{uid} so they survive sign-out,
// device reinstalls, and account switches. The local AsyncStorage copy
// remains the source of truth for fast UI reads; this just keeps the server
// copy in sync via fire-and-forget writes after each scan.
//
// Why fields on the user doc (not a subcollection):
// totalWordsFound and streakCount already live on /users/{uid} — same doc
// avoids an extra read on bootstrap. Stats are scalar values, no per-entry
// querying needed.

import { getApp } from '@react-native-firebase/app';
import {
  getFirestore,
  doc,
  updateDoc,
  getDoc,
} from '@react-native-firebase/firestore';

const db = () => getFirestore(getApp());

export interface UserStats {
  streakCount: number;
  lastScanDate: string;
  totalWordsFound: number;
  spellCorrections: number;
}

const EMPTY_STATS: UserStats = {
  streakCount: 0,
  lastScanDate: '',
  totalWordsFound: 0,
  spellCorrections: 0,
};

export const syncStatsToFirestore = async (
  uid: string,
  stats: UserStats
): Promise<void> => {
  try {
    await updateDoc(doc(db(), 'users', uid) as any, {
      streakCount: stats.streakCount,
      lastScanDate: stats.lastScanDate,
      totalWordsFound: stats.totalWordsFound,
      spellCorrections: stats.spellCorrections,
    });
  } catch (e) {
    console.error('[statsService] syncStatsToFirestore:', e);
  }
};

export const loadStatsFromFirestore = async (
  uid: string
): Promise<UserStats> => {
  try {
    const snap = await getDoc(doc(db(), 'users', uid) as any);
    const data = (snap.data() as any) ?? {};
    return {
      streakCount: data.streakCount ?? 0,
      lastScanDate: data.lastScanDate ?? '',
      totalWordsFound: data.totalWordsFound ?? 0,
      spellCorrections: data.spellCorrections ?? 0,
    };
  } catch (e) {
    console.error('[statsService] loadStatsFromFirestore:', e);
    return EMPTY_STATS;
  }
};
