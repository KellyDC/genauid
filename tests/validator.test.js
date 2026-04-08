// validator.test.js — tests for the validate() function in validator.js
'use strict';

const { validate, decodeTimestamp } = require('../src/validator');
const { generate } = require('../src/generator');
const { slugify } = require('../src/slug');
const { CHARSETS } = require('../src/constants');

describe('validate() — valid IDs', () => {
  test('accepts a freshly generated ID with default options', () => {
    const id = generate();
    const result = validate(id);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.timestamp).toBeInstanceOf(Date);
  });

  test('embedded timestamp is close to now', () => {
    const before = Date.now();
    const id = generate();
    const result = validate(id);
    expect(result.timestamp.getTime()).toBeGreaterThanOrEqual(before - 5);
    expect(result.timestamp.getTime()).toBeLessThanOrEqual(Date.now() + 10);
  });

  test('accepts ID generated with ALPHANUMERIC charset', () => {
    const id = generate({ charset: CHARSETS.ALPHANUMERIC, length: 30 });
    const result = validate(id, { charset: CHARSETS.ALPHANUMERIC, length: 30 });
    expect(result.valid).toBe(true);
  });

  test('accepts ID generated with custom separator', () => {
    const id = generate({ tsLength: 10, length: 27, separator: '-' });
    const result = validate(id, { separator: '-', tsLength: 10 });
    expect(result.valid).toBe(true);
  });

  test('accepts slug generated with slugify() timestamp suffix (no text body)', () => {
    // When the input produces an empty slug body (all-invalid chars), slugify()
    // returns <timestamp><sep><random> — the same structure the validator expects.
    const slug = slugify('!!!', { suffix: 'timestamp' });
    const result = validate(slug, {
      charset: CHARSETS.SLUG,
      separator: '-',
      tsLength: 10,
    });
    expect(result.valid).toBe(true);
  });
});

describe('validate() — invalid inputs', () => {
  test('rejects empty string', () => {
    const result = validate('');
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/non-empty string/);
  });

  test('rejects non-string input', () => {
    expect(validate(null).valid).toBe(false);
    expect(validate(123).valid).toBe(false);
    expect(validate(undefined).valid).toBe(false);
  });

  test('rejects string shorter than MIN_LENGTH', () => {
    const result = validate('SHORT');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /too short/i.test(e))).toBe(true);
  });

  test('rejects ID with wrong length when length is specified', () => {
    const id = generate({ length: 26 });
    const result = validate(id, { length: 30 });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /length/i.test(e))).toBe(true);
  });

  test('rejects ID containing characters outside the charset', () => {
    const id = generate({ charset: CHARSETS.BASE32 });
    const tampered = id.slice(0, -1) + '!';
    const result = validate(tampered, { charset: CHARSETS.BASE32, length: tampered.length });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /charset/i.test(e))).toBe(true);
  });

  test('rejects ID with a far-future timestamp', () => {
    // Manually craft an ID whose timestamp encodes a date 10 years in the future.
    const { encodeTimestamp } = require('../src/utils');
    const futureMs = BigInt(Date.now() + 10 * 365 * 24 * 3600 * 1000); // ~10 years ahead
    const charset = CHARSETS.BASE32;
    const { randomString } = require('../src/utils');
    const tsPart = encodeTimestamp(futureMs, 10, charset);
    const randPart = randomString(16, charset);
    const fakeId = tsPart + randPart;
    const result = validate(fakeId, { clockSkewMs: 0 });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /future/i.test(e))).toBe(true);
  });

  test('rejects ID with a timestamp before year 2000', () => {
    const { encodeTimestamp } = require('../src/utils');
    const oldMs = BigInt(0); // Unix epoch, 1970
    const charset = CHARSETS.BASE32;
    const { randomString } = require('../src/utils');
    const tsPart = encodeTimestamp(oldMs, 10, charset);
    const randPart = randomString(16, charset);
    const fakeId = tsPart + randPart;
    const result = validate(fakeId, { length: 26 });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /2000/i.test(e))).toBe(true);
  });
});

describe('validate() — maxAgeMs option', () => {
  test('rejects an expired ID when maxAgeMs is specified', (done) => {
    const id = generate();
    setTimeout(() => {
      const result = validate(id, { maxAgeMs: 1 }); // 1 ms — already expired
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => /expired/i.test(e))).toBe(true);
      done();
    }, 10);
  });

  test('accepts a fresh ID when maxAgeMs is generous', () => {
    const id = generate();
    const result = validate(id, { maxAgeMs: 60_000 }); // 1 minute
    expect(result.valid).toBe(true);
  });

  test('rejects NaN maxAgeMs', () => {
    const id = generate();
    const result = validate(id, { maxAgeMs: NaN });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /maxAgeMs/i.test(e))).toBe(true);
  });

  test('rejects zero maxAgeMs', () => {
    const id = generate();
    const result = validate(id, { maxAgeMs: 0 });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /maxAgeMs/i.test(e))).toBe(true);
  });

  test('rejects Infinity maxAgeMs', () => {
    const id = generate();
    const result = validate(id, { maxAgeMs: Infinity });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /maxAgeMs/i.test(e))).toBe(true);
  });

  test('rejects NaN clockSkewMs', () => {
    const id = generate();
    const result = validate(id, { clockSkewMs: NaN });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /clockSkewMs/i.test(e))).toBe(true);
  });

  test('rejects negative clockSkewMs', () => {
    const id = generate();
    const result = validate(id, { clockSkewMs: -1 });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /clockSkewMs/i.test(e))).toBe(true);
  });
});

describe('decodeTimestamp()', () => {
  test('round-trips through encode → decode', () => {
    const { encodeTimestamp } = require('../src/utils');
    const ts = BigInt(Date.now());
    const encoded = encodeTimestamp(ts, 10, CHARSETS.BASE32);
    const decoded = decodeTimestamp(encoded, CHARSETS.BASE32);
    expect(decoded).toBe(ts);
  });

  test('throws for characters not in charset', () => {
    expect(() => decodeTimestamp('!!!!!', CHARSETS.BASE32)).toThrow();
  });
});
