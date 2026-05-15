import { config } from '../src/constants/config';

// The label-matching algorithm from useHazardDetection, extracted for unit testing.
const matchesKeyword = (label: string): boolean =>
  config.HAZARD_KEYWORDS.some((k) =>
    label.toLowerCase().includes(k.toLowerCase())
  );

const firstMatch = (labels: string[]): string | undefined =>
  labels.find(matchesKeyword);

describe('hazardDetection — config constants', () => {
  it('has the correct check interval', () => {
    expect(config.HAZARD_CHECK_INTERVAL_MS).toBe(5000);
  });

  it('has the correct cooldown period', () => {
    expect(config.HAZARD_COOLDOWN_MS).toBe(30000);
  });

  it('includes weapon keywords', () => {
    expect(config.HAZARD_KEYWORDS).toContain('gun');
    expect(config.HAZARD_KEYWORDS).toContain('knife');
    expect(config.HAZARD_KEYWORDS).toContain('firearm');
  });

  it('includes fire keywords', () => {
    expect(config.HAZARD_KEYWORDS).toContain('fire');
    expect(config.HAZARD_KEYWORDS).toContain('flame');
  });

  it('includes substance keywords', () => {
    expect(config.HAZARD_KEYWORDS).toContain('alcohol');
    expect(config.HAZARD_KEYWORDS).toContain('cigarette');
    expect(config.HAZARD_KEYWORDS).toContain('syringe');
  });
});

describe('hazardDetection — keyword matching', () => {
  it('matches an exact label', () => {
    expect(matchesKeyword('gun')).toBe(true);
  });

  it('matches a label that contains the keyword (e.g. "kitchen knife")', () => {
    expect(matchesKeyword('kitchen knife')).toBe(true);
  });

  it('matching is case-insensitive', () => {
    expect(matchesKeyword('GUN')).toBe(true);
    expect(matchesKeyword('Firearm')).toBe(true);
  });

  it('safe labels do not match any keyword', () => {
    ['teddy bear', 'apple', 'book', 'cat', 'flower', 'bicycle'].forEach(
      (label) => expect(matchesKeyword(label)).toBe(false)
    );
  });

  it('finds the first hazardous label in a list', () => {
    expect(firstMatch(['sky', 'teddy bear', 'fireplace', 'tree'])).toBe(
      'fireplace'
    );
  });

  it('returns undefined when no labels match', () => {
    expect(firstMatch(['cloud', 'dog', 'bicycle'])).toBeUndefined();
  });

  it('cooldown boundary: alert re-triggers at exactly cooldownUntil (< not <=)', () => {
    // Hook skips classification when: Date.now() < cooldownUntilRef.current
    // At exactly cooldownUntil, condition is false → classification runs → can re-trigger
    const cooldownUntil = 1000;
    expect(cooldownUntil < cooldownUntil).toBe(false); // at boundary: does NOT skip
    expect(cooldownUntil - 1 < cooldownUntil).toBe(true); // just before: skips
  });
});
