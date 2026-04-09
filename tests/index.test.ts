// index.test.ts — tests for the main index.ts module of genauid

import * as genauid from '../src/index';

describe('index re-exports', () => {
  test('exports generate function', () => {
    expect(typeof genauid.generate).toBe('function');
  });

  test('exports slugify function', () => {
    expect(typeof genauid.slugify).toBe('function');
  });

  test('exports validate function', () => {
    expect(typeof genauid.validate).toBe('function');
  });

  test('exports decodeTimestamp function', () => {
    expect(typeof genauid.decodeTimestamp).toBe('function');
  });

  test('exports CHARSETS object with expected keys', () => {
    expect(genauid.CHARSETS).toHaveProperty('ALPHANUMERIC');
    expect(genauid.CHARSETS).toHaveProperty('BASE32');
    expect(genauid.CHARSETS).toHaveProperty('SLUG');
    expect(genauid.CHARSETS).toHaveProperty('HEX');
  });

  test('exports CHARSET alias identical to CHARSETS', () => {
    expect(genauid.CHARSET).toBe(genauid.CHARSETS);
  });

  test('exports DEFAULTS object with expected keys', () => {
    expect(genauid.DEFAULTS).toHaveProperty('UUID_LENGTH');
    expect(genauid.DEFAULTS).toHaveProperty('TIMESTAMP_LENGTH');
    expect(genauid.DEFAULTS).toHaveProperty('MIN_LENGTH');
    expect(genauid.DEFAULTS).toHaveProperty('MAX_LENGTH');
  });

  test('end-to-end: generate → validate round-trip', () => {
    const id = genauid.generate();
    const result = genauid.validate(id);
    expect(result.valid).toBe(true);
  });

  test('end-to-end: slugify with timestamp suffix → contains slug charset chars', () => {
    const slug = genauid.slugify('Hello World', { suffix: 'timestamp' });
    expect(typeof slug).toBe('string');
    expect(slug).toContain('hello');
    expect(slug).toContain('world');
    const allowed = new Set([...genauid.CHARSETS.SLUG, '-']);
    for (const char of slug) {
      expect(allowed.has(char)).toBe(true);
    }
  });
});
