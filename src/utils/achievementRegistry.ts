/**
 * achievementRegistry.ts
 * Static list of all achievements in Lumi.
 */

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  iconColor: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_scan',
    iconName: 'telescope',
    iconColor: '#F59E0B',
    title: 'First Discovery',
    description: 'Saved your very first word!',
  },
  {
    id: 'word_trio',
    iconName: 'text-search',
    iconColor: '#4A90D9',
    title: 'Word Trio',
    description: 'Found 3 different words.',
  },
  {
    id: 'half_pack',
    iconName: 'package-variant',
    iconColor: '#4ECDC4',
    title: 'Halfway There',
    description: 'Discovered 5 fruits!',
  },
  {
    id: 'pack_master',
    iconName: 'crown',
    iconColor: '#F97316',
    title: 'Pack Master',
    description: 'Found all 10 fruits!',
  },
  {
    id: 'spell_hero',
    iconName: 'pencil-circle',
    iconColor: '#7C3AED',
    title: 'Spell Hero',
    description: 'Corrected 3 spelling mistakes.',
  },
  {
    id: 'perfect_scan',
    iconName: 'bullseye-arrow',
    iconColor: '#FF6B6B',
    title: 'Perfect Speller',
    description: 'Scanned a word with no mistakes!',
  },
  {
    id: 'speed_scanner',
    iconName: 'lightning-bolt',
    iconColor: '#F59E0B',
    title: 'Speed Scanner',
    description: 'Found 3 words in one session!',
  },
];

export const ACHIEVEMENT_MAP: Record<string, Achievement> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a])
);
