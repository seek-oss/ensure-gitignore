import eslintConfigSeek from 'eslint-config-seek';
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
