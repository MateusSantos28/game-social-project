import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const typescriptConfigs = tseslint.configs.recommended.map((config) => ({
  ...config,
  files: ['**/*.{ts,tsx,mts,cts}']
}));

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser
      }
    },
    rules: {
      'no-undef': 'error',
      'no-unreachable': 'error',
      'no-unused-vars': 'warn',
      'no-empty': 'warn',
      'no-useless-assignment': 'warn'
    }
  },
  ...typescriptConfigs,
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    rules: {
      'no-undef': 'off'
    }
  },
  {
    ignores: ['node_modules/', 'dist/']
  }
];
