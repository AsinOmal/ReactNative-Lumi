// Letters, hyphens, apostrophes only — matches the Firestore rule & prevents
// path injection (no slashes, periods, or control characters).
const WORD_RE = /^[a-zA-Z'-]{1,50}$/;

/** Returns true if the string is safe to use as a Firestore savedWords doc ID. */
export const isValidWord = (word: string): boolean => WORD_RE.test(word);
