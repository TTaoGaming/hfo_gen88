/**
 * Stryker Mutation Config for Mastra POC
 * @port 7
 */
export default {
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress', 'json'],
  testRunner: 'vitest',
  testRunner_static_config: {
    config: 'hot_obsidian_sandbox/bronze/1_projects/P7_MASTRA_POC/vitest.mastra.config.ts'
  },
  coverageAnalysis: 'perTest',
  mutate: [
    'hot_obsidian_sandbox/bronze/1_projects/P7_MASTRA_POC/orchestration_logic.ts',
    'hot_obsidian_sandbox/bronze/1_projects/P7_MASTRA_POC/hive_logic.ts'
  ],
  // Only copy what is absolutely necessary to speed up and avoid EPERM
  files: [
    'package.json',
    'tsconfig.json',
    'hot_obsidian_sandbox/bronze/1_projects/P7_MASTRA_POC/orchestration_logic.ts',
    'hot_obsidian_sandbox/bronze/1_projects/P7_MASTRA_POC/orchestration.test.ts',
    'hot_obsidian_sandbox/bronze/1_projects/P7_MASTRA_POC/hive_logic.ts',
    'hot_obsidian_sandbox/bronze/1_projects/P7_MASTRA_POC/hive.test.ts',
    'hot_obsidian_sandbox/bronze/1_projects/P7_MASTRA_POC/vitest.mastra.config.ts',
  ],
  tempDirName: '.stryker-tmp-mastra',
  cleanTempDir: true,
  concurrency: 2, // Limit concurrency to avoid overloading
};
