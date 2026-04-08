# Changelog for `genauid`
All notable changes to this project will be documented in this file.

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
