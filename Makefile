# Makefile for genauid

.PHONY: help install clean build test lint lint-fix format format-check audit audit-fix check publish setup reinstall version-patch version-minor version-major distclean

# Default target
help:
	@echo "Available targets:"
	@echo "  install        Install dependencies"
	@echo "  clean          Remove dist/ and coverage/"
	@echo "  build          Compile dist/ bundles"
	@echo "  test           Run tests with coverage"
	@echo "  lint           Run ESLint"
	@echo "  lint-fix       Fix ESLint issues"
	@echo "  format         Format code with Prettier"
	@echo "  format-check   Check code formatting"
	@echo "  audit          Run vulnerability audit"
	@echo "  audit-fix      Auto-fix vulnerabilities"
	@echo "  check          Run all quality checks (build lint format test audit)"
	@echo "  publish        Publish to npm"
	@echo "  setup          Install dependencies"
	@echo "  reinstall      Clean node_modules and reinstall"
	@echo "  version-patch  Bump patch version"
	@echo "  version-minor  Bump minor version"
	@echo "  version-major  Bump major version"
	@echo "  distclean      Full clean: dist/, coverage/, node_modules/"

# Install dependencies
install:
	@echo "Installing dependencies..."
	npm install

# Clean build and coverage artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf dist coverage test-results playwright-report logs

# Build dist/ bundles
build:
	@echo "Building dist/ bundles..."
	npm run build

# Run tests
test: build
	@echo "Running tests with coverage..."
	npm test

# Lint code
lint:
	@echo "Running ESLint..."
	npm run lint

# Fix linting issues
lint-fix:
	@echo "Fixing ESLint issues..."
	npm run lint:fix

# Format code
format:
	@echo "Formatting code with Prettier..."
	npm run format

# Check formatting
format-check:
	@echo "Checking code formatting..."
	npm run format:check

audit:
	@echo "Running audit for vulnerabilities..."
	npm audit --audit-level=high

audit-fix:
	@echo "Fixing vulnerabilities..."
	npm audit fix --force

# Run all quality checks
check: build lint format-check test audit
	@echo "All quality checks passed!"

# Publish to npm
publish: check
	@echo "Publishing to npm..."
	npm publish

# Setup development environment
setup: install
	@echo "Development environment ready!"

# Clean and reinstall
reinstall: clean
	@echo "Removing node_modules..."
	rm -rf node_modules package-lock.json
	@echo "Reinstalling dependencies..."
	npm install

# Version bump helpers
version-patch:
	npm version patch

version-minor:
	npm version minor

version-major:
	npm version major

# Full clean including node_modules
distclean: clean
	@echo "Removing node_modules..."
	rm -rf node_modules package-lock.json

