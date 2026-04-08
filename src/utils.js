'use strict';

const { randomBytes, timingSafeEqual } = require('crypto');

/**
 * Generate cryptographically secure random bytes and map them into a given
 * character set without modulo bias.
 *
 * @param {number} length - Number of characters to produce.
 * @param {string} charset - The character set to draw from.
 * @returns {string} Random string of the requested length.
 */
function randomString(length, charset) {
  if (length <= 0) return '';

  const charsetLen = charset.length;
  // Calculate the largest multiple of charsetLen that fits in a byte (0-255)
  // to avoid modulo bias.
  const maxUnbiasedByte = Math.floor(256 / charsetLen) * charsetLen;

  let result = '';
  // Over-sample to minimise the number of crypto calls needed.
  let bufSize = Math.ceil(length * 1.3) + 8;

  while (result.length < length) {
    const buf = randomBytes(bufSize);
    for (let i = 0; i < buf.length && result.length < length; i++) {
      // eslint-disable-next-line security/detect-object-injection -- buf is a Buffer; i is a bounded numeric index
      const byte = buf[i];
      if (byte < maxUnbiasedByte) {
        result += charset[byte % charsetLen];
      }
    }
    // If we still need more characters, increase buffer size.
    bufSize = Math.max(16, length - result.length + 8);
  }

  return result;
}

/**
 * Encode a BigInt timestamp into a fixed-width, lexicographically sortable
 * string using characters from the given charset.
 *
 * @param {bigint} timestamp - Millisecond timestamp as a BigInt.
 * @param {number} width - Number of characters to produce.
 * @param {string} charset - Character set (must be ordered, e.g. sorted ASCII).
 * @returns {string} Fixed-width encoded timestamp, zero-padded on the left.
 */
function encodeTimestamp(timestamp, width, charset) {
  const base = BigInt(charset.length);
  let ts = BigInt(timestamp);
  let encoded = '';

  for (let i = 0; i < width; i++) {
    encoded = charset[Number(ts % base)] + encoded;
    ts = ts / base;
  }

  return encoded;
}

/**
 * Constant-time string comparison to prevent timing attacks when comparing
 * UUID strings.
 *
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
function safeStringEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return timingSafeEqual(bufA, bufB);
}

module.exports = { randomString, encodeTimestamp, safeStringEqual };
