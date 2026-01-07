import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    env: {
      HFO_TEST_MODE: 'true'
    },
    include: [
      'hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P4_RED_REGNANT/mutation_scream.test.ts'
    ],
    alias: {
      'zod': resolve(__dirname, 'node_modules/zod'),
    },
  }
});
