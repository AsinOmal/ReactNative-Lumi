import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  type QuerySnapshot,
  type DocumentData,
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage } from '../firebase';
import type { Pack } from '../types';

type PackImageKind = 'cover' | 'gate' | 'detail';
const FOLDER: Record<PackImageKind, string> = {
  cover: 'covers',
  gate: 'gates',
  detail: 'details',
};

interface UsePacksResult {
  packs: Pack[];
  loading: boolean;
  error: string | null;
  savePack: (pack: Pack) => Promise<void>;
  togglePublished: (packId: string, current: boolean) => Promise<void>;
  deletePack: (packId: string) => Promise<void>;
  uploadPackImage: (
    packId: string,
    kind: PackImageKind,
    file: File,
    onProgress: (pct: number) => void,
    oldPath?: string
  ) => Promise<{ url: string; path: string }>;
  /**
   * Increment a pack's assetVersion patch component (1.0.0 → 1.0.1). Called
   * by ModelEditor whenever a GLB or audio file is replaced — without it,
   * devices serve cached calibration against new GLB geometry.
   */
  bumpAssetVersion: (packId: string) => Promise<void>;
}

const bumpPatch = (version: string | undefined): string => {
  const [major, minor, patch] = (version ?? '1.0.0')
    .split('.')
    .map((p) => parseInt(p, 10) || 0);
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
  gateImageUrl: data.gateImageUrl ?? '',
  gateImageRef: data.gateImageRef ?? '',
  detailImageUrl: data.detailImageUrl ?? '',
  detailImageRef: data.detailImageRef ?? '',
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
        setPacks(snap.docs.map((d) => docToPack(d.id, d.data())));
        setLoading(false);
      },
      (err) => {
        console.error('[usePacks] onSnapshot error:', err);
        setError('Failed to load packs.');
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  const savePack = async (pack: Pack): Promise<void> => {
    try {
      await setDoc(
        doc(db, 'packs', pack.id),
        {
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
          gateImageUrl: pack.gateImageUrl ?? '',
          gateImageRef: pack.gateImageRef ?? '',
          detailImageUrl: pack.detailImageUrl ?? '',
          detailImageRef: pack.detailImageRef ?? '',
          packType: pack.packType ?? 'bundled',
          assetVersion: pack.assetVersion ?? '1.0.0',
          estimatedSizeMB: pack.estimatedSizeMB ?? 0,
        },
        { merge: true }
      );
    } catch (e) {
      console.error('[usePacks] savePack failed:', e);
      throw e;
    }
  };

  const togglePublished = async (
    packId: string,
    current: boolean
  ): Promise<void> => {
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

  // Delete a previously uploaded image. Wrapped in try/catch because the old
  // file may already be gone (manual cleanup, missing path) — non-fatal.
  const deleteIfExists = async (oldPath?: string): Promise<void> => {
    if (!oldPath) {
      return;
    }
    try {
      await deleteObject(ref(storage, oldPath));
    } catch (e) {
      console.warn('[usePacks] deleteIfExists (non-fatal):', oldPath, e);
    }
  };

  const uploadPackImage = (
    packId: string,
    kind: PackImageKind,
    file: File,
    onProgress: (pct: number) => void,
    oldPath?: string
  ): Promise<{ url: string; path: string }> => {
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${FOLDER[kind]}/${packId}.${ext}`;
    return new Promise((resolve, reject) => {
      // Best-effort delete of the previous file before upload. Important for
      // extension changes (PNG → JPG) — same-extension reuploads would
      // overwrite in-place, but a different ext would otherwise orphan.
      deleteIfExists(oldPath && oldPath !== path ? oldPath : undefined).then(
        () => {
          const task = uploadBytesResumable(ref(storage, path), file);
          task.on(
            'state_changed',
            (snap) =>
              onProgress(
                Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
              ),
            (err) => {
              console.error(`[usePacks] uploadPackImage(${kind}) failed:`, err);
              reject(err);
            },
            async () => {
              try {
                const url = await getDownloadURL(task.snapshot.ref);
                resolve({ url, path });
              } catch (e) {
                reject(e);
              }
            }
          );
        }
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
    packs,
    loading,
    error,
    savePack,
    togglePublished,
    deletePack,
    uploadPackImage,
    bumpAssetVersion,
  };
};
