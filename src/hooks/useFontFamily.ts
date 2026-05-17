/**
 * useFontFamily.ts
 *
 * Returns the correct font-family string for the current app language.
 * Fredoka has 5 weights; Maname is regular-only — so when the language is
 * Sinhala we collapse every requested weight onto 'Maname-Regular'. This
 * keeps the type-system contract identical across languages and avoids
 * scattering `if (language === 'si')` branches across screens.
 *
 * Usage:
 *   const fontFamily = useFontFamily('Bold');
 *   <Text style={{ fontFamily, fontSize: 16 }}>{label}</Text>
 *
 * For static Sinhala-only text (e.g. modelRegistry.sinhalaLabel), use
 * `getSinhalaFont()` directly — no need to subscribe to the language store.
 */

import { useLanguageStore } from '../store/useLanguageStore';

export type FredokaWeight =
  | 'Light'
  | 'Regular'
  | 'Medium'
  | 'SemiBold'
  | 'Bold';

const SINHALA_FONT = 'Maname-Regular';

export const useFontFamily = (weight: FredokaWeight = 'Regular'): string => {
  const language = useLanguageStore((s) => s.language);
  return language === 'si' ? SINHALA_FONT : `Fredoka-${weight}`;
};

export const getSinhalaFont = (): string => SINHALA_FONT;
