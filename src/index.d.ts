/** Built-in character sets. */
export declare const CHARSETS: {
  ALPHANUMERIC: string;
  BASE32: string;
  SLUG: string;
  HEX: string;
};

/** Default configuration values. */
export declare const DEFAULTS: {
  UUID_LENGTH: number;
  TIMESTAMP_LENGTH: number;
  RANDOM_LENGTH: number;
  SLUG_RANDOM_LENGTH: number;
  MIN_LENGTH: number;
  MAX_LENGTH: number;
};

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

export interface SlugOptions {
  /** Number of leading chars reserved for the timestamp. Default: 10 */
  tsLength?: number;
  /** Number of random (suffix) chars. Default: 8 */
  randomLength?: number;
  /** Character set to use. Default: CHARSETS.SLUG */
  charset?: string;
  /** Separator between timestamp and random parts. Default: '-' */
  separator?: string;
}

export interface ValidateOptions {
  /** Expected character set. Default: CHARSETS.BASE32 */
  charset?: string;
  /** Expected total length (optional). */
  length?: number;
  /** Expected separator used during generation. Default: '' */
  separator?: string;
  /** Expected timestamp prefix length. Default: 10 */
  tsLength?: number;
  /** Maximum age in milliseconds; older IDs will be rejected (optional). */
  maxAgeMs?: number;
  /** Tolerated future clock skew in milliseconds. Default: 5000 */
  clockSkewMs?: number;
}

export interface ValidationResult {
  /** Whether the ID passed all checks. */
  valid: boolean;
  /** List of validation failure reasons (empty when valid). */
  errors: string[];
  /** Timestamp embedded in the ID, or null if extraction failed. */
  timestamp: Date | null;
}

/**
 * Generate a time-based, cryptographically random, lexicographically sortable ID.
 *
 * @example
 * import { generate, CHARSETS } from 'genauid';
 * const id = generate();
 * const id = generate({ length: 32, charset: CHARSETS.ALPHANUMERIC });
 */
export declare function generate(options?: GenerateOptions): string;

/**
 * Generate a human-readable, time-based, sortable slug.
 *
 * @example
 * import { generateSlug } from 'genauid';
 * const slug = generateSlug();                        // '01j3rvmq8z-k4xntbpd'
 * const slug = generateSlug({ separator: '_', randomLength: 12 });
 */
export declare function generateSlug(options?: SlugOptions): string;

/**
 * Validate a previously generated ID.
 *
 * @example
 * import { validate } from 'genauid';
 * const result = validate(id);
 * if (!result.valid) console.error(result.errors);
 */
export declare function validate(id: string, options?: ValidateOptions): ValidationResult;

/**
 * Decode the embedded timestamp from an ID string.
 *
 * @param encoded - The prefix of the ID that encodes the timestamp.
 * @param charset - The character set used during generation.
 */
export declare function decodeTimestamp(encoded: string, charset: string): bigint;
