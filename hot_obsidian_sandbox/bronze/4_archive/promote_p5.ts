
import { resurrect } from './hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P5_PYRE_PRAETORIAN/RESURRECTION_LOOP.js';

const files = [
  'hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P5_PYRE_PRAETORIAN/PYRE_DANCE.ts',
  'hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P5_PYRE_PRAETORIAN/RESURRECTION_LOOP.ts',
  'hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P5_PYRE_PRAETORIAN/PHOENIX_CONTRACTS.ts',
  'hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P5_PYRE_PRAETORIAN/PYRE_HARDENING.test.ts'
];

async function run() {
  console.log('--- PURGE ROOT START ---');
  for (const f of files) {
    try {
      const success = await resurrect(f, 88.28, 'Formal promotion to Silver after reaching Goldilocks target.');
      if (success) {
        console.log(`✅ Promoted ${f}`);
      } else {
        console.error(`❌ Failed to promote ${f}`);
      }
    } catch (e) {
      console.error(`💥 Error promoting ${f}:`, e);
    }
  }
  console.log('--- PURGE ROOT END ---');
}

run();
