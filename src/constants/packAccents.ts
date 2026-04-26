import { colors } from './colors';

export const PACK_ACCENT: Record<string, string> = {
  fruits:      colors.accentCoral,
  vegetables:  colors.accentMint,
  vehicles:    colors.accentBlue,
  dinosaurs:   colors.accentAmber,
  space:       colors.accentDeepPurple,
};

export const getPackAccent = (packId: string): string =>
  PACK_ACCENT[packId] ?? colors.primary;
