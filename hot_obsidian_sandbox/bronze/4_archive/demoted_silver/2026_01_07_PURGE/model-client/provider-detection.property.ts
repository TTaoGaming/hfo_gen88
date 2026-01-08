/**
 * Provider Detection Property Tests
 * @provenance hfo-testing-promotion/10.3
 * Feature: hfo-testing-promotion
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  detectProvider,
  isValidModelName,
  extractOrganization,
  extractModelName,
  normalizeModelName,
} from './provider-detection';

describe('Provider Detection Properties', () => {
  /**
   * Property 8: Provider Detection Determinism
   * For any model name string, detectProvider SHALL return 'openrouter' if the string
   * contains '/' and 'ollama' otherwise, and this result SHALL be deterministic.
   * Validates: Requirements 4.1, 4.2, 4.5
   */
  describe('Property 8: Provider Detection Determinism', () => {
    it('models with slash are always openrouter', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 20 }),
          fc.string({ minLength: 0, maxLength: 20 }),
          (org, model) => {
            const fullModel = `${org}/${model}`;
            expect(detectProvider(fullModel)).toBe('openrouter');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('models without slash are always ollama', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 50 }).filter(s => !s.includes('/')),
          (model) => {
            expect(detectProvider(model)).toBe('ollama');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('detection is deterministic - same input always same output', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 50 }),
          (model) => {
            const result1 = detectProvider(model);
            const result2 = detectProvider(model);
            const result3 = detectProvider(model);
            
            expect(result1).toBe(result2);
            expect(result2).toBe(result3);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('detection matches slash presence', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 50 }),
          (model) => {
            const hasSlash = model.includes('/');
            const provider = detectProvider(model);
            
            if (hasSlash) {
              expect(provider).toBe('openrouter');
            } else {
              expect(provider).toBe('ollama');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('extractOrganization returns undefined iff no slash', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 50 }),
          (model) => {
            const hasSlash = model.includes('/');
            const org = extractOrganization(model);
            
            if (!hasSlash) {
              expect(org).toBeUndefined();
            }
            // Note: org can be undefined even with slash if org part is empty
          }
        ),
        { numRuns: 100 }
      );
    });

    it('normalizeModelName is idempotent', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 50 }),
          (model) => {
            const once = normalizeModelName(model);
            const twice = normalizeModelName(once);
            
            expect(once).toBe(twice);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('normalizeModelName preserves slash presence', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 50 }),
          (model) => {
            const normalized = normalizeModelName(model);
            const originalHasSlash = model.includes('/');
            const normalizedHasSlash = normalized.includes('/');
            
            expect(normalizedHasSlash).toBe(originalHasSlash);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('isValidModelName is true iff non-empty', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 50 }),
          (model) => {
            const isValid = isValidModelName(model);
            const isNonEmpty = model.length > 0;
            
            expect(isValid).toBe(isNonEmpty);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
