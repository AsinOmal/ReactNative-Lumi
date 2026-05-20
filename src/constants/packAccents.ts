import { colors } from './colors';
import { PACK_WORDS } from './packWords';

export const PACK_ACCENT: Record<string, string> = {
  fruits: colors.accentCoral,
  vegetables: colors.accentMint,
  vehicles: colors.accentBlue,
  dinosaurs: colors.accentAmber,
  space: colors.accentDeepPurple,
};

export const PACK_GRADIENT: Record<string, string[]> = {
  fruits: ['#FF8A65', '#FF6B6B'],
  vegetables: ['#4ECDC4', '#26A69A'],
  vehicles: ['#5C9CE5', '#4A90D9'],
  dinosaurs: ['#FFC107', '#F59E0B'],
  space: ['#B553E8', '#7C3AED'],
};

export const PACK_ICON: Record<string, string> = {
  fruits: 'fruit-watermelon',
  vegetables: 'carrot',
  vehicles: 'car',
  dinosaurs: 'dinosaur',
  space: 'rocket-launch',
};

export const PACK_EMOJI: Record<string, string> = {
  fruits: '🍎',
  vegetables: '🥦',
  vehicles: '🚗',
  dinosaurs: '🦕',
  space: '🚀',
};

export const getPackAccent = (packId: string): string =>
  PACK_ACCENT[packId] ?? colors.primary;

export const getPackGradient = (packId: string): string[] =>
  PACK_GRADIENT[packId] ?? [colors.primary, colors.primaryDark];

export const getPackIcon = (packId: string): string =>
  PACK_ICON[packId] ?? 'cube-outline';

export const getPackEmoji = (packId: string): string =>
  PACK_EMOJI[packId] ?? '📦';

export const getWordPackId = (word: string): string | null => {
  for (const [packId, words] of Object.entries(PACK_WORDS)) {
    if (words.includes(word)) return packId;
  }
  return null;
};

export const getWordPackLabel = (word: string): string => {
  const packId = getWordPackId(word);
  if (!packId) return '';
  return packId.charAt(0).toUpperCase() + packId.slice(1) + ' Pack';
};

export const getWordPackEmoji = (word: string): string => {
  const packId = getWordPackId(word);
  return packId ? getPackEmoji(packId) : '';
};

// Per-word emoji map used by game HUDs (avoids MaterialCommunityIcons rendering ? marks)
export const WORD_EMOJI: Record<string, string> = {
  balloon: '🎈', cat: '🐱', fish: '🐟', hat: '🎩', ship: '🚢', teddy: '🧸',
  dog: '🐕', icecream: '🍦', sunflower: '🌻', ball: '⚽',
  apple: '🍎', banana: '🍌', cherry: '🍒', grape: '🍇', lemon: '🍋',
  mango: '🥭', orange: '🍊', pineapple: '🍍', strawberry: '🍓', watermelon: '🍉',
  broccoli: '🥦', carrot: '🥕', chili: '🌶️', corn: '🌽', cucumber: '🥒',
  eggplant: '🍆', onion: '🧅', potato: '🥔', pumpkin: '🎃', tomato: '🍅',
  bicycle: '🚲', boat: '⛵', bus: '🚌', car: '🚗', helicopter: '🚁',
  plane: '✈️', rocket: '🚀', tractor: '🚜', train: '🚆', truck: '🚛',
};

export const getWordEmoji = (word: string): string => WORD_EMOJI[word] ?? '❓';
