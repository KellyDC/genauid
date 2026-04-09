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
