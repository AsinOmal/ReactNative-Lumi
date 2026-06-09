import { getApp } from '@react-native-firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
} from '@react-native-firebase/firestore';

export type ContentEventType =
  | 'scan_matched'
  | 'scan_unknown'
  | 'wishlist_added'
  | 'word_saved'
  | 'ar_model_opened';

export interface ContentEventInput {
  type: ContentEventType;
  word?: string;
  packId?: string;
  packName?: string;
  source?: 'scan' | 'ar' | 'save' | 'wishlist';
  flagged?: boolean;
  durationMs?: number;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export const logContentEvent = async (
  uid: string,
  payload: ContentEventInput
): Promise<void> => {
  try {
    const db = getFirestore(getApp());
    await addDoc(collection(db, 'users', uid, 'contentEvents'), {
      ...payload,
      createdAt: Date.now(),
    });
  } catch (e) {
    console.error('[contentAnalyticsService] logContentEvent:', e);
  }
};
