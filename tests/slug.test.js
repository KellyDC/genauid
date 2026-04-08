// slug.test.js — tests for slugify() in slug.js
'use strict';

const { slugify, normaliseSlugOptions, CHARSETS } = require('../src/slug');

describe('slugify() — plain output (suffix: none)', () => {
  test('returns a lowercase slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  test('removes accents and diacritics', () => {
    expect(slugify('Café au lait')).toBe('cafe-au-lait');
    expect(slugify('Ñoño')).toBe('nono');
  });

  test('collapses multiple separators', () => {
    expect(slugify('foo   bar')).toBe('foo-bar');
  });

  test('trims leading and trailing separators', () => {
    expect(slugify('  hello  ')).toBe('hello');
    expect(slugify('!hello!')).toBe('hello');
  });

  test('returns an empty string for all-invalid input', () => {
    expect(slugify('!!!')).toBe('');
  });

  test('respects custom separator', () => {
    expect(slugify('Café au lait', { separator: '_' })).toBe('cafe_au_lait');
  });

  test('respects custom charset', () => {
    const result = slugify('Hello World', { charset: CHARSETS.ALPHANUMERIC, separator: '-' });
    const allowed = new Set([...CHARSETS.ALPHANUMERIC, '-']);
    for (const char of result) {
      expect(allowed.has(char)).toBe(true);
    }
  });

  test('only contains SLUG charset characters', () => {
    const allowed = new Set([...CHARSETS.SLUG, '-']);
    const result = slugify('The Quick Brown Fox!');
    for (const char of result) {
      expect(allowed.has(char)).toBe(true);
    }
  });
});

describe('slugify() — suffix: random', () => {
  test('appends a random suffix separated by the separator', () => {
    const result = slugify('Hello World', { suffix: 'random' });
    const parts = result.split('-');
    expect(parts.length).toBe(3); // hello, world, <random>
    expect(parts[2].length).toBe(8); // default randomLength
  });

  test('respects custom randomLength', () => {
    const result = slugify('hello', { suffix: 'random', randomLength: 12 });
    const parts = result.split('-');
    expect(parts[parts.length - 1].length).toBe(12);
  });

  test('produces unique outputs on repeated calls', () => {
    const results = new Set(
      Array.from({ length: 500 }, () => slugify('hello', { suffix: 'random' }))
    );
    expect(results.size).toBe(500);
  });

  test('still works when slug body is empty (all-invalid input)', () => {
    const result = slugify('!!!', { suffix: 'random' });
    expect(result.length).toBe(8);
    expect(result).not.toContain('-');
  });
});

describe('slugify() — suffix: timestamp', () => {
  test('appends timestamp and random parts', () => {
    const result = slugify('Hello World', { suffix: 'timestamp' });
    // structure: hello-world-<ts>-<rand>
    const parts = result.split('-');
    expect(parts.length).toBe(4);
    expect(parts[2].length).toBe(10); // default tsLength
    expect(parts[3].length).toBe(8); // default randomLength
  });

  test('respects custom tsLength and randomLength', () => {
    const result = slugify('hello', { suffix: 'timestamp', tsLength: 6, randomLength: 4 });
    const parts = result.split('-');
    expect(parts[parts.length - 2].length).toBe(6);
    expect(parts[parts.length - 1].length).toBe(4);
  });

  test('produces unique outputs on repeated calls', () => {
    const results = new Set(
      Array.from({ length: 500 }, () => slugify('hello', { suffix: 'timestamp' }))
    );
    expect(results.size).toBe(500);
  });

  test('timestamp slugs are lexicographically sortable', (done) => {
    const a = slugify('hello', { suffix: 'timestamp' });
    setTimeout(() => {
      const b = slugify('hello', { suffix: 'timestamp' });
      expect(b >= a).toBe(true);
      done();
    }, 2);
  });

  test('still works when slug body is empty', () => {
    const result = slugify('!!!', { suffix: 'timestamp' });
    const parts = result.split('-');
    expect(parts.length).toBe(2);
    expect(parts[0].length).toBe(10);
    expect(parts[1].length).toBe(8);
  });
});

describe('slugify() — option validation', () => {
  test('throws TypeError for charset with duplicates', () => {
    expect(() => slugify('hello', { charset: 'aabcd' })).toThrow(TypeError);
  });

  test('throws TypeError for charset shorter than 2 chars', () => {
    expect(() => slugify('hello', { charset: 'x' })).toThrow(TypeError);
  });

  test('throws TypeError for non-string charset', () => {
    expect(() => slugify('hello', { charset: 123 })).toThrow(TypeError);
  });

  test('throws TypeError for invalid suffix value', () => {
    expect(() => slugify('hello', { suffix: 'fancy' })).toThrow(TypeError);
  });

  test('throws RangeError for tsLength < 1', () => {
    expect(() => slugify('hello', { suffix: 'timestamp', tsLength: 0 })).toThrow(RangeError);
  });

  test('throws RangeError for randomLength < 1', () => {
    expect(() => slugify('hello', { suffix: 'random', randomLength: 0 })).toThrow(RangeError);
  });
});

describe('slugify() — empty separator', () => {
  test('produces a dense plain slug with no separator', () => {
    expect(slugify('Hello World', { separator: '' })).toBe('helloworld');
  });

  test('does not collapse or trim when separator is empty', () => {
    // All invalid chars are removed (replaced with ''), no trimming needed
    expect(slugify('  hello  ', { separator: '' })).toBe('hello');
    expect(slugify('foo!!!bar', { separator: '' })).toBe('foobar');
  });

  test('suffix: random with empty separator concatenates directly', () => {
    const result = slugify('hello', { suffix: 'random', separator: '', randomLength: 6 });
    // 'hello' + '' + 6 random chars = 11 chars, all from SLUG charset
    expect(result.length).toBe(11);
    const allowed = new Set(CHARSETS.SLUG);
    for (const char of result) expect(allowed.has(char)).toBe(true);
  });

  test('suffix: random with empty separator and empty body returns just random', () => {
    const result = slugify('!!!', { suffix: 'random', separator: '', randomLength: 8 });
    expect(result.length).toBe(8);
  });

  test('suffix: timestamp with empty separator produces dense output', () => {
    const result = slugify('hi', {
      suffix: 'timestamp',
      separator: '',
      tsLength: 6,
      randomLength: 4,
    });
    // 'hi' + 6 ts chars + 4 rand chars = 12 chars
    expect(result.length).toBe(12);
    const allowed = new Set(CHARSETS.SLUG);
    for (const char of result) expect(allowed.has(char)).toBe(true);
  });

  test('suffix: timestamp with empty separator and empty body returns ts+rand', () => {
    const result = slugify('!!!', {
      suffix: 'timestamp',
      separator: '',
      tsLength: 6,
      randomLength: 4,
    });
    expect(result.length).toBe(10); // 6 ts + 4 rand
  });
});

describe('normaliseSlugOptions() — direct validation', () => {
  test('returns defaults when called with no arguments', () => {
    const opts = normaliseSlugOptions();
    expect(opts.separator).toBe('-');
    expect(opts.suffix).toBe('none');
    expect(opts.tsLength).toBe(10);
    expect(opts.randomLength).toBe(8);
    expect(opts.charset).toBe(CHARSETS.SLUG);
  });

  test('floors fractional tsLength and randomLength', () => {
    const opts = normaliseSlugOptions({ tsLength: 7.9, randomLength: 5.1 });
    expect(opts.tsLength).toBe(7);
    expect(opts.randomLength).toBe(5);
  });

  test('stringifies numeric separator', () => {
    const opts = normaliseSlugOptions({ separator: 0 });
    expect(opts.separator).toBe('0');
  });
});

describe('slugify() — performance', () => {
  test('generates 10,000 plain slugs in under 1 second', () => {
    const start = Date.now();
    for (let i = 0; i < 10_000; i++) slugify('Hello World Example');
    expect(Date.now() - start).toBeLessThan(1000);
  });

  test('10,000 random-suffix slugs are all unique', () => {
    const results = new Set(
      Array.from({ length: 10_000 }, () => slugify('hello', { suffix: 'random' }))
    );
    expect(results.size).toBe(10_000);
  });
});
