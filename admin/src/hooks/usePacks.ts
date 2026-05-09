import { useState, useEffect } from 'react';
import {
  collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc,
  serverTimestamp, type QuerySnapshot, type DocumentData,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import type { Pack } from '../types';

interface UsePacksResult {
  packs: Pack[];
  loading: boolean;
  error: string | null;
  savePack: (pack: Pack) => Promise<void>;
  togglePublished: (packId: string, current: boolean) => Promise<void>;
  deletePack: (packId: string) => Promise<void>;
  uploadCoverImage: (
    packId: string,
    file: File,
    onProgress: (pct: number) => void,
  ) => Promise<{ url: string; path: string }>;
  /**
   * Increment a pack's assetVersion patch component (1.0.0 → 1.0.1). Called
   * by ModelEditor whenever a GLB or audio file is replaced — without it,
   * devices serve cached calibration against new GLB geometry.
   */
  bumpAssetVersion: (packId: string) => Promise<void>;
}

const bumpPatch = (version: string | undefined): string => {
  const [major, minor, patch] = (version ?? '1.0.0').split('.').map((p) => parseInt(p, 10) || 0);
  return `${major}.${minor}.${patch + 1}`;
};

const docToPack = (id: string, data: DocumentData): Pack => ({
  id,
  name: data.name ?? '',
  description: data.description ?? '',
  isPremium: data.isPremium ?? false,
  isPublished: data.isPublished ?? false,
  accentColor: data.colorFrom ?? data.accentColor ?? '#7B3FC4',
  accentColorTo: data.colorTo ?? data.accentColorTo ?? '#9C59D6',
  wordCount: data.wordCount ?? 0,
  words: data.words ?? [],
  publishedAt: data.publishedAt?.toDate(),
  coverImageUrl: data.coverImageUrl ?? '',
  coverImageRef: data.coverImageRef ?? '',
  packType: data.packType ?? 'bundled',
  assetVersion: data.assetVersion ?? '1.0.0',
  estimatedSizeMB: data.estimatedSizeMB ?? 0,
});

export const usePacks = (): UsePacksResult => {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'packs'),
      (snap: QuerySnapshot) => {
        setPacks(snap.docs.map(d => docToPack(d.id, d.data())));
        setLoading(false);
      },
      (err) => {
        console.error('[usePacks] onSnapshot error:', err);
        setError('Failed to load packs.');
        setLoading(false);
      },
    );
    return unsub;
  }, []);

  const savePack = async (pack: Pack): Promise<void> => {
    try {
      await setDoc(doc(db, 'packs', pack.id), {
        id: pack.id,
        name: pack.name,
        description: pack.description,
        isPremium: pack.isPremium,
        isPublished: pack.isPublished,
        colorFrom: pack.accentColor,
        colorTo: pack.accentColorTo,
        accentColor: pack.accentColor,
        accentColorTo: pack.accentColorTo,
        wordCount: pack.words.length,
        words: pack.words,
        publishedAt: pack.isPublished ? serverTimestamp() : null,
        coverImageUrl: pack.coverImageUrl ?? '',
        coverImageRef: pack.coverImageRef ?? '',
        packType: pack.packType ?? 'bundled',
        assetVersion: pack.assetVersion ?? '1.0.0',
        estimatedSizeMB: pack.estimatedSizeMB ?? 0,
      }, { merge: true });
    } catch (e) {
      console.error('[usePacks] savePack failed:', e);
      throw e;
    }
  };

  const togglePublished = async (packId: string, current: boolean): Promise<void> => {
    try {
      await updateDoc(doc(db, 'packs', packId), {
        isPublished: !current,
        publishedAt: !current ? serverTimestamp() : null,
      });
    } catch (e) {
      console.error('[usePacks] togglePublished failed:', e);
      throw e;
    }
  };

  const deletePack = async (packId: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'packs', packId));
    } catch (e) {
      console.error('[usePacks] deletePack failed:', e);
      throw e;
    }
  };

  const uploadCoverImage = (
    packId: string,
    file: File,
    onProgress: (pct: number) => void,
  ): Promise<{ url: string; path: string }> => {
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `covers/${packId}.${ext}`;
    return new Promise((resolve, reject) => {
      const task = uploadBytesResumable(ref(storage, path), file);
      task.on(
        'state_changed',
        snap => onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
        err => { console.error('[usePacks] uploadCoverImage failed:', err); reject(err); },
        async () => {
          try {
            const url = await getDownloadURL(task.snapshot.ref);
            resolve({ url, path });
          } catch (e) {
            reject(e);
          }
        },
      );
    });
  };

  const bumpAssetVersion = async (packId: string): Promise<void> => {
    try {
      const pack = packs.find((p) => p.id === packId);
      const next = bumpPatch(pack?.assetVersion);
      await updateDoc(doc(db, 'packs', packId), { assetVersion: next });
      console.info(`[usePacks] bumped ${packId} assetVersion → ${next}`);
    } catch (e) {
      console.error('[usePacks] bumpAssetVersion failed:', e);
      throw e;
    }
  };

  return {
    packs, loading, error,
    savePack, togglePublished, deletePack, uploadCoverImage, bumpAssetVersion,
  };
};
