/**
 * P4-P5 RED/BLUE DANCE INTEGRATION TEST
 * @provenance hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P5_PYRE_PRAETORIAN/RED_BLUE_DANCE.test.ts
 * "The Queen screams, the Praetorian dances. The loop is closed."
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WebWeaver } from '../P1_WEB_WEAVER/WEB_WEAVER.js';
import { auditContent, violations, clearViolations } from '../P4_RED_REGNANT/RED_REGNANT.js';
import { danceDie } from './PYRE_DANCE.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('P4-P5 Red/Blue Dance', () => {
  const testFile = path.resolve(process.cwd(), 'theater_test_artifact.test.ts');

  beforeEach(() => {
    // Create a "Theater" artifact (no assertions)
    fs.writeFileSync(testFile, `
      import { it } from 'vitest';
      it('is a fake test', () => {
        console.log('Doing nothing');
      });
    `);
  });

  it('should detect violation (P4) and execute demotion (P5)', async () => {
    // 1. Red Team (P4) detects the Theater
    clearViolations();
    const content = fs.readFileSync(testFile, 'utf-8');
    auditContent(testFile, content);
    
    // violations is the internal array
    const theaterViolation = (violations as any[]).find(v => v.type === 'THEATER' || v.type === 'SCREAM_THEATER');
    expect(theaterViolation).toBeDefined();

    // 2. Blue Team (P5) Reacts with a Dance
    const danceResults = danceDie(violations as any[]);
    
    const result = danceResults.find(r => r.file.includes('theater_test_artifact'));
    expect(result?.action).toBe('demoted');
    
    // Cleanup
    if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
    // Cleanup demoted file in archive
    const archivePath = path.join(process.cwd(), 'hot_obsidian_sandbox/bronze/4_archive', path.basename(testFile));
    if (fs.existsSync(archivePath)) fs.unlinkSync(archivePath);
  });
});
