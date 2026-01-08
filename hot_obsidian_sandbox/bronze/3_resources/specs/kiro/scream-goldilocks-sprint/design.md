# Design Document: SCREAM Goldilocks Sprint

> @provenance: requirements.md
> Validates: Gen 88 Canalization Rules

## Overview

This design specifies the approach for bringing all 8 SCREAM detectors to Goldilocks range (80-98.99%) and promoting them to Silver with tamper-evident Stryker receipts. The strategy combines:

1. **Promotion of Goldilocks detectors** (BREACH, POLLUTION, LATTICE) to Silver
2. **Mutation-killing tests** for remaining detectors (MUTATION, THEATER, PHANTOM, AMNESIA)
3. **Tamper-evident receipts** with SHA-256 hashes for cryptographic verification

## Architecture

### Current State

```
┌─────────────────────────────────────────────────────────────────┐
│                    P4 RED REGNANT - 8 SCREAMS                   │
├─────────────────────────────────────────────────────────────────┤
│  SILVER (1/8)                                                   │
│  ├── BLINDSPOT (80.95%) ✅ Receipt verified                     │
│                                                                 │
│  BRONZE - GOLDILOCKS (3/8) - Ready for promotion                │
│  ├── BREACH (87.60%) ✅                                         │
│  ├── POLLUTION (88.78%) ✅                                      │
│  └── LATTICE (89.88%) ✅                                        │
│                                                                 │
│  BRONZE - NEEDS WORK (4/8)                                      │
│  ├── MUTATION (54.25%) ❌ Gap: +25.75%                          │
│  ├── THEATER (53.19%) ❌ Gap: +26.81%                           │
│  ├── PHANTOM (50.34%) ❌ Gap: +29.66%                           │
│  └── AMNESIA (45.50%) ❌ Gap: +34.50%                           │
└─────────────────────────────────────────────────────────────────┘
```

### Target State

```
┌─────────────────────────────────────────────────────────────────┐
│                    P4 RED REGNANT - 8 SCREAMS                   │
├─────────────────────────────────────────────────────────────────┤
│  SILVER (8/8) - All Goldilocks with Tamper-Evident Receipts     │
│  ├── BLINDSPOT (80.95%) ✅ SHA-256: abc123...                   │
│  ├── BREACH (87.60%) ✅ SHA-256: def456...                      │
│  ├── POLLUTION (88.78%) ✅ SHA-256: ghi789...                   │
│  ├── LATTICE (89.88%) ✅ SHA-256: jkl012...                     │
│  ├── MUTATION (80%+) ✅ SHA-256: mno345...                      │
│  ├── THEATER (80%+) ✅ SHA-256: pqr678...                       │
│  ├── PHANTOM (80%+) ✅ SHA-256: stu901...                       │
│  └── AMNESIA (80%+) ✅ SHA-256: vwx234...                       │
└─────────────────────────────────────────────────────────────────┘
```

## Components

### Detector Structure (Exemplar)

Each detector follows this pattern:

```typescript
// detector.ts
export class XxxDetector implements Detector {
  readonly name = 'SCREAM_XXX';
  readonly port = N;
  readonly screamType = 'SCREAM_XXX' as const;
  readonly description = '...';

  async detect(targetPath: string, config?: Partial<DetectorConfig>): Promise<DetectorResult>;
  private scanContent(filePath: string, content: string, config: DetectorConfig): ScreamReceipt[];
  private findLineNumbers(content: string, pattern: RegExp): number[];
  private getSeverityForPattern(patternName: PatternName): Severity;
}
```

### Mutation-Killing Strategy

For each detector needing work:

1. **Run Stryker** to identify surviving mutants
2. **Analyze survivors** to understand what mutations aren't caught
3. **Write targeted tests** that fail when the mutation is applied
4. **Re-run Stryker** to verify the mutant is killed

### Common Surviving Mutant Types

| Mutant Type | Example | Kill Strategy |
|-------------|---------|---------------|
| Boundary | `>= 80` → `> 80` | Test exact boundary value |
| Negation | `!isTest` → `isTest` | Test both true and false paths |
| String | `'error'` → `''` | Assert exact string values |
| Arithmetic | `i + 1` → `i - 1` | Test with known line numbers |
| Conditional | `&&` → `\|\|` | Test each condition independently |
| Return | `return x` → `return null` | Assert return value type |

## Data Models

### Tamper-Evident Receipt Schema

```typescript
interface CommanderReceipt {
  port: number;
  name: string;
  scream: string;
  verb: string;
  mutationScore: number;
  status: 'GOLDILOCKS' | 'FAILURE' | 'THEATER';
  sourceHash: string;  // SHA-256 of detector source
  testHash: string;    // SHA-256 of test file
  strykerShard: string;
  mutants: {
    killed: number;
    survived: number;
    noCoverage: number;
    total: number;
  };
  promotedAt: string;  // ISO timestamp
}

interface SilverReceipt {
  promotion: {
    from: 'bronze';
    to: 'silver';
    timestamp: string;
    generation: number;
    spec: string;
  };
  artifacts: ArtifactEntry[];
  verification: {
    realCodebaseScan: boolean;
    filesScanned: number;
    violationsFound: number;
    receiptIntegrity: 'all_valid' | 'partial' | 'invalid';
    performanceMs: number;
  };
  totals: {
    testFiles: number;
    totalTests: number;
    allPassing: boolean;
  };
  commanders: {
    [portKey: string]: CommanderReceipt;
  };
}
```

### Blackboard Log Entry

```typescript
interface PromotionLogEntry {
  timestamp: string;
  event: 'SILVER_PROMOTION';
  commander: string;
  port: number;
  mutationScore: number;
  sourceHash: string;
  strykerShard: string;
  generation: number;
}
```

## Testing Strategy

### Priority Order (by gap to 80%)

1. **MUTATION** (54.25%) - 25.75% gap - ~20-25 new tests needed
2. **THEATER** (53.19%) - 26.81% gap - ~20-25 new tests needed
3. **PHANTOM** (50.34%) - 29.66% gap - ~25-30 new tests needed
4. **AMNESIA** (45.50%) - 34.50% gap - ~30-35 new tests needed

### Test File Structure

```typescript
describe('SCREAM_XXX Detector (Port N)', () => {
  // Metadata tests
  describe('Detector Metadata', () => { ... });
  
  // Factory function tests
  describe('Factory Function', () => { ... });
  
  // Pattern detection tests
  describe('PATTERN_NAME Pattern', () => { ... });
  
  // Receipt generation tests
  describe('Receipt Generation', () => { ... });
  
  // Configuration tests
  describe('Configuration', () => { ... });
  
  // Edge cases
  describe('Edge Cases', () => { ... });
  
  // MUTATION KILLERS (critical section)
  describe('Mutation Killers', () => {
    // Tests specifically designed to kill surviving mutants
  });
});
```

### Stryker Shard Configuration

```javascript
// stryker-shards/shard-N-xxx.mjs
export default {
  mutate: ['detectors/xxx.ts'],
  testRunner: 'vitest',
  reporters: ['json', 'html'],
  jsonReporter: { fileName: 'reports/shard-N-xxx.json' },
  thresholds: { high: 80, low: 60, break: null },
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system.*

### Property 1: Mutation Score Threshold

*For any* detector promoted to Silver, the mutation score SHALL be ≥ 80% and ≤ 98.99%.

**Validates: Requirements 4.1, 5.1, 6.1, 7.1**

### Property 2: Receipt Hash Integrity

*For any* Silver receipt entry, the sourceHash SHALL equal SHA-256(detector source file content).

**Validates: Requirements 8.3, 8.4**

### Property 3: Test Coverage Completeness

*For any* detector method, there SHALL be at least one test that exercises that method.

**Validates: Requirements 4.2-4.5, 5.2-5.5, 6.2-6.5, 7.2-7.5**

### Property 4: Blackboard Logging

*For any* promotion event, there SHALL be a corresponding entry in hot_obsidianblackboard.jsonl.

**Validates: Requirements 1.4, 2.4, 3.4, 8.7**

### Property 5: Commander Completeness

*For any* complete Silver promotion, the SILVER_RECEIPT.json SHALL contain exactly 8 commander entries.

**Validates: Requirements 9.2**

## Error Handling

### Stryker Failures

- IF Stryker fails to run, THEN log error and retry with increased timeout
- IF mutation score drops below previous, THEN flag as regression

### Hash Verification Failures

- IF hash verification fails, THEN reject promotion and log to Blackboard
- IF source file modified after receipt, THEN require re-verification

### Promotion Failures

- IF tests fail during promotion, THEN abort and keep in Bronze
- IF Blackboard write fails, THEN retry with exponential backoff

## Implementation Notes

### Hash Generation

```typescript
import { createHash } from 'crypto';
import { readFileSync } from 'fs';

function generateSourceHash(filePath: string): string {
  const content = readFileSync(filePath, 'utf-8');
  return createHash('sha256').update(content).digest('hex');
}
```

### Stryker Commands

```bash
# Run individual shard
npx stryker run hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P4_RED_REGNANT/stryker-shards/shard-N-xxx.mjs

# Quick iteration with Vitest
npx vitest run hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P4_RED_REGNANT/detectors/xxx.test.ts
```

### Promotion Script Pattern

```typescript
async function promoteToSilver(detector: string, port: number, score: number) {
  // 1. Verify Goldilocks score
  if (score < 80 || score > 98.99) throw new Error('Not Goldilocks');
  
  // 2. Generate hashes
  const sourceHash = generateSourceHash(`bronze/.../detectors/${detector}.ts`);
  const testHash = generateSourceHash(`bronze/.../detectors/${detector}.test.ts`);
  
  // 3. Copy files to Silver
  copySync(`bronze/.../detectors/${detector}.ts`, `silver/.../detectors/${detector}.ts`);
  copySync(`bronze/.../detectors/${detector}.test.ts`, `silver/.../detectors/${detector}.test.ts`);
  
  // 4. Update SILVER_RECEIPT.json
  updateReceipt(detector, port, score, sourceHash, testHash);
  
  // 5. Log to Blackboard
  logToBlackboard({ event: 'SILVER_PROMOTION', commander: detector, port, score, sourceHash });
}
```
