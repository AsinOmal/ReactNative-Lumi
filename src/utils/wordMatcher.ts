/**
 * wordMatcher.ts
 * Matches a raw OCR text string against a list of known pack words.
 *
 * Strategy:
 *  1. Exact match (case-insensitive, trimmed)
 *  2. Levenshtein distance ≤ 1 (single typo / misread character tolerance)
 *
 * Returns the canonical matched word or null.
 */

/** Compute Levenshtein edit distance between two strings */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  // Early exits
  if (m === 0) return n;
  if (n === 0) return m;
  if (Math.abs(m - n) > 2) return 99; // can't be ≤ 1 if length diff > 2

  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/**
 * Extract individual words from an OCR result string and try to match
 * any of them against the pack word list.
 *
 * @param ocrText Raw string from ML Kit text recognition
 * @param packWords Lowercase canonical words from the active pack
 * @returns The matched canonical word, or null
 */
export function matchWord(
  ocrText: string,
  packWords: string[],
): string | null {
  if (!ocrText?.trim()) return null;

  // Split recognized text into individual tokens (letters only)
  const tokens = ocrText
    .toLowerCase()
    .split(/[\s\n,.!?;:()\[\]{}"']+/)
    .map(t => t.replace(/[^a-z]/g, ''))
    .filter(t => t.length >= 3); // ignore very short tokens

  for (const token of tokens) {
    // 1. Exact match
    if (packWords.includes(token)) return token;

    // 2. Levenshtein ≤ 1 (only for words of similar length)
    for (const word of packWords) {
      if (levenshtein(token, word) <= 1) return word;
    }
  }

  return null;
}
