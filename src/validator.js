'use strict';

const { CHARSETS, DEFAULTS } = require('./constants');

/**
 * @typedef {Object} ValidateOptions
 * @property {string}  [charset]      - Expected character set (defaults to BASE32).
 * @property {number}  [length]       - Expected total length. If omitted, only charset is checked.
 * @property {string}  [separator=''] - Expected separator used during generation.
 * @property {number}  [tsLength=10]  - Expected timestamp prefix length.
 * @property {number}  [maxAgeMs]     - If set, reject IDs whose embedded timestamp is older than this many milliseconds.
 * @property {number}  [clockSkewMs=5000] - Tolerated future clock skew in milliseconds.
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid         - Whether the ID passed all checks.
 * @property {string[]} errors       - List of validation failure reasons (empty when valid).
 * @property {Date|null} timestamp   - Extracted timestamp, or null if extraction failed.
 */

/**
 * Validate a generated ID.
 *
 * Performs the following checks:
 * 1. Input is a non-empty string.
 * 2. Length matches the expected length (when provided).
 * 3. All characters belong to the expected charset.
 * 4. The embedded timestamp is within a reasonable range (not in the distant
 *    future and not impossibly old).
 *
 * @param {string} id - The ID to validate.
 * @param {ValidateOptions} [options={}]
 * @returns {ValidationResult}
 */
function validate(id, options = {}) {
  const errors = [];

  // --- 1. Type check ---
  if (typeof id !== 'string' || id.length === 0) {
    return { valid: false, errors: ['ID must be a non-empty string'], timestamp: null };
  }

  const charset = options.charset !== undefined ? options.charset : CHARSETS.BASE32;
  const separator = options.separator !== undefined ? String(options.separator) : '';
  const tsLength =
    options.tsLength !== undefined ? Math.floor(options.tsLength) : DEFAULTS.TIMESTAMP_LENGTH;
  const clockSkewMs = options.clockSkewMs !== undefined ? Number(options.clockSkewMs) : 5000;

  if (!Number.isFinite(clockSkewMs) || clockSkewMs < 0) {
    return {
      valid: false,
      errors: ['clockSkewMs must be a non-negative finite number'],
      timestamp: null,
    };
  }

  if (options.maxAgeMs !== undefined) {
    const maxAgeMs = Number(options.maxAgeMs);
    if (!Number.isFinite(maxAgeMs) || maxAgeMs <= 0) {
      return {
        valid: false,
        errors: ['maxAgeMs must be a positive finite number'],
        timestamp: null,
      };
    }
  }

  // --- 2. Length check ---
  if (options.length !== undefined) {
    const expectedLength = Math.floor(options.length);
    if (id.length !== expectedLength) {
      errors.push(`Expected length ${expectedLength}, got ${id.length}`);
    }
  } else if (id.length < DEFAULTS.MIN_LENGTH) {
    errors.push(`ID is too short (minimum ${DEFAULTS.MIN_LENGTH} characters)`);
  }

  // --- 3. Character set check ---
  const charsetSet = new Set(charset);
  // Account for separator characters inside the ID.
  // eslint-disable-next-line security/detect-non-literal-regexp -- separator is sanitised by escapeRegex()
  const separatorRegex = separator.length > 0 ? new RegExp(escapeRegex(separator), 'g') : null;
  const idWithoutSeparator = separatorRegex ? id.replace(separatorRegex, '') : id;

  for (const char of idWithoutSeparator) {
    if (!charsetSet.has(char)) {
      errors.push(`Character '${char}' is not in the expected charset`);
      break; // Report only the first offending character.
    }
  }

  // --- 4. Timestamp range check ---
  let extractedTimestamp = null;
  try {
    // Extract the timestamp portion (before separator or first tsLength chars).
    const tsPart = separator.length > 0 ? id.split(separator)[0] : id.slice(0, tsLength);

    const ts = decodeTimestamp(tsPart, charset);
    extractedTimestamp = new Date(Number(ts));

    const now = Date.now();

    // Reject IDs from the far future (more than clockSkewMs ahead).
    if (Number(ts) > now + clockSkewMs) {
      errors.push('Timestamp is in the future');
    }

    // Reject impossibly old timestamps (before year 2000).
    const Y2K = 946684800000n; // 2000-01-01T00:00:00Z in ms
    if (ts < Y2K) {
      errors.push('Timestamp predates year 2000 — likely invalid');
    }

    // Optional max-age check.
    if (options.maxAgeMs !== undefined && Number(ts) < now - Number(options.maxAgeMs)) {
      errors.push(`ID has expired (older than ${options.maxAgeMs} ms)`);
    }
  } catch {
    errors.push('Failed to decode timestamp from ID');
  }

  return {
    valid: errors.length === 0,
    errors,
    timestamp: extractedTimestamp,
  };
}

/**
 * Decode a base-N encoded timestamp string back into a BigInt millisecond value.
 *
 * @param {string} encoded - The encoded timestamp string.
 * @param {string} charset - The character set used for encoding.
 * @returns {bigint}
 */
function decodeTimestamp(encoded, charset) {
  const base = BigInt(charset.length);
  let result = 0n;
  for (const char of encoded) {
    const idx = charset.indexOf(char);
    if (idx === -1) throw new Error(`Character '${char}' not found in charset`);
    result = result * base + BigInt(idx);
  }
  return result;
}

/**
 * Escape a string for safe use in a RegExp.
 *
 * @param {string} str
 * @returns {string}
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { validate, decodeTimestamp };
