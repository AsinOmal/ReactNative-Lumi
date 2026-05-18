// 📖 What this does:
// Friendly-title lookup for achievement ids used in admin analytics.
// Mirrors the canonical registry on mobile (src/utils/achievementRegistry.ts).
// Kept as a separate constant so the admin doesn't need to import the
// React-Native registry (which would pull in RN-specific deps via require).

export interface AdminAchievementDef {
  id: string;
  title: string;
  description: string;
}

export const ADMIN_ACHIEVEMENTS: Record<string, AdminAchievementDef> = {
  first_scan: {
    id: 'first_scan',
    title: 'First Discovery',
    description: 'Saved your very first word!',
  },
  word_trio: {
    id: 'word_trio',
    title: 'Word Trio',
    description: 'Found 3 different words.',
  },
  half_pack: {
    id: 'half_pack',
    title: 'Halfway There',
    description: 'Discovered 5 fruits!',
  },
  pack_master: {
    id: 'pack_master',
    title: 'Pack Master',
    description: 'Found all 10 fruits!',
  },
  spell_hero: {
    id: 'spell_hero',
    title: 'Spell Hero',
    description: 'Corrected 3 spelling mistakes.',
  },
  perfect_scan: {
    id: 'perfect_scan',
    title: 'Perfect Speller',
    description: 'Scanned a word with no mistakes!',
  },
  speed_scanner: {
    id: 'speed_scanner',
    title: 'Speed Scanner',
    description: 'Found 3 words in one session!',
  },
};

export const achievementTitle = (id: string): string =>
  ADMIN_ACHIEVEMENTS[id]?.title ?? id;
