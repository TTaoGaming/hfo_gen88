/**
 * P3 Sub 3: Payload Injector Test
 * @provenance hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P3_SPORE_STORM/core/payload-injector.test.ts
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { PayloadInjector } from './payload-injector.js';

describe('PayloadInjector', () => {
  const testFile = path.resolve(process.cwd(), 'payload_test.txt');

  beforeEach(() => {
    fs.writeFileSync(testFile, 'TARGET');
  });

  afterEach(() => {
    if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
  });

  it('should validate and inject payload', () => {
    const injector = new PayloadInjector();
    const payload = {
        id: '123',
        data: 'const x = 1;',
        type: 'CODE'
    };

    const result = injector.injectPayload(testFile, payload);
    expect(result.success).toBe(true);
    
    const content = fs.readFileSync(testFile, 'utf8');
    expect(content).toContain('SPORE_START:123:CODE');
    expect(content).toContain('const x = 1;');
    expect(content).toContain('SPORE_END:123');
  });

  it('should throw on invalid payload', () => {
    const injector = new PayloadInjector();
    const payload = { id: 123, data: {} }; // Missing type, wrong id type
    expect(() => injector.injectPayload(testFile, payload)).toThrow();
  });
});
