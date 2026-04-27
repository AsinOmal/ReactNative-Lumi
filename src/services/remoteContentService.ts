import { getApp } from '@react-native-firebase/app';
import { getFirestore, collection, getDocs } from '@react-native-firebase/firestore';
import type { RemoteModelEntry } from '../types/remoteContent';

/** Fetches all model entries the admin has uploaded. Empty array on failure (offline-safe). */
export const fetchRemoteModels = async (): Promise<RemoteModelEntry[]> => {
  try {
    const db = getFirestore(getApp());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const snap = await getDocs(collection(db, 'adminModels'));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return snap.docs.map((d: any) => ({ word: d.id, ...d.data() } as RemoteModelEntry));
  } catch (e) {
    console.error('[remoteContentService] fetchRemoteModels:', e);
    return [];
  }
};
