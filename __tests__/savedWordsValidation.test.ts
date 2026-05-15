import { isValidWord } from '../src/utils/wordValidator';

describe('isValidWord — valid inputs', () => {
  it('accepts a simple lowercase word', () => {
    expect(isValidWord('apple')).toBe(true);
  });

  it('accepts an uppercase word', () => {
    expect(isValidWord('Apple')).toBe(true);
  });

  it('accepts a hyphenated word', () => {
    expect(isValidWord('well-known')).toBe(true);
  });

  it('accepts a word with an apostrophe', () => {
    expect(isValidWord("it's")).toBe(true);
  });

  it('accepts a single character', () => {
    expect(isValidWord('a')).toBe(true);
  });

  it('accepts a word of exactly 50 characters', () => {
    expect(isValidWord('a'.repeat(50))).toBe(true);
  });
});

describe('isValidWord — invalid inputs', () => {
  it('rejects an empty string', () => {
    expect(isValidWord('')).toBe(false);
  });

  it('rejects a word with a forward slash (path injection)', () => {
    expect(isValidWord('../../admin')).toBe(false);
    expect(isValidWord('users/uid')).toBe(false);
  });

  it('rejects a word with a period (Firestore reserved)', () => {
    expect(isValidWord('hello.world')).toBe(false);
  });

  it('rejects a word containing digits', () => {
    expect(isValidWord('word123')).toBe(false);
  });

  it('rejects a word with spaces', () => {
    expect(isValidWord('hello world')).toBe(false);
  });

  it('rejects a word with special characters', () => {
    expect(isValidWord('hello!')).toBe(false);
    expect(isValidWord('<script>')).toBe(false);
    expect(isValidWord('null\x00byte')).toBe(false);
  });

  it('rejects a word longer than 50 characters', () => {
    expect(isValidWord('a'.repeat(51))).toBe(false);
  });

  it('rejects dot-only strings (Firestore reserved IDs)', () => {
    expect(isValidWord('.')).toBe(false);
    expect(isValidWord('..')).toBe(false);
  });
});
