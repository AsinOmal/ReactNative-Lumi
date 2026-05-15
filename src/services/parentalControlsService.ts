/**
 * parentalControlsService.ts
 *
 * Firestore CRUD for Parental Controls: settings, activity log, and screen time.
 *
 * Schema (settled here — do not change after Phase 4c is built):
 *   /users/{uid}/parentSettings         — ParentSettings document
 *   /users/{uid}/activityLog/{autoId}   — ActivityLogEntry per scan event
 *   /users/{uid}/screenTime/{YYYY-MM-DD} — daily minutes total
 */

import { getApp } from '@react-native-firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {
  ParentSettings,
  ActivityLogEntry,
  ScreenTimeRecord,
} from '../types/parentalControls';

const db = () => getFirestore(getApp());

// ── Parent Settings ────────────────────────────────────────────────────────────

export const loadParentSettings = async (
  uid: string
): Promise<ParentSettings | null> => {
  try {
    const ref = doc(db(), 'users', uid, 'parentSettings', 'settings');
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return null;
    }
    return snap.data() as ParentSettings;
  } catch (e) {
    console.error('[parentalControlsService] loadParentSettings:', e);
    return null;
  }
};

// Returns an unsubscribe function. Calls callback whenever parentSettings changes in Firestore.
export const subscribeToParentSettings = (
  uid: string,
  callback: (settings: ParentSettings | null) => void
): (() => void) => {
  const ref = doc(db(), 'users', uid, 'parentSettings', 'settings');
  return onSnapshot(
    ref,
    (snap: FirebaseFirestoreTypes.DocumentSnapshot) => {
      callback(snap.exists() ? (snap.data() as ParentSettings) : null);
    },
    (e: Error) => {
      console.error('[parentalControlsService] subscribeToParentSettings:', e);
    }
  );
};

export const saveParentSettings = async (
  uid: string,
  settings: ParentSettings
): Promise<void> => {
  try {
    const ref = doc(db(), 'users', uid, 'parentSettings', 'settings');
    await setDoc(ref, { ...settings, updatedAt: Date.now() });
  } catch (e) {
    console.error('[parentalControlsService] saveParentSettings:', e);
  }
};

// ── Activity Log ───────────────────────────────────────────────────────────────

export const logActivityEvent = async (
  uid: string,
  entry: Omit<ActivityLogEntry, 'timestamp'>
): Promise<void> => {
  try {
    const ref = collection(db(), 'users', uid, 'activityLog');
    await addDoc(ref, { ...entry, timestamp: Date.now() });
  } catch (e) {
    console.error('[parentalControlsService] logActivityEvent:', e);
  }
};

export const loadActivityLog = async (
  uid: string,
  count = 20
): Promise<ActivityLogEntry[]> => {
  try {
    const ref = collection(db(), 'users', uid, 'activityLog');
    const q = query(ref, orderBy('timestamp', 'desc'), limit(count));
    const snap = await getDocs(q);
    return snap.docs.map(
      (d: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
        d.data() as ActivityLogEntry
    );
  } catch (e) {
    console.error('[parentalControlsService] loadActivityLog:', e);
    return [];
  }
};

// ── Screen Time ───────────────────────────────────────────────────────────────

const todayKey = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD

export const getScreenTimeForDate = async (
  uid: string,
  date = todayKey()
): Promise<number> => {
  try {
    const ref = doc(db(), 'users', uid, 'screenTime', date);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return 0;
    }
    return (snap.data() as ScreenTimeRecord).totalMinutes ?? 0;
  } catch (e) {
    console.error('[parentalControlsService] getScreenTimeForDate:', e);
    return 0;
  }
};

export const saveScreenTimeForDate = async (
  uid: string,
  minutes: number,
  date = todayKey()
): Promise<void> => {
  try {
    const ref = doc(db(), 'users', uid, 'screenTime', date);
    await setDoc(ref, { totalMinutes: minutes });
  } catch (e) {
    console.error('[parentalControlsService] saveScreenTimeForDate:', e);
  }
};
