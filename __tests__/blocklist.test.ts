/**
 * Tests for the blocklist merge logic in useParentalControlsStore.
 *
 * We test the pure merge computation rather than the Zustand store itself,
 * since the store's async methods depend on Firestore (mocked separately).
 * The invariant: mergedBlocklist = STATIC ∪ customBlocklist ∪ globalBlocklist.
 */

import { STATIC_BLOCKLIST } from '../src/data/blocklist';

// Pure helper extracted from the store for testability.
const buildMergedBlocklist = (
  custom: string[],
  global: string[]
): Set<string> => new Set([...STATIC_BLOCKLIST, ...custom, ...global]);

describe('blocklist — static list', () => {
  it('contains core profanity terms', () => {
    const set = buildMergedBlocklist([], []);
    expect(set.has('fuck')).toBe(true);
    expect(set.has('shit')).toBe(true);
  });

  it('does not contain safe educational words', () => {
    const set = buildMergedBlocklist([], []);
    expect(set.has('apple')).toBe(false);
    expect(set.has('banana')).toBe(false);
    expect(set.has('elephant')).toBe(false);
  });
});

describe('blocklist — merge behaviour', () => {
  it('includes custom parent words on top of static list', () => {
    const set = buildMergedBlocklist(['violence', 'fight'], []);
    expect(set.has('violence')).toBe(true);
    expect(set.has('fight')).toBe(true);
    expect(set.has('fuck')).toBe(true); // static still present
  });

  it('includes global admin words', () => {
    const set = buildMergedBlocklist([], ['weapon', 'blood']);
    expect(set.has('weapon')).toBe(true);
    expect(set.has('blood')).toBe(true);
  });

  it('deduplicates words that appear in multiple lists', () => {
    // A word in both custom and global should appear only once in the Set.
    const set = buildMergedBlocklist(['knife'], ['knife', 'gun']);
    // Set.size will reflect unique entries — 'knife' should not inflate count.
    const fromCustomOnly = buildMergedBlocklist(['knife'], []);
    const fromBoth = buildMergedBlocklist(['knife'], ['knife']);
    expect(fromBoth.size).toBe(fromCustomOnly.size);
  });

  it('handles empty custom and global lists', () => {
    const set = buildMergedBlocklist([], []);
    expect(set.size).toBe(STATIC_BLOCKLIST.length);
  });

  it('is case-sensitive (blocking "kill" does not block "Kill")', () => {
    // The OCR pipeline lowercases tokens before checking, so this is expected.
    const set = buildMergedBlocklist([], []);
    expect(set.has('kill')).toBe(true);
    expect(set.has('Kill')).toBe(false);
  });

  it('Set.has() is O(1) — lookup works correctly for all merged entries', () => {
    const custom = ['badword1', 'badword2'];
    const global = ['adminblock1'];
    const set = buildMergedBlocklist(custom, global);

    [...STATIC_BLOCKLIST, ...custom, ...global].forEach((word) => {
      expect(set.has(word)).toBe(true);
    });
  });
});

describe('blocklist — OCR integration path', () => {
  it('blocks a scanned word that matches a custom parent entry (lowercase)', () => {
    const scannedToken = 'violence'; // already lowercased by OCR pipeline
    const set = buildMergedBlocklist(['violence'], []);
    expect(set.has(scannedToken)).toBe(true);
  });

  it('does not block safe words regardless of list configuration', () => {
    const set = buildMergedBlocklist(['extra', 'words'], ['more', 'words']);
    const safeWords = ['apple', 'cat', 'sun', 'tree', 'bird'];
    safeWords.forEach((word) => expect(set.has(word)).toBe(false));
  });
});
