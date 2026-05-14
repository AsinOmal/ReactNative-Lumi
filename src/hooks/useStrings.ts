/**
 * useStrings — returns the active UI strings based on the user's language
 * preference stored in useLanguageStore.
 *
 * Usage in any React component or hook:
 *   const strings = useStrings();
 *   <Text>{strings.saveWord}</Text>
 *
 * The returned object is stable between renders unless the language changes,
 * so it won't cause unnecessary re-renders.
 */

import { strings as stringsEn } from '../constants/strings';
import { stringsSi } from '../constants/stringsSi';
import { useLanguageStore } from '../store/useLanguageStore';

// TypeScript will error here if stringsSi is missing any key from strings.
type StringsShape = typeof stringsEn;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _typeCheck: StringsShape = stringsSi;

export const useStrings = (): StringsShape => {
  const language = useLanguageStore(s => s.language);
  return language === 'si' ? (stringsSi as StringsShape) : stringsEn;
};
