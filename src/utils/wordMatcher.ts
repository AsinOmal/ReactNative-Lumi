/**
 * wordMatcher.ts
 * Matches a raw OCR text string against a list of known words.
 *
 * Strategy (two-pass to avoid fuzzy false positives):
 *  Pass 1 — Scan ALL tokens for an exact match first.
 *  Pass 2 — Only if no exact match found, scan ALL tokens for Levenshtein ≤ 2.
 *
 * This ensures that background text like "brave" doesn't trip a distance-2
 * match to "grape" if the real word "apple" is also in the frame.
 *
 * Levenshtein thresholds:
 *   distance = 0   → exact match           → isCorrection: false
 *   distance = 1   → OCR camera noise      → isCorrection: false (silent)
 *   distance = 2   → human misspelling     → isCorrection: true  (show badge)
 */

/** Compute Levenshtein edit distance between two strings */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  if (Math.abs(m - n) > 3) return 99; // can't be ≤ 2 if length diff > 3

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

/** Result returned from matchWord */
export interface MatchResult {
  word: string;          // canonical matched word, e.g. "apple"
  scannedAs: string;     // what OCR actually read, e.g. "aple"
  isCorrection: boolean; // true when distance === 2 (human misspelling)
}

/**
 * Two-pass word match against the known word list.
 *
 * @param ocrText   Raw string from OCR
 * @param packWords Lowercase canonical words to match against
 * @returns MatchResult or null if nothing matched
 */
export function matchWord(
  ocrText: string,
  packWords: string[],
): MatchResult | null {
  if (!ocrText?.trim()) return null;

  const tokens = ocrText
    .toLowerCase()
    .split(/[\s\n,.!?;:()\[\]{}"']+/)
    .map(t => t.replace(/[^a-z]/g, ''))
    .filter(t => t.length >= 3);

  // ── Pass 1: Exact match across ALL tokens ─────────────────────────────────
  for (const token of tokens) {
    if (packWords.includes(token)) {
      return { word: token, scannedAs: token, isCorrection: false };
    }
  }

  // ── Pass 2: Levenshtein ≤ 2 across ALL tokens (only if no exact match) ───
  // Collect all fuzzy matches, then pick the one with the smallest distance.
  // This avoids returning the first fuzzy hit when a better match exists.
  let best: { result: MatchResult; dist: number } | null = null;

  for (const token of tokens) {
    for (const word of packWords) {
      const dist = levenshtein(token, word);
      if (dist <= 2 && (best === null || dist < best.dist)) {
        best = {
          result: { word, scannedAs: token, isCorrection: dist === 2 },
          dist,
        };
      }
    }
  }

  return best?.result ?? null;
}
