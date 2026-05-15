import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

export interface WishlistItem {
  word: string;
  requestCount: number;
  lastWishedAt: Date;
}

interface UseWishlistResult {
  items: WishlistItem[];
  loading: boolean;
}

export const useWishlist = (): UseWishlistResult => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(
          query(collection(db, 'wishlist'), orderBy('requestCount', 'desc')),
        );
        setItems(
          snap.docs.map(d => {
            const data = d.data();
            return {
              word: data.word ?? d.id,
              requestCount: data.requestCount ?? 0,
              lastWishedAt: typeof data.lastWishedAt === 'number'
                ? new Date(data.lastWishedAt)
                : data.lastWishedAt?.toDate?.() ?? new Date(),
            };
          }),
        );
      } catch (e) {
        console.error('[useWishlist] load failed:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { items, loading };
};
