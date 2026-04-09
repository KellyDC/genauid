/**
 * Generate cryptographically secure random bytes and map them into a given
 * character set without modulo bias.
 *
 * Uses `globalThis.crypto.getRandomValues` so it works in any environment:
 * Node.js 15+, browsers, Deno, Bun, Cloudflare Workers, etc.
 *
 * @param length - Number of characters to produce.
 * @param charset - The character set to draw from.
 * @returns Random string of the requested length.
 */
export function randomString(length: number, charset: string): string {
  if (length <= 0) return '';

  const charsetLen = charset.length;
  // Calculate the largest multiple of charsetLen that fits in a byte (0–255)
  // to avoid modulo bias.
  const maxUnbiasedByte = Math.floor(256 / charsetLen) * charsetLen;

  let result = '';
  // Over-sample to minimise the number of crypto calls needed.
  let bufSize = Math.ceil(length * 1.3) + 8;

  while (result.length < length) {
    const buf = globalThis.crypto.getRandomValues(new Uint8Array(bufSize));
    for (let i = 0; i < buf.length && result.length < length; i++) {
      // eslint-disable-next-line security/detect-object-injection -- buf is a Uint8Array; i is a bounded numeric index
      const byte = buf[i]!;
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
 * @param timestamp - Millisecond timestamp as a BigInt.
 * @param width - Number of characters to produce.
 * @param charset - Character set (must be ordered, e.g. sorted ASCII).
 * @returns Fixed-width encoded timestamp, zero-padded on the left.
 */
export function encodeTimestamp(timestamp: bigint, width: number, charset: string): string {
  const base = BigInt(charset.length);
  let ts = BigInt(timestamp);
  let encoded = '';

  for (let i = 0; i < width; i++) {
    encoded = charset[Number(ts % base)]! + encoded;
    ts = ts / base;
  }

  return encoded;
}

/**
 * Constant-time string comparison to prevent timing attacks when comparing
 * ID strings. Implemented manually to work in all environments.
 *
 * @param a
 * @param b
 * @returns Whether `a` and `b` are equal.
 */
export function safeStringEqual(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
