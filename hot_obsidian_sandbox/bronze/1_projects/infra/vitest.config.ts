import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      '../../silver/**/*.test.ts',
      '../scripts/**/*.test.ts',
      '../tests/**/*.test.ts',
      '../P5_PYRE_PRAETORIAN/**/*.test.ts',
      '../adapters/**/*.test.ts',
      '../contracts/**/*.test.ts',
      '../2_areas/**/*.test.ts',
    ],
    exclude: ['**/node_modules/**', '**/dist/**'],
    alias: {
      'zod': resolve(__dirname, '../../../node_modules/zod'),
      'duckdb': resolve(__dirname, '../../../node_modules/duckdb'),
    },
  },
  resolve: {
    extensionAlias: {
      '.js': ['.ts', '.js'],
    },
  },
});
