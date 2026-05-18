/**
 * achievementRegistry.ts
 * Static list of all achievements in Lumi.
 *
 * `image` is the preferred visual — a custom PNG badge designed for this
 * achievement. `iconName` + `iconColor` are the fallback used by older share
 * captures and any code path that hasn't been migrated to images yet.
 */

import type { ImageSourcePropType } from 'react-native';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  iconColor: string;
  image?: ImageSourcePropType;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_scan',
    iconName: 'telescope',
    iconColor: '#F59E0B',
    title: 'First Discovery',
    description: 'Saved your very first word!',
    image: require('../assets/images/achievements/first-scan.png'),
  },
  {
    id: 'word_trio',
    iconName: 'text-search',
    iconColor: '#4A90D9',
    title: 'Word Trio',
    description: 'Found 3 different words.',
    image: require('../assets/images/achievements/word-trio.png'),
  },
  {
    id: 'half_pack',
    iconName: 'package-variant',
    iconColor: '#4ECDC4',
    title: 'Halfway There',
    description: 'Discovered 5 fruits!',
    image: require('../assets/images/achievements/half-pack.png'),
  },
  {
    id: 'pack_master',
    iconName: 'crown',
    iconColor: '#F97316',
    title: 'Pack Master',
    description: 'Found all 10 fruits!',
    image: require('../assets/images/achievements/pack-master.png'),
  },
  {
    id: 'spell_hero',
    iconName: 'pencil-circle',
    iconColor: '#7C3AED',
    title: 'Spell Hero',
    description: 'Corrected 3 spelling mistakes.',
    image: require('../assets/images/achievements/spell-hero.png'),
  },
  {
    id: 'perfect_scan',
    iconName: 'bullseye-arrow',
    iconColor: '#FF6B6B',
    title: 'Perfect Speller',
    description: 'Scanned a word with no mistakes!',
    image: require('../assets/images/achievements/perfect-scan.png'),
  },
  {
    id: 'speed_scanner',
    iconName: 'lightning-bolt',
    iconColor: '#F59E0B',
    title: 'Speed Scanner',
    description: 'Found 3 words in one session!',
    image: require('../assets/images/achievements/speed-scanner.png'),
  },
];

export const ACHIEVEMENT_MAP: Record<string, Achievement> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a])
);
