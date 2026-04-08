// index.test.js — tests for the main index.js module of genauid
'use strict';

const genauid = require('../src/index');

describe('index re-exports', () => {
  test('exports generate function', () => {
    expect(typeof genauid.generate).toBe('function');
  });

  test('exports generateSlug function', () => {
    expect(typeof genauid.generateSlug).toBe('function');
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

  test('end-to-end: generateSlug → validate round-trip', () => {
    const slug = genauid.generateSlug();
    const result = genauid.validate(slug, {
      charset: genauid.CHARSETS.SLUG,
      separator: '-',
      tsLength: 10,
    });
    expect(result.valid).toBe(true);
  });
});
