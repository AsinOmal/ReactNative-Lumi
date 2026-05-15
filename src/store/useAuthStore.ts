import { create } from 'zustand';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';

interface AuthState {
  user: FirebaseAuthTypes.User | null;
  initializing: boolean;
  childName: string | null;
  childAge: number | null;
  setUser: (user: FirebaseAuthTypes.User | null) => void;
  setInitializing: (initializing: boolean) => void;
  setChildProfile: (name: string | null, age: number | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initializing: true,
  childName: null,
  childAge: null,
  setUser: (user) => set({ user }),
  setInitializing: (initializing) => set({ initializing }),
  setChildProfile: (childName, childAge) => set({ childName, childAge }),
}));
