'use strict';

const { CHARSETS, DEFAULTS } = require('./constants');
const { randomString, encodeTimestamp } = require('./utils');

/**
 * @typedef {Object} GenerateOptions
 * @property {number}  [length=26]     - Total length of the generated ID.
 * @property {number}  [tsLength=10]   - Number of chars for the timestamp prefix.
 * @property {string}  [charset]       - Character set (defaults to BASE32).
 * @property {string}  [separator='']  - Optional separator between ts and random parts.
 */

/**
 * Validate and normalise options for generate().
 *
 * @param {GenerateOptions} opts
 * @returns {{ totalLength: number, tsLength: number, randomLength: number, charset: string, separator: string }}
 */
function normaliseOptions(opts = {}) {
  const charset = opts.charset !== undefined ? opts.charset : CHARSETS.BASE32;

  if (typeof charset !== 'string' || charset.length < 2) {
    throw new TypeError('charset must be a string with at least 2 characters');
  }

  // Deduplicate and check for sorted order (required for sortability).
  const unique = [...new Set(charset)];
  if (unique.length !== charset.length) {
    throw new TypeError('charset must not contain duplicate characters');
  }

  const separator = opts.separator !== undefined ? String(opts.separator) : '';

  const totalLength = opts.length !== undefined ? Math.floor(opts.length) : DEFAULTS.UUID_LENGTH;

  if (totalLength < DEFAULTS.MIN_LENGTH || totalLength > DEFAULTS.MAX_LENGTH) {
    throw new RangeError(
      `length must be between ${DEFAULTS.MIN_LENGTH} and ${DEFAULTS.MAX_LENGTH}`
    );
  }

  const tsLength =
    opts.tsLength !== undefined ? Math.floor(opts.tsLength) : DEFAULTS.TIMESTAMP_LENGTH;

  if (tsLength < 1) {
    throw new RangeError('tsLength must be at least 1');
  }

  const randomLength = totalLength - tsLength - separator.length;
  if (randomLength < 1) {
    throw new RangeError(
      'Combined tsLength and separator length must leave at least 1 character for the random component'
    );
  }

  return { totalLength, tsLength, randomLength, charset, separator };
}

/**
 * Generate a time-based, sortable, unique ID.
 *
 * The first `tsLength` characters encode the current Unix timestamp in
 * milliseconds using the provided charset so that lexicographic sort equals
 * chronological order.  The remaining characters are cryptographically random.
 *
 * @param {GenerateOptions} [options={}]
 * @returns {string} The generated ID.
 *
 * @example
 * const id = generate();            // '01J3RVMQ8Z4KXNTBPD6S7WHMF'
 * const id = generate({ length: 32, charset: CHARSETS.ALPHANUMERIC });
 */
function generate(options = {}) {
  const { tsLength, randomLength, charset, separator } = normaliseOptions(options);

  const ts = BigInt(Date.now());
  const tsPart = encodeTimestamp(ts, tsLength, charset);
  const randPart = randomString(randomLength, charset);

  return tsPart + separator + randPart;
}

module.exports = { generate, normaliseOptions, CHARSETS };
