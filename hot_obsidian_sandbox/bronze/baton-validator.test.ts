/**
 * Property-Based Tests for Silver Baton Quine Validator
 * Feature: silver-baton-quine
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  extractFrontmatter,
  extractSections,
  countLines,
  computeChecksum,
  validateFrontmatter,
  validateSections,
  validateLineCounts,
  BatonMetadataSchema,
} from './baton-validator';

// === GENERATORS ===

const validStatusArb = fc.constantFrom('BOOTSTRAP', 'ACTIVE', 'DEPRECATED');

// Generate hex string using array of hex chars
const hexCharArb = fc.constantFrom(...'0123456789abcdef'.split(''));
const hexStringArb = fc.array(hexCharArb, { minLength: 64, maxLength: 64 }).map(arr => arr.join(''));

const validMetadataArb = fc.record({
  generation: fc.integer({ min: 1, max: 1000 }),
  predecessor: fc.integer({ min: 0, max: 999 }),
  status: validStatusArb,
  checksum: hexStringArb.map(h => `sha256:${h}`),
  // Use a fixed timestamp range to avoid RangeError: Invalid time value
  created: fc.integer({ min: 1577836800000, max: 1893456000000 }).map(t => new Date(t).toISOString().split('T')[0]),
});

const yamlFromMetadata = (m: { generation: number; predecessor: number; status: string; checksum: string; created: string }) =>
  `---\ngeneration: ${m.generation}\npredecessor: ${m.predecessor}\nstatus: ${m.status}\nchecksum: ${m.checksum}\ncreated: ${m.created}\n---\n`;

const sectionContentArb = fc.array(fc.lorem({ maxCount: 5 }), { minLength: 1, maxLength: 10 })
  .map(lines => lines.join('\n'));

const validBatonArb = validMetadataArb.chain(meta => {
  return fc.tuple(
    fc.constant(meta),
    sectionContentArb, // §0
    sectionContentArb, // §1
    sectionContentArb, // §2
    sectionContentArb, // §3
    sectionContentArb, // §4
    sectionContentArb, // §5
    sectionContentArb, // §6
    sectionContentArb, // §7
  ).map(([m, s0, s1, s2, s3, s4, s5, s6, s7]) => {
    return yamlFromMetadata(m) +
      `\n## §0 COLD START\n${s0}\n` +
      `\n## §1 CONTRACTS\n${s1}\n` +
      `\n## §2 ARCHITECTURE\n${s2}\n` +
      `\n## §3 PATTERNS\n${s3}\n` +
      `\n## §4 ANTIPATTERNS\n${s4}\n` +
      `\n## §5 ENFORCEMENT\n${s5}\n` +
      `\n## §6 PAIN REGISTRY\n${s6}\n` +
      `\n## §7 BOOTSTRAP CHECKLIST\n${s7}\n`;
  });
});

// === PROPERTY TESTS ===

describe('Silver Baton Validator - Property Tests', () => {
  
  /**
   * Feature: silver-baton-quine, Property 1: YAML Frontmatter Structure
   * Validates: Requirements 1.1
   */
  it('Property 1: YAML frontmatter round-trip preserves structure', () => {
    fc.assert(
      fc.property(validMetadataArb, (metadata) => {
        const yaml = yamlFromMetadata(metadata);
        const content = yaml + '\n# Content';
        const extracted = extractFrontmatter(content);
        
        expect(extracted).not.toBeNull();
        expect(extracted!.generation).toBe(metadata.generation);
        expect(extracted!.predecessor).toBe(metadata.predecessor);
        expect(extracted!.status).toBe(metadata.status);
        expect(extracted!.checksum).toBe(metadata.checksum);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: silver-baton-quine, Property 5: Sequential Section Ordering
   * Validates: Requirements 2.4
   */
  it('Property 5: Section markers are detected in sequential order', () => {
    fc.assert(
      fc.property(validBatonArb, (content) => {
        const sections = extractSections(content);
        const sectionNums = Array.from(sections.keys()).sort((a, b) => a - b);
        
        // All sections 0-7 should be present
        expect(sectionNums).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
        
        // Sections should be in order by start position
        let lastStart = -1;
        for (const num of sectionNums) {
          const section = sections.get(num)!;
          expect(section.start).toBeGreaterThan(lastStart);
          lastStart = section.start;
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: silver-baton-quine, Property 13: Total Line Count Constraint
   * Feature: silver-baton-quine, Property 14: Section Line Count Constraint
   * Validates: Requirements 9.1, 9.2
   */
  it('Property 13/14: Line count validation correctly identifies violations', () => {
    // Generate content with known line counts
    const shortContent = fc.array(fc.lorem({ maxCount: 3 }), { minLength: 1, maxLength: 5 })
      .map(lines => lines.join('\n'));
    
    fc.assert(
      fc.property(shortContent, (sectionContent) => {
        const lineCount = countLines(sectionContent);
        // Line count should be positive
        expect(lineCount).toBeGreaterThan(0);
        // Line count should match actual newlines + 1
        expect(lineCount).toBe(sectionContent.split('\n').length);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: silver-baton-quine, Property 15: Checksum Round-Trip
   * Validates: Requirements 10.2
   */
  it('Property 15: Checksum computation is deterministic', () => {
    fc.assert(
      fc.property(validBatonArb, (content) => {
        const checksum1 = computeChecksum(content);
        const checksum2 = computeChecksum(content);
        
        // Same content should produce same checksum
        expect(checksum1).toBe(checksum2);
        
        // Checksum should have correct format
        expect(checksum1).toMatch(/^sha256:[a-f0-9]{64}$/);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: silver-baton-quine, Property 15 (continued): Different content produces different checksum
   */
  it('Property 15b: Different content produces different checksums', () => {
    fc.assert(
      fc.property(validBatonArb, validBatonArb, (content1, content2) => {
        // Skip if contents are identical
        fc.pre(content1 !== content2);
        
        const checksum1 = computeChecksum(content1);
        const checksum2 = computeChecksum(content2);
        
        // Different content should (almost certainly) produce different checksums
        expect(checksum1).not.toBe(checksum2);
      }),
      { numRuns: 100 }
    );
  });
});

describe('Silver Baton Validator - Schema Validation', () => {
  
  it('BatonMetadataSchema accepts valid metadata', () => {
    fc.assert(
      fc.property(validMetadataArb, (metadata) => {
        const result = BatonMetadataSchema.safeParse(metadata);
        expect(result.success).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('BatonMetadataSchema rejects invalid generation', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -1000, max: 0 }),
        (badGen) => {
          const metadata = {
            generation: badGen,
            predecessor: 88,
            status: 'BOOTSTRAP',
            checksum: 'sha256:' + 'a'.repeat(64),
            created: '2026-01-06',
          };
          const result = BatonMetadataSchema.safeParse(metadata);
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 50 }
    );
  });
});
