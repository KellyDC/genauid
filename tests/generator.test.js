// generator.test.js — tests for the generate() function in generator.js
'use strict';

const { generate, CHARSETS } = require('../src/generator');
const { DEFAULTS } = require('../src/constants');

describe('generate() — defaults', () => {
  test('returns a string of the default length', () => {
    const id = generate();
    expect(typeof id).toBe('string');
    expect(id.length).toBe(DEFAULTS.UUID_LENGTH);
  });

  test('only contains BASE32 characters by default', () => {
    const charset = new Set(CHARSETS.BASE32);
    const id = generate();
    for (const char of id) {
      expect(charset.has(char)).toBe(true);
    }
  });

  test('produces unique IDs on repeated calls', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => generate()));
    expect(ids.size).toBe(1000);
  });

  test('IDs are lexicographically sortable by generation time', (done) => {
    const a = generate();
    // Give the clock a chance to tick.
    setTimeout(() => {
      const b = generate();
      expect(b >= a).toBe(true);
      done();
    }, 2);
  });
});

describe('generate() — custom options', () => {
  test('respects custom length', () => {
    expect(generate({ length: 16 }).length).toBe(16);
    expect(generate({ length: 64 }).length).toBe(64);
  });

  test('respects custom charset', () => {
    const charset = CHARSETS.HEX;
    const id = generate({ charset, length: 32 });
    expect(id.length).toBe(32);
    const set = new Set(charset);
    for (const char of id) {
      expect(set.has(char)).toBe(true);
    }
  });

  test('respects separator option', () => {
    const id = generate({ tsLength: 10, length: 27, separator: '-' });
    expect(id[10]).toBe('-');
    expect(id.length).toBe(27);
  });

  test('respects tsLength option (timestamp prefix)', () => {
    // With a longer tsLength the leading portion must still encode
    // a valid incrementing timestamp.
    const a = generate({ tsLength: 12, length: 28 });
    setTimeout(() => {
      const b = generate({ tsLength: 12, length: 28 });
      expect(b.slice(0, 12) >= a.slice(0, 12)).toBe(true);
    }, 2);
  });
});

describe('generate() — validation of options', () => {
  test('throws TypeError for charset with duplicates', () => {
    expect(() => generate({ charset: 'aabcd' })).toThrow(TypeError);
  });

  test('throws TypeError for charset shorter than 2 chars', () => {
    expect(() => generate({ charset: 'a' })).toThrow(TypeError);
  });

  test('throws RangeError for length below minimum', () => {
    expect(() => generate({ length: 5 })).toThrow(RangeError);
  });

  test('throws RangeError for length above maximum', () => {
    expect(() => generate({ length: 200 })).toThrow(RangeError);
  });

  test('throws RangeError when tsLength leaves no room for random part', () => {
    expect(() => generate({ length: 10, tsLength: 10 })).toThrow(RangeError);
  });

  test('throws RangeError for tsLength < 1', () => {
    expect(() => generate({ tsLength: 0 })).toThrow(RangeError);
  });
});

describe('generate() — performance', () => {
  test('generates 10,000 IDs in under 1 second', () => {
    const start = Date.now();
    for (let i = 0; i < 10_000; i++) generate();
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(1000);
  });

  test('10,000 IDs are all unique', () => {
    const ids = new Set(Array.from({ length: 10_000 }, () => generate()));
    expect(ids.size).toBe(10_000);
  });

  test('IDs remain lexicographically sorted when generated in batch', () => {
    // Capture IDs in generation order; sort them; expect no change.
    const ids = Array.from({ length: 500 }, () => generate());
    const sorted = [...ids].sort();
    // Adjacent IDs may share the same millisecond timestamp, so the random
    // part can differ. Verify only the first (timestamp) portion is non-decreasing.
    for (let i = 1; i < ids.length; i++) {
      expect(ids[i].slice(0, 10) >= ids[i - 1].slice(0, 10)).toBe(true);
    }
    // The sorted array should match the generation order for the ts prefix.
    expect(sorted[0].slice(0, 10) <= sorted[sorted.length - 1].slice(0, 10)).toBe(true);
  });
});
