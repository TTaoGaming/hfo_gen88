import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * � TEST: Port 5 Pyre Dance
 * 
 * Authority: Pyre Praetorian (The Immunizer)
 * Verb: DEFEND / IMMUNIZE
 * Topic: System Disruption & Testing
 * Provenance: hot_obsidian_sandbox/bronze/P5_PYRE_PRAETORIAN/DANCE_SPEC.md
 */

describe('Port 5 Pyre Dance', () => {
  const ROOT_DIR = path.resolve(__dirname, '../../../');
  const DANCE_PATH = path.join(ROOT_DIR, 'hot_obsidian_sandbox/silver/P5_PYRE_PRAETORIAN/pyre_dance.ts');
  const QUARANTINE_DIR = path.join(ROOT_DIR, 'hot_obsidian_sandbox/bronze/quarantine/pollution');

  it('should proactively sweep root pollution', () => {
    const slopFile = path.join(ROOT_DIR, 'dance_slop.txt');
    fs.writeFileSync(slopFile, 'slop');
    
    execSync(`npx tsx ${DANCE_PATH}`, { stdio: 'pipe' });
    
    expect(fs.existsSync(slopFile)).toBe(false);
    expect(fs.existsSync(path.join(QUARANTINE_DIR, 'dance_slop.txt'))).toBe(true);
    
    // Cleanup
    if (fs.existsSync(path.join(QUARANTINE_DIR, 'dance_slop.txt'))) {
        fs.unlinkSync(path.join(QUARANTINE_DIR, 'dance_slop.txt'));
    }
  });

  it('should harden .gitignore', () => {
    const gitignorePath = path.join(ROOT_DIR, '.gitignore');
    const originalContent = fs.readFileSync(gitignorePath, 'utf-8');
    
    execSync(`npx tsx ${DANCE_PATH}`, { stdio: 'pipe' });
    
    const newContent = fs.readFileSync(gitignorePath, 'utf-8');
    expect(newContent).toContain('# HFO Gen 88 Cleanroom Firewall');
    expect(newContent).toContain('hot_obsidian_sandbox/bronze/quarantine/');
  });
});
