// slug.test.js — tests for the generateSlug() function in slug.js
'use strict';

const { generateSlug, CHARSETS } = require('../src/slug');
const { DEFAULTS } = require('../src/constants');

describe('generateSlug() — defaults', () => {
  test('returns a string with the default separator', () => {
    const slug = generateSlug();
    expect(typeof slug).toBe('string');
    expect(slug).toContain('-');
  });

  test('has correct default structure: tsLength + "-" + randomLength', () => {
    const slug = generateSlug();
    const parts = slug.split('-');
    expect(parts.length).toBe(2);
    expect(parts[0].length).toBe(DEFAULTS.TIMESTAMP_LENGTH);
    expect(parts[1].length).toBe(DEFAULTS.SLUG_RANDOM_LENGTH);
  });

  test('only contains SLUG charset characters (ignoring separator)', () => {
    const charset = new Set(CHARSETS.SLUG);
    const slug = generateSlug();
    for (const char of slug.replace(/-/g, '')) {
      expect(charset.has(char)).toBe(true);
    }
  });

  test('produces unique slugs on repeated calls', () => {
    const slugs = new Set(Array.from({ length: 1000 }, () => generateSlug()));
    expect(slugs.size).toBe(1000);
  });

  test('slugs are lexicographically sortable by generation time', (done) => {
    const a = generateSlug();
    setTimeout(() => {
      const b = generateSlug();
      expect(b >= a).toBe(true);
      done();
    }, 2);
  });
});

describe('generateSlug() — custom options', () => {
  test('respects custom separator', () => {
    const slug = generateSlug({ separator: '_' });
    expect(slug).toContain('_');
    expect(slug).not.toContain('-');
  });

  test('respects custom tsLength', () => {
    const slug = generateSlug({ tsLength: 8, randomLength: 6 });
    const [ts, rand] = slug.split('-');
    expect(ts.length).toBe(8);
    expect(rand.length).toBe(6);
  });

  test('respects custom randomLength', () => {
    const slug = generateSlug({ randomLength: 12 });
    const [, rand] = slug.split('-');
    expect(rand.length).toBe(12);
  });

  test('respects custom charset', () => {
    const charset = CHARSETS.ALPHANUMERIC;
    const slug = generateSlug({ charset, separator: '_' });
    const set = new Set(charset);
    for (const char of slug.replace(/_/g, '')) {
      expect(set.has(char)).toBe(true);
    }
  });

  test('allows empty separator (dense slug)', () => {
    const slug = generateSlug({ separator: '', tsLength: 10, randomLength: 8 });
    expect(slug.length).toBe(18);
  });
});

describe('generateSlug() — validation of options', () => {
  test('throws TypeError for charset with duplicates', () => {
    expect(() => generateSlug({ charset: 'aabcd' })).toThrow(TypeError);
  });

  test('throws TypeError for charset shorter than 2 chars', () => {
    expect(() => generateSlug({ charset: 'x' })).toThrow(TypeError);
  });

  test('throws RangeError for tsLength < 1', () => {
    expect(() => generateSlug({ tsLength: 0 })).toThrow(RangeError);
  });

  test('throws RangeError for randomLength < 1', () => {
    expect(() => generateSlug({ randomLength: 0 })).toThrow(RangeError);
  });

  test('throws RangeError when combined length exceeds maximum', () => {
    expect(() => generateSlug({ tsLength: 100, randomLength: 100 })).toThrow(RangeError);
  });
});

describe('generateSlug() — performance', () => {
  test('generates 10,000 slugs in under 1 second', () => {
    const start = Date.now();
    for (let i = 0; i < 10_000; i++) generateSlug();
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(1000);
  });

  test('10,000 slugs are all unique', () => {
    const slugs = new Set(Array.from({ length: 10_000 }, () => generateSlug()));
    expect(slugs.size).toBe(10_000);
  });
});
