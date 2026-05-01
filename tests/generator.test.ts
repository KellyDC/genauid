// generator.test.ts — tests for the generate() function in generator.ts

import { generate, generateUUID7 } from '../src/generator';
import { CHARSETS } from '../src/constants';
import { DEFAULTS } from '../src/constants';

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
    expect(Date.now() - start).toBeLessThan(1000);
  });
});

// UUID7_REGEX: canonical xxxxxxxx-xxxx-7xxx-yxxx-xxxxxxxxxxxx
const UUID7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('generateUUID7()', () => {
  test('returns a string in canonical UUID format', () => {
    const id = generateUUID7();
    expect(typeof id).toBe('string');
    expect(id.length).toBe(36);
  });

  test('matches the UUIDv7 pattern (version nibble = 7, variant = 8/9/a/b)', () => {
    for (let i = 0; i < 100; i++) {
      expect(generateUUID7()).toMatch(UUID7_REGEX);
    }
  });

  test('embeds the current timestamp in the first 48 bits', () => {
    const before = Date.now();
    const id = generateUUID7();
    const after = Date.now();

    // Reconstruct the 48-bit ms timestamp from the first two UUID segments.
    const hex = id.replace(/-/g, '').slice(0, 12);
    const ts = parseInt(hex, 16);

    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });

  test('produces unique IDs on repeated calls', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => generateUUID7()));
    expect(ids.size).toBe(1000);
  });

  test('IDs are lexicographically sortable by generation time', (done) => {
    const a = generateUUID7();
    setTimeout(() => {
      const b = generateUUID7();
      expect(b >= a).toBe(true);
      done();
    }, 2);
  });

  test('generates 10,000 UUIDs in under 1 second', () => {
    const start = Date.now();
    for (let i = 0; i < 10_000; i++) generateUUID7();
    expect(Date.now() - start).toBeLessThan(1000);
  });
});
