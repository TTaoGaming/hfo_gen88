import { defineConfig } from 'vitest/config';
import rootConfig from './vitest.config';

export default defineConfig({
  ...rootConfig,
  test: {
    ...rootConfig.test,
    include: [
      'hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P0_LIDLESS_LEGION/sensors/Context7Sensor.test.ts',
    ],
  },
});
