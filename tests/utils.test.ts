// utils.test.ts — tests for the utility functions in utils.ts

import { randomString, encodeTimestamp, safeStringEqual } from '../src/utils';

describe('randomString()', () => {
  test('returns empty string for length 0', () => {
    expect(randomString(0, 'abc')).toBe('');
  });

  test('returns a string of the requested length', () => {
    const charset = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
    for (const len of [1, 10, 26, 64, 128]) {
      expect(randomString(len, charset).length).toBe(len);
    }
  });

  test('only contains characters from the given charset', () => {
    const charset = 'abc123';
    const result = randomString(200, charset);
    for (const char of result) {
      expect(charset).toContain(char);
    }
  });

  test('produces distinct outputs on repeated calls', () => {
    const charset = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
    const a = randomString(26, charset);
    const b = randomString(26, charset);
    // With 32^26 possible values the probability of a collision is negligible.
    expect(a).not.toBe(b);
  });

  test('works with a two-character charset', () => {
    const result = randomString(20, '01');
    expect(result.length).toBe(20);
    expect(/^[01]+$/.test(result)).toBe(true);
  });
});

describe('encodeTimestamp()', () => {
  const charset = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

  test('encodes and produces a string of the requested width', () => {
    const encoded = encodeTimestamp(BigInt(Date.now()), 10, charset);
    expect(encoded.length).toBe(10);
  });

  test('only contains characters from the charset', () => {
    const set = new Set(charset);
    const encoded = encodeTimestamp(BigInt(Date.now()), 10, charset);
    for (const char of encoded) {
      expect(set.has(char)).toBe(true);
    }
  });

  test('later timestamp encodes to lexicographically larger string (sortability)', () => {
    const t1 = BigInt(1700000000000);
    const t2 = BigInt(1700000000001);
    const e1 = encodeTimestamp(t1, 10, charset);
    const e2 = encodeTimestamp(t2, 10, charset);
    expect(e2 > e1).toBe(true);
  });

  test('encodes 0 as all-first-char', () => {
    const encoded = encodeTimestamp(0n, 5, charset);
    expect(encoded).toBe('00000');
  });
});

describe('safeStringEqual()', () => {
  test('returns true for identical strings', () => {
    expect(safeStringEqual('hello', 'hello')).toBe(true);
  });

  test('returns false for different strings of same length', () => {
    expect(safeStringEqual('hello', 'hellx')).toBe(false);
  });

  test('returns false for strings of different lengths', () => {
    expect(safeStringEqual('hello', 'helloo')).toBe(false);
  });

  test('returns false for non-string inputs', () => {
    expect(safeStringEqual(null as unknown as string, 'hello')).toBe(false);
    expect(safeStringEqual('hello', undefined as unknown as string)).toBe(false);
  });
});
