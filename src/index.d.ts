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

export type SuffixMode = 'none' | 'random' | 'timestamp';

export interface SlugOptions {
  /** Character set to use. Default: CHARSETS.SLUG */
  charset?: string;
  /** Separator between parts. Default: '-' */
  separator?: string;
  /**
   * Suffix mode for uniqueness:
   * - `'none'`      – plain slug, no suffix (default).
   * - `'random'`    – append a cryptographically random string.
   * - `'timestamp'` – append an encoded timestamp + random string.
   */
  suffix?: SuffixMode;
  /** Chars for the random part (suffix: 'random' or 'timestamp'). Default: 8 */
  randomLength?: number;
  /** Chars for the timestamp part (suffix: 'timestamp'). Default: 10 */
  tsLength?: number;
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
 * Convert a string into a URL-friendly slug, with an optional uniqueness suffix.
 *
 * @example
 * import { slugify } from 'genauid';
 * slugify('Hello World!')                                    // 'hello-world'
 * slugify('Hello World!', { suffix: 'random' })             // 'hello-world-a3b8x2k4'
 * slugify('Hello World!', { suffix: 'timestamp' })          // 'hello-world-0w3kz8a9-xy4b'
 * slugify('Café au lait', { separator: '_' })               // 'cafe_au_lait'
 */
export declare function slugify(str: string, options?: SlugOptions): string;

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
