import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['hot_obsidian_sandbox/bronze/contracts/obsidian-stigmergy.test.ts'],
    alias: {
      'zod': resolve(__dirname, '../../../node_modules/zod'),
    }
  }
});
