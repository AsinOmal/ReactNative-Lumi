import { getApp } from '@react-native-firebase/app';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, query, where } from '@react-native-firebase/firestore';
import type { Pack } from "../types/pack";

// Fruits stays 'bundled' until its GLBs are uploaded to Firebase Storage and
// confirmed working from file:// paths on device. Flip to 'free' in the
// follow-up PR that removes the require() entries from MODEL_REGISTRY.
const INITIAL_PACKS: Pack[] = [
  {
    id: 'fruits',
    name: 'Fruits',
    description: 'Common fruits with 3D models',
    wordCount: 10,
    isPremium: false,
    isPublished: true,
    colorFrom: '#FF6B6B',
    colorTo: '#FF8E53',
    words: ['apple', 'banana', 'cherry', 'grape', 'lemon', 'mango', 'orange', 'pineapple', 'strawberry', 'watermelon'],
    packType: 'bundled',
    assetVersion: '1.0.0',
    estimatedSizeMB: 0,
  },
  {
    id: 'vegetables',
    name: 'Vegetables',
    description: 'Garden vegetables',
    wordCount: 10,
    isPremium: false,
    isPublished: false,
    colorFrom: '#22C55E',
    colorTo: '#16A34A',
    words: ['broccoli', 'carrot', 'chili', 'corn', 'cucumber', 'eggplant', 'onion', 'potato', 'pumpkin', 'tomato'],
    packType: 'free',
    assetVersion: '1.0.0',
    estimatedSizeMB: 12,
  },
  {
    id: 'vehicles',
    name: 'Vehicles',
    description: 'Everyday vehicles',
    wordCount: 10,
    isPremium: false,
    isPublished: false,
    colorFrom: '#3B82F6',
    colorTo: '#06B6D4',
    words: ['bicycle', 'boat', 'bus', 'car', 'helicopter', 'plane', 'rocket', 'tractor', 'train', 'truck'],
    packType: 'free',
    assetVersion: '1.0.0',
    estimatedSizeMB: 14,
  },
  {
    id: 'dinosaurs',
    name: 'Dinosaurs',
    description: 'Prehistoric dinosaurs',
    wordCount: 10,
    isPremium: true,
    isPublished: false,
    colorFrom: '#78350F',
    colorTo: '#92400E',
    words: ['trex', 'stegosaurus', 'brachiosaurus', 'pterodactyl', 'velociraptor', 'triceratops', 'diplodocus', 'ankylosaurus', 'spinosaurus', 'allosaurus'],
    packType: 'premium',
    assetVersion: '1.0.0',
    estimatedSizeMB: 15,
  },
  {
    id: 'space',
    name: 'Space',
    description: 'Objects in outer space',
    wordCount: 10,
    isPremium: true,
    isPublished: false,
    colorFrom: '#4B4AEF',
    colorTo: '#8B5CF6',
    words: ['planet', 'star', 'moon', 'comet', 'satellite', 'galaxy', 'asteroid', 'nebula', 'orbit', 'meteor'],
    packType: 'premium',
    assetVersion: '1.0.0',
    estimatedSizeMB: 12,
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

/** Fetch published packs from Firestore. Filter is required by security rules. */
export const fetchPacks = async (): Promise<Pack[]> => {
  try {
    const db = getFirestore(getApp());
    const snap = await getDocs(query(collection(db, 'packs'), where('isPublished', '==', true)));
    if (snap.empty) {
      console.warn('[packService] fetchPacks: no published packs found. Toggle Published in the admin Packs screen.');
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return snap.docs.map((d: any) => {
      const data = d.data();
      return {
        ...data,
        packType: data.packType ?? 'bundled',
        words: data.words ?? [],
        assetVersion: data.assetVersion ?? '1.0.0',
      } as Pack;
    });
  } catch (e) {
    console.error('[packService] fetchPacks:', e);
    return [];
  }
};
