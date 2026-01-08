/**
 * P3 Sub 0: File Injector Test
 * @provenance hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P3_SPORE_STORM/core/file-injector.test.ts
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { FileInjector } from './file-injector.js';

describe('FileInjector', () => {
  const testFile = path.resolve(process.cwd(), 'spore_test.txt');

  beforeEach(() => {
    fs.writeFileSync(testFile, 'INITIAL CONTENT\n// @marker');
  });

  afterEach(() => {
    if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
  });

  it('should inject payload at marker', () => {
    const injector = new FileInjector();
    const result = injector.inject(testFile, 'SPORE_PAYLOAD', { marker: '// @marker' });
    
    expect(result.success).toBe(true);
    expect(result.bytesInjected).toBe(13);
    
    const content = fs.readFileSync(testFile, 'utf8');
    expect(content).toContain('// @marker\nSPORE_PAYLOAD');
  });

  it('should append payload if marker missing', () => {
    const injector = new FileInjector();
    const result = injector.inject(testFile, 'APPENDED_PAYLOAD', { marker: '// @missing' });
    
    const content = fs.readFileSync(testFile, 'utf8');
    expect(content).toContain('INITIAL CONTENT');
    expect(content.endsWith('APPENDED_PAYLOAD')).toBe(true);
  });

  it('should return failure if file does not exist', () => {
    const injector = new FileInjector();
    const result = injector.inject('non_existent.txt', 'DATA');
    expect(result.success).toBe(false);
  });
});
