'use strict';

const { CHARSETS, DEFAULTS } = require('./constants');
const { randomString, encodeTimestamp } = require('./utils');

/**
 * @typedef {Object} SlugOptions
 * @property {number}  [tsLength=10]      - Chars for the timestamp prefix.
 * @property {number}  [randomLength=8]   - Chars for the random suffix.
 * @property {string}  [charset]          - Character set (defaults to SLUG).
 * @property {string}  [separator='-']    - Separator between timestamp and random parts.
 */

/**
 * Validate and normalise options for generateSlug().
 *
 * @param {SlugOptions} opts
 * @returns {{ tsLength: number, randomLength: number, charset: string, separator: string }}
 */
function normaliseSlugOptions(opts = {}) {
  const charset = opts.charset !== undefined ? opts.charset : CHARSETS.SLUG;

  if (typeof charset !== 'string' || charset.length < 2) {
    throw new TypeError('charset must be a string with at least 2 characters');
  }

  const unique = [...new Set(charset)];
  if (unique.length !== charset.length) {
    throw new TypeError('charset must not contain duplicate characters');
  }

  const separator = opts.separator !== undefined ? String(opts.separator) : '-';

  const tsLength =
    opts.tsLength !== undefined ? Math.floor(opts.tsLength) : DEFAULTS.TIMESTAMP_LENGTH;

  if (tsLength < 1) {
    throw new RangeError('tsLength must be at least 1');
  }

  const randomLength =
    opts.randomLength !== undefined ? Math.floor(opts.randomLength) : DEFAULTS.SLUG_RANDOM_LENGTH;

  if (randomLength < 1) {
    throw new RangeError('randomLength must be at least 1');
  }

  const totalLength = tsLength + separator.length + randomLength;
  if (totalLength > DEFAULTS.MAX_LENGTH) {
    throw new RangeError(
      `Combined length (${totalLength}) exceeds maximum of ${DEFAULTS.MAX_LENGTH}`
    );
  }

  return { tsLength, randomLength, charset, separator };
}

/**
 * Generate a human-readable, time-based, sortable slug.
 *
 * The slug is composed of a timestamp prefix (chronologically sortable) and a
 * random suffix separated by a configurable separator.  By default the output
 * looks like: `01j3rvmq8z-k4xntbpd`.
 *
 * @param {SlugOptions} [options={}]
 * @returns {string} The generated slug.
 *
 * @example
 * const slug = generateSlug();                        // '01j3rvmq8z-k4xntbpd'
 * const slug = generateSlug({ separator: '_', randomLength: 12 });
 */
function generateSlug(options = {}) {
  const { tsLength, randomLength, charset, separator } = normaliseSlugOptions(options);

  const ts = BigInt(Date.now());
  const tsPart = encodeTimestamp(ts, tsLength, charset);
  const randPart = randomString(randomLength, charset);

  return tsPart + separator + randPart;
}

module.exports = { generateSlug, normaliseSlugOptions, CHARSETS };
