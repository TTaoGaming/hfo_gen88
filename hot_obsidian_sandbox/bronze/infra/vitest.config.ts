import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      '../../silver/**/*.test.ts',
      '../../bronze/scripts/**/*.test.ts',
      '../../bronze/tests/**/*.test.ts',
    ],
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
});
