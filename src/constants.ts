/**
 * Default character sets for UUID generation.
 */
export const CHARSETS = {
  /** Alphanumeric: digits + lowercase + uppercase */
  ALPHANUMERIC: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  /** Base32 (Crockford): excludes visually ambiguous characters I, L, O, U */
  BASE32: '0123456789ABCDEFGHJKMNPQRSTVWXYZ',
  /** Lowercase alphanumeric for URL-safe slugs */
  SLUG: '0123456789abcdefghijklmnopqrstuvwxyz',
  /** Hexadecimal */
  HEX: '0123456789abcdef',
} as const;

/** Alias for CHARSETS (single-word import convenience). */
export const CHARSET = CHARSETS;

/**
 * Default lengths.
 */
export const DEFAULTS = {
  /** Total length of a generated time-based UUID */
  UUID_LENGTH: 26,
  /** Number of characters reserved for the timestamp prefix */
  TIMESTAMP_LENGTH: 10,
  /** Length of the random component */
  RANDOM_LENGTH: 16,
  /** Default slug suffix length (excluding timestamp prefix) */
  SLUG_RANDOM_LENGTH: 8,
  /** Minimum allowed total UUID length */
  MIN_LENGTH: 10,
  /** Maximum allowed total UUID length */
  MAX_LENGTH: 128,
} as const;
