// eslint.config.js
import js from '@eslint/js';
import pluginReact from 'eslint-plugin-react';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import airbnb from "eslint-config-airbnb-base";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      'build/**/*',
      'dist/**/*',
      'node_modules/**/*',
      '*.config.js',
      '*.config.ts',
      'public/**/*',
      '.react-router/**/*' // Ahora esto será ignorado globalmente
    ]
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    plugins: {
      react: pluginReact,
      'unused-imports': unusedImports
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true }
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      // React rules
      'react/react-in-jsx-scope': 'off',
      'react/jsx-filename-extension': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/function-component-definition': 'off',

      // Import/export rules
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      ...airbnb.rules,

      // General code quality
      'no-console': 'off',
      'prefer-const': 'error',
      'no-var': 'error',

      // TypeScript specific
      '@typescript-eslint/no-unused-vars': 'off', // handled by unused-imports
      '@typescript-eslint/no-explicit-any': 'off'
    }
  }
];
