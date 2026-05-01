import { CHARSETS, DEFAULTS } from './constants';
import { randomString, encodeTimestamp } from './utils';

export interface GenerateOptions {
  /** Total length of the generated ID. Default: 26 */
  length?: number;
  /** Number of leading chars reserved for the timestamp. Default: 10 */
  tsLength?: number;
  /** Character set to use. Default: CHARSETS.BASE32 */
  charset?: string;
  /** Optional separator between timestamp and random parts. Default: '' */
  separator?: string;
}

interface NormalisedGenerateOptions {
  totalLength: number;
  tsLength: number;
  randomLength: number;
  charset: string;
  separator: string;
}

/**
 * Validate and normalise options for generate().
 */
function normaliseOptions(opts: GenerateOptions = {}): NormalisedGenerateOptions {
  const charset = opts.charset !== undefined ? opts.charset : CHARSETS.BASE32;

  if (typeof charset !== 'string' || charset.length < 2) {
    throw new TypeError('charset must be a string with at least 2 characters');
  }

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
 * chronological order. The remaining characters are cryptographically random.
 *
 * @param options - Generation options.
 * @returns The generated ID.
 *
 * @example
 * const id = generate();            // '01J3RVMQ8Z4KXNTBPD6S7WHMF'
 * const id = generate({ length: 32, charset: CHARSETS.ALPHANUMERIC });
 */
export function generate(options: GenerateOptions = {}): string {
  const { tsLength, randomLength, charset, separator } = normaliseOptions(options);

  const ts = BigInt(Date.now());
  const tsPart = encodeTimestamp(ts, tsLength, charset);
  const randPart = randomString(randomLength, charset);

  return tsPart + separator + randPart;
}

/**
 * Generate a UUID version 7 (RFC 9562).
 *
 * UUIDv7 encodes a 48-bit Unix timestamp (milliseconds) in the most
 * significant bits, followed by version/variant markers and 74 bits of
 * cryptographically random data, making it both time-sortable and globally
 * unique.
 *
 * @returns A UUID v7 string in the canonical `xxxxxxxx-xxxx-7xxx-yxxx-xxxxxxxxxxxx` format.
 *
 * @example
 * const id = generateUUID7(); // '019040c8-e1a3-7b2e-8f1d-3a2b5c6d7e8f'
 */
export function generateUUID7(): string {
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));

  // Overwrite the first 48 bits with the current Unix timestamp in ms.
  const ts = BigInt(Date.now());
  bytes[0] = Number((ts >> 40n) & 0xffn);
  bytes[1] = Number((ts >> 32n) & 0xffn);
  bytes[2] = Number((ts >> 24n) & 0xffn);
  bytes[3] = Number((ts >> 16n) & 0xffn);
  bytes[4] = Number((ts >> 8n) & 0xffn);
  bytes[5] = Number(ts & 0xffn);

  // Set version to 7 in the top nibble of byte 6 (bits 48–51).
  bytes[6] = (bytes[6]! & 0x0f) | 0x70;

  // Set RFC 4122 variant to 0b10xx in the top two bits of byte 8 (bits 64–65).
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
