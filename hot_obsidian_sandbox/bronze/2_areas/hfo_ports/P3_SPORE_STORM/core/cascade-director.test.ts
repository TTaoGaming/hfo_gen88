/**
 * P3 Sub 2: Cascade Director Test
 * @provenance hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P3_SPORE_STORM/core/cascade-director.test.ts
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { CascadeDirector, CascadeStep } from './cascade-director.js';

describe('CascadeDirector', () => {
  const file1 = path.resolve(process.cwd(), 'cascade1.txt');
  const file2 = path.resolve(process.cwd(), 'cascade2.txt');

  beforeEach(() => {
    fs.writeFileSync(file1, 'FILE 1');
    fs.writeFileSync(file2, 'FILE 2');
  });

  afterEach(() => {
    if (fs.existsSync(file1)) fs.unlinkSync(file1);
    if (fs.existsSync(file2)) fs.unlinkSync(file2);
  });

  it('should execute multiple injections', () => {
    const director = new CascadeDirector();
    const steps: CascadeStep[] = [
      { file: file1, payload: 'DATA 1' },
      { file: file2, payload: 'DATA 2' }
    ];

    const result = director.execute(steps);
    expect(result.success).toBe(true);
    expect(result.totalBytes).toBe(12);
    
    expect(fs.readFileSync(file1, 'utf8')).toContain('DATA 1');
    expect(fs.readFileSync(file2, 'utf8')).toContain('DATA 2');
  });

  it('should fail if one step fails', () => {
    const director = new CascadeDirector();
    const steps: CascadeStep[] = [
        { file: file1, payload: 'OK' },
        { file: 'missing.txt', payload: 'FAIL' }
    ];
    const result = director.execute(steps);
    expect(result.success).toBe(false);
  });
});
