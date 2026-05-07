import { useEffect, useState } from 'react';
import { getApp } from '@react-native-firebase/app';
import { getFirestore, doc, onSnapshot } from '@react-native-firebase/firestore';

// 📖 What this does:
// Live-subscribes to /users/{uid} so the Settings/Profile headers reflect a username change
// the moment EditUsernameModal writes it back. Keeping this separate from useAuthStore
// (which only carries the Firebase Auth user) avoids forcing every screen to reach into
// Firestore at boot — only the screens that need profile fields opt in.
export interface UserProfile {
  username: string;
  displayName: string;
}

export const useUserProfile = (uid: string | undefined): UserProfile => {
  const [profile, setProfile] = useState<UserProfile>({ username: '', displayName: '' });

  useEffect(() => {
    if (!uid) return;
    try {
      const ref = doc(getFirestore(getApp()), 'users', uid) as any;
      const unsub = onSnapshot(
        ref,
        (snap: any) => {
          const data = snap.data() ?? {};
          setProfile({
            username: data.username ?? '',
            displayName: data.displayName ?? '',
          });
        },
        (err: Error) => console.error('[useUserProfile] onSnapshot:', err),
      );
      return () => unsub();
    } catch (e) {
      console.error('[useUserProfile] subscribe:', e);
    }
  }, [uid]);

  return profile;
};
