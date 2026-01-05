import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * 🥈 TEST: Port 4 Physic Scream
 * 
 * Authority: Red Regnant (The Disruptor)
 * Verb: DISRUPT / TEST
 * Topic: System Disruption & Testing
 * Provenance: hot_obsidian_sandbox/bronze/P4_DISRUPTION_KINETIC.md
 */

describe('Port 4 Physic Scream', () => {
  const ROOT_DIR = path.resolve(__dirname, '../../../');
  const SCREAMER_PATH = path.join(ROOT_DIR, 'hot_obsidian_sandbox/silver/P4_RED_REGNANT/physic_scream.ts');

  it('should detect root pollution', () => {
    const slopFile = path.join(ROOT_DIR, 'test_slop.txt');
    fs.writeFileSync(slopFile, 'slop');
    
    try {
      execSync(`npx tsx ${SCREAMER_PATH}`, { stdio: 'pipe' });
      // If it doesn't throw, it failed to detect pollution
      expect(true).toBe(false);
    } catch (error: any) {
      const output = error.stdout.toString() + error.stderr.toString();
      expect(output).toContain('😱 SCREAM: [POLLUTION]');
    } finally {
      if (fs.existsSync(slopFile)) fs.unlinkSync(slopFile);
    }
  });

  it('should pass on a clean workspace', () => {
    const output = execSync(`npx tsx ${SCREAMER_PATH}`, { encoding: 'utf-8' });
    expect(output).toContain('✅ SWEEP PASSED');
  });
});
