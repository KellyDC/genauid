# Changelog for `genauid`
All notable changes to this project will be documented in this file.

## [2.1.0] - 2026-05-01
### Added
- `generateUUID7()` — generates a UUID version 7 compliant with RFC 9562. Encodes a 48-bit Unix millisecond timestamp in the most significant bits, sets the version nibble to `7` and the RFC 4122 variant bits to `0b10xx`, and fills the remaining 74 bits with cryptographically random data. Returns the canonical `xxxxxxxx-xxxx-7xxx-yxxx-xxxxxxxxxxxx` string format.
- 6 new tests for `generateUUID7()` covering format, version/variant bits, embedded timestamp accuracy, uniqueness, lexicographic sortability, and throughput. Test count is now 98.

## [2.0.0] - 2026-04-09
### Changed
- **Full TypeScript rewrite.** All source files converted from JavaScript (JSDoc) to TypeScript. Types are now first-class and ship as generated `.d.ts` / `.d.mts` declaration files.
- **Environment-agnostic crypto.** Replaced Node.js `require('crypto')` with `globalThis.crypto.getRandomValues()`. The package now works in Node.js ≥ 15, all modern browsers, Cloudflare Workers, Deno, and Bun without any dynamic `require` hacks.
- **Dual CJS + ESM output** (`dist/index.cjs` / `dist/index.mjs`) via esbuild, with a `"module"` field and `"sideEffects": false` for full tree-shaking support.
- `safeStringEqual()` reimplemented as a pure constant-time XOR comparison (no longer depends on Node's `timingSafeEqual`), compatible with all runtimes.
### Added
- `CHARSET` export — a convenience alias for `CHARSETS` enabling the single-word import pattern: `import { generate, slugify, CHARSET } from 'genauid'`.
- `tsconfig.test.json` for ts-jest — tests run natively in TypeScript without compilation step.
### Removed
- Hand-written `src/index.d.ts` — replaced by declarations generated from TypeScript source.
### Internal
- Test suite converted to TypeScript (ts-jest); all 92 tests pass with 100 % statement/function/line coverage and ≥ 98 % branch coverage.
- Build script updated to invoke `tsc --emitDeclarationOnly` before esbuild bundling.

## [1.1.0] - 2026-04-09
### Changed
- Replaced `generateSlug()` with the more versatile `slugify(str, options)` function.
- `slugify()` accepts any input string and supports three suffix modes via the `suffix` option:
  - `'none'` (default) — plain URL-safe slug.
  - `'random'` — slug with a cryptographically random suffix.
  - `'timestamp'` — slug with an encoded timestamp + random suffix for sortable, collision-safe unique slugs.
### Removed
- `generateSlug()` — superseded by `slugify()` with `suffix: 'timestamp'`.

## [1.0.0] - 2026-04-08
### Added
- Initial release: `generate()`, `generateSlug()`, `validate()`, `decodeTimestamp()`.
- Built-in character sets: BASE32, SLUG, ALPHANUMERIC, HEX.
