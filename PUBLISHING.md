# Publishing genauid to npm

This document covers the complete workflow for publishing and maintaining the `genauid` package on the npm registry.

---

## Prerequisites

1. **npm account** — Create a free account at [https://www.npmjs.com/signup](https://www.npmjs.com/signup) if you do not have one.
2. **Node.js ≥ 16** and **npm ≥ 7** installed.
3. Ensure all tests pass before publishing:
   ```bash
   npm test
   ```

---

## 1. Configure package.json before first publish

Open `package.json` and fill in the fields below (they are intentionally left blank in the development template):

```jsonc
{
  "name": "genauid",           // must be unique on npm; add a scope like "@kellydc/genauid" if taken
  "version": "1.0.0",         // follows Semantic Versioning (semver.org)
  "author": "Your Name <you@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/kellydc/genauid.git"
  },
  "bugs": {
    "url": "https://github.com/kellydc/genauid/issues"
  },
  "homepage": "https://github.com/kellydc/genauid#readme"
}
```

### Scoped package (recommended to avoid name conflicts)

```jsonc
{
  "name": "@kellydc/genauid",
  "publishConfig": {
    "access": "public"   // required for scoped packages on the free tier
  }
}
```

---

## 2. Verify what gets published

The `files` field in `package.json` is an explicit allowlist of what ships:

```jsonc
"files": [
  "dist/",
  "README.md",
  "LICENSE"
]
```

Only the compiled `dist/` output is published — `src/`, `tests/`, and all config files stay local. Do not add a `.npmignore`; it would conflict with this allowlist.

---

## 3. Authenticate with npm

```bash
npm login
# Enter username, password, and one-time password (OTP) if 2FA is enabled.
```

Verify you are logged in:

```bash
npm whoami
```

---

## 4. Dry-run before publishing

Inspect exactly what will be uploaded:

```bash
npm pack --dry-run
```

This lists all files that would be included. Review it carefully — no test files, no secrets, no `node_modules`.

Create a local tarball and inspect it:

```bash
npm pack
tar -tzf genauid-*.tgz
```

---

## 5. Publish

```bash
npm publish
```

For a scoped package:

```bash
npm publish --access public
```

### Publish a pre-release (e.g. beta)

```bash
# bump version to 1.1.0-beta.1
npm version 1.1.0-beta.1 --no-git-tag-version
npm publish --tag beta
```

Consumers install it explicitly: `npm install genauid@beta`.

---

## 6. Version management (Semantic Versioning)

Follow [semver.org](https://semver.org/):

| Change type | Version bump | Command |
|---|---|---|
| Bug fix, no API change | Patch `1.0.x` | `npm version patch` |
| Backward-compatible new feature | Minor `1.x.0` | `npm version minor` |
| Breaking API change | Major `x.0.0` | `npm version major` |

`npm version` automatically:
- Updates `package.json`.
- Creates a git commit with the version number as the message.
- Creates a git tag `vX.Y.Z`.

Then push the tag:

```bash
git push && git push --tags
```

---

## 7. Automate publishing with GitHub Actions (CI/CD)

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write   # for npm provenance
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'

      - run: npm ci
      - run: npm test

      - run: npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Store your npm token as a repository secret named `NPM_TOKEN`:
1. Generate a token at [https://www.npmjs.com/settings/tokens](https://www.npmjs.com/settings/tokens) — choose **Automation** type.
2. Add it to GitHub: **Settings → Secrets and variables → Actions → New repository secret**.

The `--provenance` flag publishes a signed attestation linking the package to its git commit, improving supply-chain security.

---

## 8. Maintenance checklist

### Routine

- [ ] Run `npm audit` weekly and fix any vulnerabilities:
  ```bash
  npm audit
  npm audit fix
  ```
- [ ] Keep `devDependencies` up to date:
  ```bash
  npx npm-check-updates -u && npm install && npm test
  ```
- [ ] Review open GitHub issues and pull requests regularly.

### Before every release

- [ ] All tests pass: `npm test`
- [ ] Coverage thresholds met (≥ 90%).
- [ ] `CHANGELOG.md` updated (see below).
- [ ] Version bumped following semver.
- [ ] `README.md` reflects any API changes.

---

## 9. Maintaining a CHANGELOG

Use [Keep a Changelog](https://keepachangelog.com) format. Create `CHANGELOG.md` in the project root:

```markdown
# Changelog

## [Unreleased]

## [1.0.0] - 2026-04-08
### Added
- Initial release: `generate()`, `generateSlug()`, `validate()`, `decodeTimestamp()`.
- Built-in character sets: BASE32, SLUG, ALPHANUMERIC, HEX.
- Full TypeScript declarations.
- 71 unit tests; ≥ 97% branch coverage.
```

---

## 10. Deprecating or unpublishing

### Deprecate a version (preferred — keeps it available but warns users)

```bash
npm deprecate genauid@"< 1.0.0" "Please upgrade to ≥ 1.0.0"
```

### Unpublish (only within 72 hours of publishing, or by npm support)

```bash
npm unpublish genauid@1.0.0
```

> **Warning:** unpublishing a widely-used package breaks downstream consumers. Deprecation is almost always the right choice.

---

## 11. Security disclosures

Add a `SECURITY.md` file to the repository describing how to responsibly report vulnerabilities. GitHub automatically surfaces it in the **Security** tab.

```markdown
# Security Policy

If you discover a security vulnerability, please email security@yourproject.example
instead of opening a public GitHub issue. We will respond within 48 hours.
```
