import { getApp } from '@react-native-firebase/app';
import {
  getFirestore,
  addDoc,
  collection,
} from '@react-native-firebase/firestore';

export interface PackPreviewSessionPayload {
  packId: string;
  packName: string;
  word: string;
  startedAt: number;
  endedAt: number;
  durationMs: number;
  completedLoad: boolean;
  loadTimedOut: boolean;
}

export const logPackPreviewSession = async (
  uid: string,
  payload: PackPreviewSessionPayload
): Promise<void> => {
  try {
    const db = getFirestore(getApp());
    const ref = collection(db, 'users', uid, 'packPreviewSessions');
    await addDoc(ref, payload);
  } catch (e) {
    console.error('[packPreviewAnalyticsService] logPackPreviewSession:', e);
  }
};
