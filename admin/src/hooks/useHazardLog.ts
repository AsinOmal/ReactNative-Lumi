import { useState, useEffect } from 'react';
import {
  collectionGroup,
  query,
  orderBy,
  limit,
  getDocs,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { HazardEvent } from '../types';

interface UseHazardLogResult {
  events: HazardEvent[];
  loading: boolean;
}

export const useHazardLog = (): UseHazardLogResult => {
  const [events, setEvents] = useState<HazardEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Requires Firestore index: hazardEvents collection, detectedAt DESC
        const q = query(
          collectionGroup(db, 'hazardEvents'),
          orderBy('detectedAt', 'desc'),
          limit(100)
        );
        const snap = await getDocs(q);
        setEvents(
          snap.docs.map((d) => {
            const data = d.data() as DocumentData;
            const uid = d.ref.path.split('/')[1] ?? '';
            return {
              id: d.id,
              uid,
              label: data.label ?? '',
              detectedAt: data.detectedAt?.toDate() ?? new Date(0),
              dismissed: data.dismissed ?? false,
            } as HazardEvent;
          })
        );
      } catch (e) {
        console.error('[useHazardLog] load:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { events, loading };
};
