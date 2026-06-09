import { getApp } from '@react-native-firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from '@react-native-firebase/firestore';
import { config } from '../constants/config';

interface ModelLoadReportInput {
  uid: string;
  email: string;
  packId: string;
  packName: string;
  word: string;
  durationMs: number;
  sceneKey: number;
}

export const reportModelLoadIssue = async ({
  uid,
  email,
  packId,
  packName,
  word,
  durationMs,
  sceneKey,
}: ModelLoadReportInput): Promise<void> => {
  const displayWord = word.charAt(0).toUpperCase() + word.slice(1);
  await addDoc(collection(getFirestore(getApp()), 'feedback') as any, {
    uid,
    email,
    type: 'model_report',
    message: `${displayWord} in ${packName} did not load in pack preview.`,
    appVersion: config.APP_VERSION,
    submittedAt: serverTimestamp(),
    isRead: false,
    packId,
    packName,
    word,
    reason: 'pack_preview_timeout',
    durationMs,
    sceneKey,
  });
};
