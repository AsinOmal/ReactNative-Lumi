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

const INITIAL_PACKS: Pack[] = [
  {
    id: 'fruits',
    name: 'Fruits',
    emoji: '🍎',
    wordCount: 10,
    isPremium: false,
    colorFrom: '#FF6B6B',
    colorTo: '#FF8E53',
    words: ['apple', 'banana', 'cherry', 'grape', 'lemon', 'mango', 'orange', 'pineapple', 'strawberry', 'watermelon'],
  },
  {
    id: 'vegetables',
    name: 'Vegetables',
    emoji: '🥦',
    wordCount: 10,
    isPremium: false,
    colorFrom: '#22C55E',
    colorTo: '#16A34A',
    words: ['broccoli', 'carrot', 'chili', 'corn', 'cucumber', 'eggplant', 'onion', 'potato', 'pumpkin', 'tomato'],
  },
  {
    id: 'vehicles',
    name: 'Vehicles',
    emoji: '🚗',
    wordCount: 10,
    isPremium: false,
    colorFrom: '#3B82F6',
    colorTo: '#06B6D4',
    words: ['bicycle', 'boat', 'bus', 'car', 'helicopter', 'plane', 'rocket', 'tractor', 'train', 'truck'],
  },
  {
    id: 'dinosaurs',
    name: 'Dinosaurs',
    emoji: '🦕',
    wordCount: 10,
    isPremium: true,
    colorFrom: '#78350F',
    colorTo: '#92400E',
    words: ['trex', 'stegosaurus', 'brachiosaurus', 'pterodactyl', 'velociraptor', 'triceratops', 'diplodocus', 'ankylosaurus', 'spinosaurus', 'allosaurus'],
  },
  {
    id: 'space',
    name: 'Space',
    emoji: '🌌',
    wordCount: 10,
    isPremium: true,
    colorFrom: '#4B4AEF',
    colorTo: '#8B5CF6',
    words: ['planet', 'star', 'moon', 'comet', 'satellite', 'galaxy', 'asteroid', 'nebula', 'orbit', 'meteor'],
  },
];

/** Creates any missing packs in Firestore. Only writes docs that don't exist yet. */
export const seedPacksIfNeeded = async () => {
  const db = getFirestore(getApp());
  for (const pack of INITIAL_PACKS) {
    try {
      const ref = doc(db, 'packs', pack.id);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, pack);
      }
    } catch (e) {
      console.error('[packService] seedPacksIfNeeded:', e);
    }
  }
};

/** Fetch all packs from Firestore. */
export const fetchPacks = async (): Promise<Pack[]> => {
  try {
    const db = getFirestore(getApp());
    const snap = await getDocs(collection(db, 'packs'));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return snap.docs.map((d: any) => d.data() as Pack);
  } catch (e) {
    console.error('[packService] fetchPacks:', e);
    return [];
  }
};
