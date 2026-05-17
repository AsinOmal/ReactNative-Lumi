import { getApp } from '@react-native-firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  onSnapshot,
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  RemoteModelEntry,
  RemotePack,
  BannerConfig,
  RemoteAppConfig,
} from '../types/remoteContent';
import { config } from '../constants/config';

/**
 * Load the last-known remoteModels payload from AsyncStorage. Returns null on
 * cold install or read error so callers can fall through to network fetch.
 */
export const loadCachedRemoteModels = async (): Promise<
  RemoteModelEntry[] | null
> => {
  try {
    const raw = await AsyncStorage.getItem(config.REMOTE_MODELS_CACHE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as RemoteModelEntry[];
  } catch (e) {
    console.warn('[remoteContentService] loadCachedRemoteModels:', e);
    return null;
  }
};

const saveCachedRemoteModels = async (
  models: RemoteModelEntry[]
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      config.REMOTE_MODELS_CACHE_KEY,
      JSON.stringify(models)
    );
  } catch (e) {
    console.warn('[remoteContentService] saveCachedRemoteModels:', e);
  }
};

/**
 * Real-time subscription to /adminModels. Calls back with the full list
 * whenever any doc in the collection changes. Returns an unsubscribe fn.
 *
 * Used by the dev-only live-calibration hook — Firestore charges per change
 * event, so production builds should stick to one-shot fetchRemoteModels.
 */
export const subscribeRemoteModels = (
  onChange: (models: RemoteModelEntry[]) => void
): (() => void) => {
  const db = getFirestore(getApp());
  return onSnapshot(
    collection(db, 'adminModels'),
    (snap) => {
      const models: RemoteModelEntry[] = snap.docs.map(
        (d: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
          word: d.id,
          ...(d.data() as Omit<RemoteModelEntry, 'word'>),
        })
      );
      onChange(models);
    },
    (e) => console.warn('[remoteContentService] subscribeRemoteModels:', e)
  );
};

export const fetchRemoteModels = async (): Promise<RemoteModelEntry[]> => {
  try {
    const db = getFirestore(getApp());
    const snap = await getDocs(collection(db, 'adminModels'));
    const models: RemoteModelEntry[] = snap.docs.map(
      (d: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
        word: d.id,
        ...(d.data() as Omit<RemoteModelEntry, 'word'>),
      })
    );
    saveCachedRemoteModels(models); // fire-and-forget — refresh persistence
    return models;
  } catch (e) {
    console.error('[remoteContentService] fetchRemoteModels:', e);
    return [];
  }
};

export const fetchRemotePacks = async (): Promise<RemotePack[]> => {
  try {
    const db = getFirestore(getApp());
    const q = query(collection(db, 'packs'), where('isPublished', '==', true));
    const snap = await getDocs(q);
    return snap.docs.map(
      (d: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
        ({ id: d.id, ...d.data() } as RemotePack)
    );
  } catch (e) {
    console.error('[remoteContentService] fetchRemotePacks:', e);
    return [];
  }
};

export const fetchGlobalBlocklist = async (): Promise<string[]> => {
  try {
    const db = getFirestore(getApp());
    const snap = await getDoc(doc(db, 'adminConfig', 'moderation'));
    return (
      (snap.data() as { globalBlocklist?: string[] } | undefined)
        ?.globalBlocklist ?? []
    );
  } catch (e) {
    console.error('[remoteContentService] fetchGlobalBlocklist:', e);
    return [];
  }
};

export const fetchRemoteAppConfig =
  async (): Promise<RemoteAppConfig | null> => {
    try {
      const db = getFirestore(getApp());
      const snap = await getDoc(doc(db, 'adminConfig', 'featureFlags'));
      if (!snap.exists()) {
        return null;
      }
      const d = snap.data();
      return {
        maintenanceMode: d?.maintenanceMode ?? false,
        newUserOnboarding: d?.newUserOnboarding ?? true,
        premiumPacksEnabled: d?.premiumPacksEnabled ?? true,
        arGamesEnabled: d?.arGamesEnabled ?? true,
      };
    } catch (e) {
      console.error('[remoteContentService] fetchRemoteAppConfig:', e);
      return null;
    }
  };

export const fetchActiveBanner = async (): Promise<BannerConfig | null> => {
  try {
    const db = getFirestore(getApp());
    const snap = await getDoc(doc(db, 'adminConfig', 'banner'));
    if (!snap.exists()) {
      return null;
    }
    const d = snap.data();
    const expiresAt: Date = d?.expiresAt?.toDate() ?? new Date(0);
    if (!d?.isActive || expiresAt < new Date()) {
      return null;
    }
    return {
      message: d?.message ?? '',
      accentColor: d?.accentColor ?? '#7B3FC4',
      expiresAt,
      isActive: true,
    };
  } catch (e) {
    console.error('[remoteContentService] fetchActiveBanner:', e);
    return null;
  }
};

/**
 * Live subscription to the admin banner doc. Calls back with the parsed
 * BannerConfig whenever it changes (publish, edit, deactivate, expire).
 * Why a subscription instead of one-shot on boot: an admin publishing a new
 * banner should reach already-open clients within seconds, not on next launch.
 */
export const subscribeActiveBanner = (
  onChange: (banner: BannerConfig | null) => void
): (() => void) => {
  const db = getFirestore(getApp());
  return onSnapshot(
    doc(db, 'adminConfig', 'banner'),
    (snap) => {
      if (!snap.exists()) {
        onChange(null);
        return;
      }
      const d = snap.data();
      const expiresAt: Date = d?.expiresAt?.toDate() ?? new Date(0);
      if (!d?.isActive || expiresAt < new Date()) {
        onChange(null);
        return;
      }
      onChange({
        message: d?.message ?? '',
        accentColor: d?.accentColor ?? '#7B3FC4',
        expiresAt,
        isActive: true,
      });
    },
    (e) => console.warn('[remoteContentService] subscribeActiveBanner:', e)
  );
};
