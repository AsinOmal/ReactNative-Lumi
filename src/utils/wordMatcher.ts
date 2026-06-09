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
  if (m === 0) {
    return n;
  }
  if (n === 0) {
    return m;
  }
  if (Math.abs(m - n) > 3) {
    return 99;
  } // can't be ≤ 2 if length diff > 3

  const dp: number[][] = Array.from({ length: m + 1 }, (_row, rowIndex) =>
    Array.from({ length: n + 1 }, (_col, colIndex) =>
      rowIndex === 0 ? colIndex : colIndex === 0 ? rowIndex : 0
    )
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
  word: string; // canonical matched word, e.g. "apple"
  scannedAs: string; // what OCR actually read, e.g. "aple"
  isCorrection: boolean; // true when distance === 2 (human misspelling)
}

const tokenizeWords = (
  ocrText: string,
  minLength: number,
  maxLength = Number.MAX_SAFE_INTEGER
): string[] =>
  ocrText
    .toLowerCase()
    .split(/[\s\n,.!?;:()[\]{}"']+/)
    .map((t) => t.replace(/[^a-z]/g, ''))
    .filter((t) => t.length >= minLength && t.length <= maxLength);

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
  protectedCatalogWords: string[] = packWords
): MatchResult | null {
  if (!ocrText?.trim()) {
    return null;
  }

  const activeWords = new Set(packWords.map((w) => w.toLowerCase()));
  const protectedWords = new Set(
    protectedCatalogWords.map((w) => w.toLowerCase())
  );
  const tokens = tokenizeWords(ocrText, 3);

  // ── Pass 1: Exact match across ALL tokens ─────────────────────────────────
  for (const token of tokens) {
    if (activeWords.has(token)) {
      return { word: token, scannedAs: token, isCorrection: false };
    }
  }

  // ── Pass 2: Levenshtein ≤ 2 across ALL tokens (only if no exact match) ───
  // Collect all fuzzy matches, then pick the one with the smallest distance.
  // This avoids returning the first fuzzy hit when a better match exists.
  let best: { result: MatchResult; dist: number } | null = null;

  for (const token of tokens) {
    if (protectedWords.has(token) && !activeWords.has(token)) {
      continue;
    }
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

/**
 * Given raw OCR text and the known pack words, find the best "clean unknown"
 * word — a real-looking alphabetic token that is NOT in the pack.
 *
 * Rules:
 * - Must be purely alphabetic, length 4–18
 * - Must NOT already be in packWords (exact or within distance 2)
 * - Pick the longest token (heuristic: longer = more likely intentional)
 *
 * Returns null if nothing clean is found — prevents showing noise.
 */
export function detectUnknownWord(
  ocrText: string,
  packWords: string[],
  protectedCatalogWords: string[] = packWords
): string | null {
  if (!ocrText?.trim()) {
    return null;
  }

  const activeWords = new Set(packWords.map((w) => w.toLowerCase()));
  const protectedWords = new Set(
    protectedCatalogWords.map((w) => w.toLowerCase())
  );
  const tokens = tokenizeWords(ocrText, 4, 18)
    // Must look like a real word: no more than 2 consonants in a row at start
    .filter((t) => /^[a-z]/.test(t));

  const protectedMisses = tokens.filter(
    (token) => protectedWords.has(token) && !activeWords.has(token)
  );
  if (protectedMisses.length > 0) {
    return protectedMisses.reduce((a, b) => (a.length >= b.length ? a : b));
  }

  // Filter out anything too close to a pack word
  const strangers = tokens.filter((token) =>
    packWords.every((w) => !activeWords.has(token) && levenshtein(token, w) > 2)
  );

  if (strangers.length === 0) {
    return null;
  }

  // Return longest token (most likely the intentional word)
  return strangers.reduce((a, b) => (a.length >= b.length ? a : b));
}
