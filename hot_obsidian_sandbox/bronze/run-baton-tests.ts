/**
 * Simple test runner for baton validator properties
 */
import * as fc from 'fast-check';
import {
  extractFrontmatter,
  extractSections,
  countLines,
  computeChecksum,
  BatonMetadataSchema,
} from './baton-validator.js';

const validStatusArb = fc.constantFrom('BOOTSTRAP', 'ACTIVE', 'DEPRECATED');

const validMetadataArb = fc.record({
  generation: fc.integer({ min: 1, max: 1000 }),
  predecessor: fc.integer({ min: 0, max: 999 }),
  status: validStatusArb,
  checksum: fc.stringMatching(/^[a-f0-9]{64}$/).map(h => `sha256:${h}`),
  created: fc.constant('2026-01-06'),
});

const yamlFromMetadata = (m: { generation: number; predecessor: number; status: string; checksum: string; created: string }) =>
  `---\ngeneration: ${m.generation}\npredecessor: ${m.predecessor}\nstatus: ${m.status}\nchecksum: ${m.checksum}\ncreated: ${m.created}\n---\n`;

const sectionContentArb = fc.array(fc.lorem({ maxCount: 5 }), { minLength: 1, maxLength: 10 })
  .map(lines => lines.join('\n'));

const validBatonArb = validMetadataArb.chain(meta => {
  return fc.tuple(
    fc.constant(meta),
    sectionContentArb, sectionContentArb, sectionContentArb, sectionContentArb,
    sectionContentArb, sectionContentArb, sectionContentArb, sectionContentArb,
  ).map(([m, s0, s1, s2, s3, s4, s5, s6, s7]) => {
    return yamlFromMetadata(m) +
      `\n## §0 COLD START\n${s0}\n\n## §1 CONTRACTS\n${s1}\n\n## §2 ARCHITECTURE\n${s2}\n` +
      `\n## §3 PATTERNS\n${s3}\n\n## §4 ANTIPATTERNS\n${s4}\n\n## §5 ENFORCEMENT\n${s5}\n` +
      `\n## §6 PAIN REGISTRY\n${s6}\n\n## §7 BOOTSTRAP CHECKLIST\n${s7}\n`;
  });
});

console.log('🧪 Running Property-Based Tests for Silver Baton Validator\n');

let passed = 0;
let failed = 0;

function runTest(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (e) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${(e as Error).message}`);
    failed++;
  }
}

// Property 1: YAML Frontmatter Round-Trip
runTest('Property 1: YAML frontmatter round-trip', () => {
  fc.assert(
    fc.property(validMetadataArb, (metadata) => {
      const yaml = yamlFromMetadata(metadata);
      const content = yaml + '\n# Content';
      const extracted = extractFrontmatter(content);
      if (!extracted) throw new Error('Frontmatter not extracted');
      if (extracted.generation !== metadata.generation) throw new Error('Generation mismatch');
      if (extracted.predecessor !== metadata.predecessor) throw new Error('Predecessor mismatch');
      if (extracted.status !== metadata.status) throw new Error('Status mismatch');
    }),
    { numRuns: 100 }
  );
});

// Property 5: Sequential Section Ordering
runTest('Property 5: Section markers sequential order', () => {
  fc.assert(
    fc.property(validBatonArb, (content) => {
      const sections = extractSections(content);
      const sectionNums = Array.from(sections.keys()).sort((a, b) => a - b);
      if (sectionNums.length !== 8) throw new Error(`Expected 8 sections, got ${sectionNums.length}`);
      let lastStart = -1;
      for (const num of sectionNums) {
        const section = sections.get(num)!;
        if (section.start <= lastStart) throw new Error(`Section §${num} out of order`);
        lastStart = section.start;
      }
    }),
    { numRuns: 100 }
  );
});

// Property 13/14: Line Count
runTest('Property 13/14: Line count validation', () => {
  fc.assert(
    fc.property(fc.array(fc.lorem({ maxCount: 3 }), { minLength: 1, maxLength: 5 }), (lines) => {
      const content = lines.join('\n');
      const lineCount = countLines(content);
      if (lineCount !== content.split('\n').length) throw new Error('Line count mismatch');
    }),
    { numRuns: 100 }
  );
});

// Property 15: Checksum Determinism
runTest('Property 15: Checksum determinism', () => {
  fc.assert(
    fc.property(validBatonArb, (content) => {
      const checksum1 = computeChecksum(content);
      const checksum2 = computeChecksum(content);
      if (checksum1 !== checksum2) throw new Error('Checksum not deterministic');
      if (!/^sha256:[a-f0-9]{64}$/.test(checksum1)) throw new Error('Invalid checksum format');
    }),
    { numRuns: 100 }
  );
});

// Schema Validation
runTest('BatonMetadataSchema accepts valid metadata', () => {
  fc.assert(
    fc.property(validMetadataArb, (metadata) => {
      const result = BatonMetadataSchema.safeParse(metadata);
      if (!result.success) throw new Error('Schema rejected valid metadata');
    }),
    { numRuns: 100 }
  );
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
