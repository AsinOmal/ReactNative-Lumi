import { useState, useEffect } from 'react';
import {
  collection, onSnapshot, doc, updateDoc,
  type QuerySnapshot, type DocumentData,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { AppUser } from '../types';

interface UseUsersResult {
  users: AppUser[];
  loading: boolean;
  error: string | null;
  suspendUser: (uid: string, suspended: boolean) => Promise<void>;
}

const docToUser = (id: string, data: DocumentData): AppUser => ({
  uid: id,
  email: data.email ?? '',
  displayName: data.displayName ?? '',
  username: data.username ?? '',
  createdAt: data.createdAt?.toDate() ?? new Date(),
  lastActive: data.lastActive?.toDate() ?? new Date(),
  wordCount: data.wordCount ?? 0,
  streak: data.streak ?? 0,
  suspended: data.suspended ?? false,
});

export const useUsers = (): UseUsersResult => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'users'),
      (snap: QuerySnapshot) => {
        setUsers(snap.docs.map(d => docToUser(d.id, d.data())));
        setLoading(false);
      },
      (err) => {
        console.error('[useUsers] onSnapshot error:', err);
        setError('Failed to load users.');
        setLoading(false);
      },
    );
    return unsub;
  }, []);

  const suspendUser = async (uid: string, suspended: boolean): Promise<void> => {
    try {
      await updateDoc(doc(db, 'users', uid), { suspended });
    } catch (e) {
      console.error('[useUsers] suspendUser failed:', e);
      throw e;
    }
  };

  return { users, loading, error, suspendUser };
};
