'use strict';

const js = require('@eslint/js');
const security = require('eslint-plugin-security');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
    // 1. Files to lint
    {
        files: ['src/**/*.js', 'tests/**/*.js'],
    },

    // 2. ESLint core recommended rules
    js.configs.recommended,

    // 3. Security plugin — flags common Node.js security pitfalls
    security.configs.recommended,

    // 4. Prettier compatibility — disables ESLint rules that conflict with Prettier formatting
    prettierConfig,

    // 5. Project-specific rules
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'commonjs',
            globals: {
                // Node.js globals
                require: 'readonly',
                module: 'writable',
                exports: 'writable',
                __dirname: 'readonly',
                __filename: 'readonly',
                process: 'readonly',
                Buffer: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                setInterval: 'readonly',
                clearTimeout: 'readonly',
                clearInterval: 'readonly',
            },
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

    // 6. Test-file overrides
    {
        files: ['tests/**/*.js'],
        languageOptions: {
            globals: {
                describe: 'readonly',
                test: 'readonly',
                expect: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
                jest: 'readonly',
                done: 'readonly',
            },
        },
        rules: {
            // Tests legitimately re-require modules for isolation
            'no-shadow': 'warn',
            // Tests may intentionally probe with invalid inputs
            'security/detect-object-injection': 'off',
        },
    },
];
