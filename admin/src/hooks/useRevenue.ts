import { useState, useEffect } from 'react';
import { collectionGroup, getDocs, type DocumentData } from 'firebase/firestore';
import { db } from '../firebase';
import type { Purchase } from '../types';

interface RevenueStats {
  totalPurchases: number;
  byProduct: Record<string, number>;
  recentPurchases: Purchase[];
}

interface UseRevenueResult {
  stats: RevenueStats;
  loading: boolean;
}

// Display names for known product IDs
export const PRODUCT_LABELS: Record<string, string> = {
  'com.lumi.pack.dinosaurs': 'Dinosaurs Pack',
  'com.lumi.pack.space':     'Space Pack',
  'com.lumi.pack.bundle':    'Bundle (Dino + Space)',
};

export const PRODUCT_PRICES: Record<string, number> = {
  'com.lumi.pack.dinosaurs': 1.99,
  'com.lumi.pack.space':     1.99,
  'com.lumi.pack.bundle':    2.99,
};

export const useRevenue = (): UseRevenueResult => {
  const [stats, setStats] = useState<RevenueStats>({
    totalPurchases: 0,
    byProduct: {},
    recentPurchases: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Requires a Firestore collection group index on 'purchases'
    const load = async () => {
      try {
        const snap = await getDocs(collectionGroup(db, 'purchases'));
        const purchases: Purchase[] = snap.docs.map((d) => {
          const data = d.data() as DocumentData;
          const uid = d.ref.path.split('/')[1] ?? '';
          return {
            uid,
            productId: d.id,
            purchasedAt: typeof data.purchasedAt === 'number'
              ? new Date(data.purchasedAt)
              : data.purchasedAt?.toDate?.() ?? new Date(),
            simulated: data.simulated ?? false,
          };
        });

        const byProduct: Record<string, number> = {};
        for (const p of purchases) {
          byProduct[p.productId] = (byProduct[p.productId] ?? 0) + 1;
        }

        setStats({
          totalPurchases: purchases.length,
          byProduct,
          recentPurchases: [...purchases]
            .sort((a, b) => b.purchasedAt.getTime() - a.purchasedAt.getTime())
            .slice(0, 20),
        });
      } catch (e) {
        console.error('[useRevenue] load failed:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { stats, loading };
};
