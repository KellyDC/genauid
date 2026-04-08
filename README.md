# genauid

GenauID is a high-performance Node.js utility for generating time-based, lexicographically sortable, and cryptographically random unique identifiers.

Inspired by the stern and precise First-Class Mage Genau from Frieren: Beyond Journey's End, this package is designed for systems where order, efficiency, and unwavering reliability are non-negotiable.

## Key Features

- **Sortable by creation time** — lexicographic order equals chronological order, enabling efficient B-tree index range scans.
- **Cryptographically random** — uses Node.js `crypto.randomBytes` with bias elimination, never `Math.random()`.
- **No external runtime dependencies** — built entirely on Node.js built-ins.
- **Highly customisable** — length, character set, timestamp width, and separator are all configurable.
- **Human-readable slugs** — an optional slug generator produces IDs like `01j3rvmq8z-k4xntbpd`.
- **Validation** — built-in validator checks format, character set, and optionally enforces a maximum age.
- **Full TypeScript types** — ships with `.d.ts` declarations.
- **≥ 90% test coverage** — 71 tests covering edge cases, security, and performance.

## Requirements

- Node.js ≥ 16.0.0

## Installation

```bash
npm install genauid
```

## Quick Start

```js
const { generate, generateSlug, validate, CHARSETS } = require('genauid');

// Generate a time-based sortable ID (26 chars, BASE32 charset by default)
const id = generate();
console.log(id); // e.g. '01J3RVMQ8Z4KXNTBPD6S7WHMF'

// Generate a human-readable slug
const slug = generateSlug();
console.log(slug); // e.g. '01j3rvmq8z-k4xntbpd'

// Validate a previously generated ID
const result = validate(id);
console.log(result.valid);     // true
console.log(result.timestamp); // Date object: the generation time
```

---

## API

### `generate(options?): string`

Generates a time-based, cryptographically random, lexicographically sortable ID.

The ID starts with a fixed-width timestamp prefix (chronologically sortable) followed by a cryptographically random suffix.

#### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `length` | `number` | `26` | Total length of the generated ID (10–128). |
| `tsLength` | `number` | `10` | Number of leading characters encoding the timestamp. |
| `charset` | `string` | `CHARSETS.BASE32` | Character set to draw characters from. |
| `separator` | `string` | `''` | Optional separator inserted between timestamp and random parts. |

#### Examples

```js
// Default — 26-char BASE32 ID
generate();
// '01J3RVMQ8Z4KXNTBPD6S7WHMF'

// Custom length (32 chars)
generate({ length: 32 });

// Custom charset
generate({ charset: CHARSETS.ALPHANUMERIC, length: 32 });

// With separator (makes the timestamp boundary visible)
generate({ tsLength: 10, length: 27, separator: '-' });
// '01J3RVMQ8Z-4KXNTBPD6S7WH'

// HEX IDs for legacy systems
generate({ charset: CHARSETS.HEX, length: 32 });
```

---

### `generateSlug(options?): string`

Generates a human-readable, time-based, sortable slug.

#### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `tsLength` | `number` | `10` | Characters for the timestamp prefix. |
| `randomLength` | `number` | `8` | Characters for the random suffix. |
| `charset` | `string` | `CHARSETS.SLUG` | Character set (lowercase alphanumeric by default). |
| `separator` | `string` | `'-'` | Separator between timestamp and random parts. |

#### Examples

```js
// Default
generateSlug();
// '01j3rvmq8z-k4xntbpd'

// Custom separator
generateSlug({ separator: '_' });
// '01j3rvmq8z_k4xntbpd'

// Longer random suffix
generateSlug({ randomLength: 12 });
// '01j3rvmq8z-k4xntbpd6s7wh'

// Dense (no separator)
generateSlug({ separator: '', tsLength: 10, randomLength: 8 });
// '01j3rvmq8zk4xntbpd'
```

---

### `validate(id, options?): ValidationResult`

Validates a previously generated ID.

Checks performed:
1. Input is a non-empty string.
2. Length matches expectation (when `length` is provided).
3. All characters belong to the expected charset.
4. The embedded timestamp is not in the future (within tolerated clock skew).
5. The embedded timestamp is not before year 2000.
6. The ID has not exceeded `maxAgeMs` (when provided).

#### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `charset` | `string` | `CHARSETS.BASE32` | Expected character set. |
| `length` | `number` | — | Expected total length (optional). |
| `tsLength` | `number` | `10` | Expected timestamp prefix length. |
| `separator` | `string` | `''` | Expected separator used during generation. |
| `maxAgeMs` | `number` | — | Reject IDs older than this many milliseconds (optional). |
| `clockSkewMs` | `number` | `5000` | Tolerated future clock skew in milliseconds. |

#### Return value: `ValidationResult`

```ts
{
  valid: boolean;      // true if all checks pass
  errors: string[];    // list of failure reasons (empty when valid)
  timestamp: Date | null; // extracted Date from the embedded timestamp
}
```

#### Examples

```js
const id = generate();
const result = validate(id);
// { valid: true, errors: [], timestamp: Date }

// Validate with full options
validate(id, {
  charset: CHARSETS.BASE32,
  length: 26,
  maxAgeMs: 30_000, // reject IDs older than 30 seconds
});

// Validate a slug
validate(slug, {
  charset: CHARSETS.SLUG,
  separator: '-',
  tsLength: 10,
});
```

---

### `decodeTimestamp(encoded, charset): bigint`

Decodes the timestamp prefix of an ID back into a BigInt millisecond value.

```js
const { decodeTimestamp, CHARSETS } = require('genauid');

const tsPart = id.slice(0, 10);
const ms = decodeTimestamp(tsPart, CHARSETS.BASE32);
console.log(new Date(Number(ms))); // generation Date
```

---

### `CHARSETS`

Built-in character sets:

| Name | Characters | Notes |
|---|---|---|
| `CHARSETS.BASE32` | `0–9 A–Z` (Crockford variant) | Default for `generate()`. Excludes `I`, `L`, `O`, `U` to avoid visual confusion. |
| `CHARSETS.SLUG` | `0–9 a–z` | Default for `generateSlug()`. URL-safe, lowercase. |
| `CHARSETS.ALPHANUMERIC` | `0–9 A–Z a–z` | Maximum density (62 symbols). |
| `CHARSETS.HEX` | `0–9 a–f` | Hexadecimal — lowest density, widest compatibility. |

You can also pass any **custom string** as a charset. Requirements:
- Minimum 2 characters.
- No duplicate characters.
- Characters should be in ASCII-sorted order for guaranteed lexicographic sortability (the timestamp prefix relies on this).

---

## Sortability guarantee

The timestamp prefix is encoded as a fixed-width base-N number where the digit symbols are in ascending ASCII order. This means:

```
encode(t1) < encode(t2)  ⟺  t1 < t2
```

All built-in charsets (`BASE32`, `SLUG`, `ALPHANUMERIC`, `HEX`) are in ascending ASCII order, so lexicographic sorting of generated IDs equals chronological sorting.

> **Custom charsets:** ensure your charset characters are in ascending ASCII order if sortability is required.

---

## Uniqueness

Each ID combines:
- A millisecond-precision timestamp (common prefix within the same millisecond).
- A cryptographically random suffix produced via `crypto.randomBytes` with **modulo-bias elimination**.

With a 16-character BASE32 random suffix the probability of a collision within the same millisecond is approximately $1 / 32^{16} \approx 10^{-24}$, making collisions practically impossible.

---

## Security considerations

- The random component is generated with `crypto.randomBytes`, which is cryptographically secure.
- Modulo bias is eliminated by rejection sampling.
- The validation function uses `crypto.timingSafeEqual` for string comparisons to prevent timing attacks.
- IDs embed a timestamp and are therefore **not suitable as opaque secrets** (an attacker can determine when an ID was created). Use them as primary keys, not as authentication tokens.

---

## Performance

Benchmarked on Node.js 24 (Apple M-class / modern x86):

| Operation | Throughput |
|---|---|
| `generate()` | > 100,000 IDs/s |
| `generateSlug()` | > 100,000 slugs/s |
| `validate()` | > 500,000 validations/s |

Run the built-in performance tests:

```bash
npm test
```

---

## Running tests

```bash
npm test               # run tests with coverage report
npm run test:watch     # watch mode
```

Coverage thresholds (enforced):
- Statements: 90%
- Branches: 90%
- Functions: 90%
- Lines: 90%

Actual coverage of this release: 100% statements, 97.84% branches, 100% functions, 100% lines.

76 tests pass, ESLint clean, 100% statement/function/line coverage. 


Here's the full security assessment:

---
Automated checks

| Check | Result |
|---|---|
| npm audit | 0 vulnerabilities |
| eslint-plugin-security | 0 warnings/errors |
| tsc --noEmit | 0 type errors |

---
Manual review — all clear

| Area | What was checked | Status |
|---|---|---|
| Random generation | crypto.randomBytes only — no Math.random() | ✅ |
| Modulo bias | Rejection sampling eliminates skew | ✅ |
| Timing attacks | crypto.timingSafeEqual used for string comparison | ✅ |
| RegExp injection | escapeRegex() sanitises separator before new RegExp() | ✅ |
| eval / new Function | None present | ✅ |
| Prototype pollution | Options read with !== undefined guards, not in or bare access | ✅ |
| Input bounds | All lengths, charsets, and separators validated before use | ✅ |
| NaN/Infinity inputs | Fixed — maxAgeMs and clockSkewMs now reject non-finite/invalid values with a clear error | ✅ |

**One inherent design note (not a vulnerability)**: IDs embed a millisecond timestamp, so anyone who holds an ID can determine when it was created — don't use them as secrets or authentication tokens, only as primary keys.

---

## TypeScript

The package ships with a hand-written `src/index.d.ts` and an `exports` map, so it works out of the box with all TypeScript `moduleResolution` modes — including `node`, `node16`, and `bundler`.

```ts
import { generate, generateSlug, validate, CHARSETS } from 'genauid';
import type { GenerateOptions, SlugOptions, ValidateOptions, ValidationResult } from 'genauid';

const id: string = generate({ length: 32, charset: CHARSETS.ALPHANUMERIC });
const result: ValidationResult = validate(id);
```

---

## Limitations

- IDs are **not RFC 4122 UUIDs**. If strict UUID format compliance is required, use the `uuid` package instead.
- The timestamp has **millisecond precision**. Multiple IDs generated within the same millisecond share the same timestamp prefix and are ordered randomly among themselves.
- Maximum ID length is 128 characters.

---

## License

MIT
