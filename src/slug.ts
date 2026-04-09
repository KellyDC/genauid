import { CHARSETS, DEFAULTS } from './constants';
import { randomString, encodeTimestamp } from './utils';

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
   * - `'timestamp'` – append an encoded timestamp + random string for collision safety.
   */
  suffix?: SuffixMode;
  /** Chars for the random part (suffix: 'random' or 'timestamp'). Default: 8 */
  randomLength?: number;
  /** Chars for the timestamp part (suffix: 'timestamp'). Default: 10 */
  tsLength?: number;
}

interface NormalisedSlugOptions {
  tsLength: number;
  randomLength: number;
  charset: string;
  separator: string;
  suffix: SuffixMode;
}

const SUFFIX_MODES = new Set<SuffixMode>(['none', 'random', 'timestamp']);

/**
 * Validate and normalise slug options.
 */
export function normaliseSlugOptions(opts: SlugOptions = {}): NormalisedSlugOptions {
  const charset = opts.charset !== undefined ? opts.charset : CHARSETS.SLUG;

  if (typeof charset !== 'string' || charset.length < 2) {
    throw new TypeError('charset must be a string with at least 2 characters');
  }

  if ([...new Set(charset)].length !== charset.length) {
    throw new TypeError('charset must not contain duplicate characters');
  }

  const separator = opts.separator !== undefined ? String(opts.separator) : '-';

  const suffix: SuffixMode = opts.suffix !== undefined ? opts.suffix : 'none';
  if (!SUFFIX_MODES.has(suffix)) {
    throw new TypeError(`suffix must be one of: ${[...SUFFIX_MODES].join(', ')}`);
  }

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

  return { tsLength, randomLength, charset, separator, suffix };
}

/**
 * Convert a string into a URL-friendly slug, with an optional uniqueness suffix.
 *
 * @param str - Input string to slugify.
 * @param options - Slug options.
 * @returns URL-friendly slug.
 *
 * @example
 * slugify('Hello World!')                                       // 'hello-world'
 * slugify('Hello World!', { suffix: 'random' })                // 'hello-world-a3b8x2k4'
 * slugify('Hello World!', { suffix: 'random', randomLength: 12 }) // 'hello-world-a3b8x2k4j9p2'
 * slugify('Hello World!', { suffix: 'timestamp' })             // 'hello-world-0w3kz8a9-xy4b'
 * slugify('Café au lait', { separator: '_' })                  // 'cafe_au_lait'
 */
export function slugify(str: string, options: SlugOptions = {}): string {
  const { charset, separator, suffix, tsLength, randomLength } = normaliseSlugOptions(options);

  const escapedCharset = charset.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const escapedSep = separator ? separator.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') : '';
  // eslint-disable-next-line security/detect-non-literal-regexp -- escapedCharset and escapedSep are sanitised above
  const invalidChars = new RegExp(`[^${escapedCharset}${escapedSep}]`, 'g');

  let slug = str
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(invalidChars, separator);

  if (separator) {
    slug = slug
      // eslint-disable-next-line security/detect-non-literal-regexp -- escapedSep is sanitised above
      .replace(new RegExp(`${escapedSep}+`, 'g'), separator)
      // eslint-disable-next-line security/detect-non-literal-regexp -- escapedSep is sanitised above
      .replace(new RegExp(`^${escapedSep}+|${escapedSep}+$`, 'g'), '');
  }

  if (suffix === 'none') return slug;

  const rand = randomString(randomLength, charset);

  if (suffix === 'random') {
    return slug ? `${slug}${separator}${rand}` : rand;
  }

  // suffix === 'timestamp': encoded timestamp + random for collision safety
  const ts = encodeTimestamp(BigInt(Date.now()), tsLength, charset);
  return slug ? `${slug}${separator}${ts}${separator}${rand}` : `${ts}${separator}${rand}`;
}
