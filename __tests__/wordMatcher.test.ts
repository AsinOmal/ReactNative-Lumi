import { matchWord, detectUnknownWord } from '../src/utils/wordMatcher';

const WORDS = ['apple', 'banana', 'grape', 'mango', 'cherry'];

describe('matchWord — exact matches', () => {
  it('returns the word when OCR text contains it verbatim', () => {
    const result = matchWord('apple', WORDS);
    expect(result).toEqual({
      word: 'apple',
      scannedAs: 'apple',
      isCorrection: false,
    });
  });

  it('is case-insensitive', () => {
    const result = matchWord('APPLE', WORDS);
    expect(result?.word).toBe('apple');
  });

  it('finds the word inside a multi-token string', () => {
    const result = matchWord('the quick apple sits here', WORDS);
    expect(result?.word).toBe('apple');
  });

  it('prefers an exact match over a closer fuzzy match in Pass 1', () => {
    // "grape" is exact; "gripe" would be distance-2 — should pick exact.
    const result = matchWord('grape gripe', WORDS);
    expect(result?.word).toBe('grape');
    expect(result?.isCorrection).toBe(false);
  });
});

describe('matchWord — fuzzy matches (Levenshtein)', () => {
  it('matches a distance-1 typo without setting isCorrection (OCR noise, not user error)', () => {
    const result = matchWord('applo', WORDS);
    expect(result?.word).toBe('apple');
    expect(result?.isCorrection).toBe(false);
  });

  it('matches a distance-2 typo and sets isCorrection', () => {
    // 'cher' is distance-2 from 'cherry' (two characters missing) — user misspelling.
    const result = matchWord('cher', WORDS);
    expect(result?.word).toBe('cherry');
    expect(result?.isCorrection).toBe(true);
  });

  it('picks the best (lowest-distance) fuzzy match when multiple exist', () => {
    // 'manko' is distance-1 from 'mango' and distance-3+ from others
    const result = matchWord('manko', WORDS);
    expect(result?.word).toBe('mango');
  });

  it('does not match tokens shorter than 3 characters', () => {
    const result = matchWord('ap', WORDS);
    expect(result).toBeNull();
  });
});

describe('matchWord — no match cases', () => {
  it('returns null for empty string', () => {
    expect(matchWord('', WORDS)).toBeNull();
  });

  it('returns null for whitespace-only input', () => {
    expect(matchWord('   ', WORDS)).toBeNull();
  });

  it('returns null when distance > 2 for all tokens', () => {
    // 'xyzxyz' is far from all words
    expect(matchWord('xyzxyz', WORDS)).toBeNull();
  });

  it('returns null for an empty word list', () => {
    expect(matchWord('apple', [])).toBeNull();
  });

  it('returns null when all tokens are too short', () => {
    expect(matchWord('a b c', WORDS)).toBeNull();
  });
});

describe('matchWord — tokenisation edge cases', () => {
  it('strips punctuation before matching', () => {
    expect(matchWord('apple!', WORDS)?.word).toBe('apple');
    expect(matchWord('"apple"', WORDS)?.word).toBe('apple');
    expect(matchWord('apple.', WORDS)?.word).toBe('apple');
  });

  it('handles newlines and mixed separators', () => {
    expect(matchWord('text\nbanana\nmore', WORDS)?.word).toBe('banana');
  });

  it('scannedAs reflects what OCR actually read, not the canonical word', () => {
    const result = matchWord('cherri', WORDS); // distance-1 from 'cherry'
    expect(result?.scannedAs).toBe('cherri');
    expect(result?.word).toBe('cherry');
  });
});

describe('detectUnknownWord', () => {
  it('returns a word not in the pack list', () => {
    const result = detectUnknownWord('watermelon', WORDS);
    expect(result).toBe('watermelon');
  });

  it('returns null when the token is already in the pack', () => {
    expect(detectUnknownWord('apple', WORDS)).toBeNull();
  });

  it('returns null when the token is within distance-2 of a pack word', () => {
    // 'gripe' is distance-2 from 'grape' — should be excluded
    expect(detectUnknownWord('gripe', WORDS)).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(detectUnknownWord('', WORDS)).toBeNull();
  });

  it('ignores tokens shorter than 4 characters', () => {
    expect(detectUnknownWord('cat', WORDS)).toBeNull();
  });

  it('ignores tokens longer than 18 characters', () => {
    expect(
      detectUnknownWord('superlongwordthatexceedslimit', WORDS)
    ).toBeNull();
  });

  it('returns the longest unknown token when multiple exist', () => {
    // 'watermelon' (10) beats 'kiwi' (4)
    const result = detectUnknownWord('kiwi watermelon', WORDS);
    expect(result).toBe('watermelon');
  });
});
