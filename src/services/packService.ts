import { getApp } from '@react-native-firebase/app';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from '@react-native-firebase/firestore';

export interface Pack {
  id: string;
  name: string;
  emoji: string;
  wordCount: number;
  isPremium: boolean;
  words: string[];
  colorFrom: string;
  colorTo: string;
}

// Initial seed data — written to Firestore once on app first-launch
const INITIAL_PACKS: Pack[] = [
  {
    id: 'fruits',
    name: 'Fruits',
    emoji: '🍎',
    wordCount: 10,
    isPremium: false,
    colorFrom: '#FF6B6B',
    colorTo: '#FF8E53',
    words: ['apple', 'banana', 'orange', 'grape', 'mango', 'pineapple', 'strawberry', 'watermelon', 'lemon', 'cherry'],
  },
  {
    id: 'space',
    name: 'Space',
    emoji: '🚀',
    wordCount: 10,
    isPremium: false,
    colorFrom: '#4B4AEF',
    colorTo: '#8B5CF6',
    words: ['rocket', 'planet', 'star', 'moon', 'comet', 'satellite', 'galaxy', 'asteroid', 'nebula', 'orbit'],
  },
  {
    id: 'animals',
    name: 'Animals',
    emoji: '🦁',
    wordCount: 15,
    isPremium: true,
    colorFrom: '#F59E0B',
    colorTo: '#EF4444',
    words: ['lion', 'elephant', 'giraffe', 'zebra', 'penguin', 'dolphin', 'tiger', 'bear', 'wolf', 'eagle', 'crocodile', 'koala', 'panda', 'gorilla', 'cheetah'],
  },
  {
    id: 'vehicles',
    name: 'Vehicles',
    emoji: '🚗',
    wordCount: 12,
    isPremium: true,
    colorFrom: '#3B82F6',
    colorTo: '#06B6D4',
    words: ['car', 'truck', 'airplane', 'helicopter', 'train', 'ship', 'bus', 'motorcycle', 'submarine', 'bicycle', 'rocket', 'tractor'],
  },
];

// Seeds packs to Firestore if they don't exist yet
export const seedPacksIfNeeded = async () => {
  const db = getFirestore(getApp());

  for (const pack of INITIAL_PACKS) {
    const ref = doc(db, 'packs', pack.id);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) {
      await setDoc(ref, pack);
    }
  }
};

// Fetch all packs from Firestore
export const fetchPacks = async (): Promise<Pack[]> => {
  const db = getFirestore(getApp());
  const snapshot = await getDocs(collection(db, 'packs'));
  return snapshot.docs.map(d => d.data() as Pack);
};

// Fetch user's progress for a specific pack
export const fetchUserPackProgress = async (uid: string, packId: string): Promise<number> => {
  const db = getFirestore(getApp());
  const ref = doc(db, 'users', uid, 'progress', packId);
  const snapshot = await getDoc(ref);
  if (snapshot.exists()) {
    const data = snapshot.data() as { foundWords: string[] };
    return data.foundWords?.length ?? 0;
  }
  return 0;
};
