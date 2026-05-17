import { create } from 'zustand';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';

interface AuthState {
  user: FirebaseAuthTypes.User | null;
  initializing: boolean;
  hydrated: boolean;
  childName: string | null;
  childAge: number | null;
  childProfileSeen: boolean;
  introSeen: boolean;
  setUser: (user: FirebaseAuthTypes.User | null) => void;
  setInitializing: (initializing: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
  setChildProfile: (
    name: string | null,
    age: number | null,
    seen: boolean
  ) => void;
  setIntroSeen: (seen: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initializing: true,
  hydrated: false,
  childName: null,
  childAge: null,
  childProfileSeen: false,
  introSeen: false,
  setUser: (user) => set({ user }),
  setInitializing: (initializing) => set({ initializing }),
  setHydrated: (hydrated) => set({ hydrated }),
  setChildProfile: (childName, childAge, childProfileSeen) =>
    set({ childName, childAge, childProfileSeen }),
  setIntroSeen: (introSeen) => set({ introSeen }),
}));
