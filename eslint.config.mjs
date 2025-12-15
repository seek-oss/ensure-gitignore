import eslintConfigSeek from 'eslint-config-seek/vitest/base';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  {
    extends: [eslintConfigSeek],
  },
  {
    rules: {
      'no-console': 'off',
      'no-sync': 'off',
    },
  },
);
