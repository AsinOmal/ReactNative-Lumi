/**
 * achievementRegistry.ts
 * Static list of all achievements in Lumi.
 */

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_scan',
    emoji: '🌟',
    title: 'First Discovery',
    description: 'Saved your very first word!',
  },
  {
    id: 'word_trio',
    emoji: '🔍',
    title: 'Word Trio',
    description: 'Found 3 different words.',
  },
  {
    id: 'half_pack',
    emoji: '🍊',
    title: 'Halfway There',
    description: 'Discovered 5 fruits!',
  },
  {
    id: 'pack_master',
    emoji: '👑',
    title: 'Pack Master',
    description: 'Found all 10 fruits!',
  },
  {
    id: 'spell_hero',
    emoji: '✏️',
    title: 'Spell Hero',
    description: 'Corrected 3 spelling mistakes.',
  },
  {
    id: 'perfect_scan',
    emoji: '🎯',
    title: 'Perfect Speller',
    description: 'Scanned a word with no mistakes!',
  },
  {
    id: 'speed_scanner',
    emoji: '⚡',
    title: 'Speed Scanner',
    description: 'Found 3 words in one session!',
  },
];

export const ACHIEVEMENT_MAP: Record<string, Achievement> = Object.fromEntries(
  ACHIEVEMENTS.map(a => [a.id, a]),
);
