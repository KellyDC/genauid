'use strict';

const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const security = require('eslint-plugin-security');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
    // 1. Files to lint
    {
        files: ['src/**/*.ts', 'tests/**/*.ts'],
    },

    // 2. ESLint core recommended rules
    js.configs.recommended,

    // 3. TypeScript-ESLint — parser + recommended rules for .ts files
    ...tseslint.configs.recommended,

    // 4. Security plugin — flags common security pitfalls
    security.configs.recommended,

    // 5. Prettier compatibility — disables ESLint rules that conflict with Prettier formatting
    prettierConfig,

    // 6. Project-specific rules (all TS source + tests)
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
        },
        rules: {
            // --- Possible errors ---
            'no-console': 'warn',
            'no-debugger': 'error',

            // --- Best practices ---
            'eqeqeq': ['error', 'always'],
            'no-eval': 'error',
            'no-implied-eval': 'error',
            'no-new-func': 'error',
            'no-param-reassign': 'warn',
            'no-shadow': 'error',
            'no-var': 'error',
            'prefer-const': 'error',
            'radix': 'error',

            // --- Security: stricter overrides on top of plugin defaults ---
            'security/detect-object-injection': 'warn',
            'security/detect-non-literal-regexp': 'warn',
            'security/detect-unsafe-regex': 'error',
            'security/detect-buffer-noassert': 'error',
            'security/detect-child-process': 'warn',
            'security/detect-disable-mustache-escape': 'error',
            'security/detect-eval-with-expression': 'error',
            'security/detect-new-buffer': 'error',
            'security/detect-no-csrf-before-method-override': 'error',
            'security/detect-possible-timing-attacks': 'warn',
            'security/detect-pseudoRandomBytes': 'error',
        },
    },

    // 7. Test-file overrides
    {
        files: ['tests/**/*.ts'],
        rules: {
            // Tests legitimately shadow variables for isolation
            'no-shadow': 'warn',
            // Tests may intentionally probe with invalid inputs
            'security/detect-object-injection': 'off',
        },
    },
];
