import { useState, useEffect } from 'react';
import {
  collection, onSnapshot, doc, setDoc, deleteDoc,
  type QuerySnapshot, type DocumentData,
} from 'firebase/firestore';
import {
  ref, uploadBytesResumable, getDownloadURL,
} from 'firebase/storage';
import { db, storage } from '../firebase';
import type { ModelEntry } from '../types';

interface UploadResult {
  url: string;
  path: string;
}

interface UseModelsResult {
  models: ModelEntry[];
  loading: boolean;
  error: string | null;
  saveModel: (model: ModelEntry) => Promise<void>;
  deleteModel: (wordKey: string) => Promise<void>;
  uploadFile: (
    file: File,
    storagePath: string,
    onProgress: (pct: number) => void,
  ) => Promise<UploadResult>;
}

const docToModel = (id: string, data: DocumentData): ModelEntry => ({
  word: id,
  syllables: data.syllables ?? [],
  audioUrl: data.audioUrl ?? '',
  modelUrl: data.modelUrl ?? '',
  audioRef: data.audioRef ?? '',
  modelRef: data.modelRef ?? '',
  scale: data.scale ?? 1,
  positionY: data.positionY ?? 0,
  positionZ: data.positionZ ?? -1.0,
  packId: data.packId ?? '',
  isCalibrated: data.isCalibrated ?? false,
});

export const useModels = (): UseModelsResult => {
  const [models, setModels] = useState<ModelEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'adminModels'),
      (snap: QuerySnapshot) => {
        setModels(snap.docs.map(d => docToModel(d.id, d.data())));
        setLoading(false);
      },
      (err) => {
        console.error('[useModels] onSnapshot error:', err);
        setError('Failed to load models.');
        setLoading(false);
      },
    );
    return unsub;
  }, []);

  const saveModel = async (model: ModelEntry): Promise<void> => {
    try {
      await setDoc(doc(db, 'adminModels', model.word), {
        word: model.word,
        syllables: model.syllables,
        audioUrl: model.audioUrl,
        modelUrl: model.modelUrl,
        audioRef: model.audioRef,
        modelRef: model.modelRef,
        scale: model.scale,
        positionY: model.positionY,
        positionZ: model.positionZ ?? -1.0,
        packId: model.packId,
        isCalibrated: model.isCalibrated,
      }, { merge: true });
    } catch (e) {
      console.error('[useModels] saveModel failed:', e);
      throw e;
    }
  };

  const deleteModel = async (wordKey: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'adminModels', wordKey));
    } catch (e) {
      console.error('[useModels] deleteModel failed:', e);
      throw e;
    }
  };

  const uploadFile = (
    file: File,
    storagePath: string,
    onProgress: (pct: number) => void,
  ): Promise<UploadResult> =>
    new Promise((resolve, reject) => {
      const storageRef = ref(storage, storagePath);
      const task = uploadBytesResumable(storageRef, file);

      task.on(
        'state_changed',
        (snap) => {
          onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
        },
        (err) => {
          console.error('[useModels] uploadFile failed:', err);
          reject(err);
        },
        async () => {
          try {
            const url = await getDownloadURL(task.snapshot.ref);
            resolve({ url, path: storagePath });
          } catch (e) {
            reject(e);
          }
        },
      );
    });

  return { models, loading, error, saveModel, deleteModel, uploadFile };
};
