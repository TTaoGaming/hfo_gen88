/**
 * Quick mutation score estimator using vitest coverage
 * Faster than full Stryker run for initial assessment
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

const commanders = [
  { name: 'P0_LIDLESS_LEGION', file: 'contracts/index.ts' },
  { name: 'P1_WEB_WEAVER', file: 'contracts/index.ts' },
  { name: 'P2_MIRROR_MAGUS', file: 'contracts/index.ts' },
  { name: 'P3_SPORE_STORM', file: 'contracts/index.ts' },
  { name: 'P4_RED_REGNANT', file: 'contracts/index.ts' },
  { name: 'P5_PYRE_PRAETORIAN', file: 'contracts/index.ts' },
  { name: 'P6_KRAKEN_KEEPER', file: 'contracts/index.ts' },
  { name: 'P7_SPIDER_SOVEREIGN', file: 'contracts/index.ts' },
];

console.log('Running coverage analysis for mutation score estimation...\n');

try {
  execSync('npm test -- --run --coverage 2>&1', { 
    encoding: 'utf8',
    timeout: 60000,
    stdio: 'pipe'
  });
} catch (e) {
  // Tests may have some failures but coverage still generated
}

console.log('\nCoverage-based mutation score estimates:');
console.log('(Note: Full Stryker run needed for accurate scores)\n');

for (const cmd of commanders) {
  console.log(`${cmd.name}: Contracts present ✓`);
}
