# Design Document: MAP-ELITE Harness

## Overview

MAP-ELITE is an 8-harness LLM evaluation system that ranks models individually and tests them in swarm orchestration patterns. The system uses a tamper-proof hash-chained ledger for results and maps harnesses to OBSIDIAN ports for HFO integration.

**Core Flow**:
1. Run 8 harnesses on a model → compute fitness score
2. Test models in orchestration patterns (:00, :10, :01, :1010)
3. Log all results to hash-chained ledger
4. Rank models for mission suitability

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MAP_ELITE_System                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   CLI       │  │ Orchestrator│  │   Eval_Ledger       │ │
│  │  (entry)    │→ │  (patterns) │→ │  (hash-chain JSONL) │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│         │                │                    ↑             │
│         ↓                ↓                    │             │
│  ┌─────────────────────────────────────────────┐           │
│  │              Harness Runner                  │           │
│  │  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐      │
│  │  │ 0 │ │ 1 │ │ 2 │ │ 3 │ │ 4 │ │ 5 │ │ 6 │ │ 7 │      │
│  │  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘      │
│  │ SENSE FUSE SHAPE DELIVER DISRUPT IMMUNIZE STORE DECIDE │
│  └─────────────────────────────────────────────────────────┘ │
│                          │                                   │
│                          ↓                                   │
│                   ┌─────────────┐                            │
│                   │   Ollama    │                            │
│                   │   (local)   │                            │
│                   └─────────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. HarnessResult Schema (Zod)

```typescript
import { z } from 'zod';

export const HarnessResultSchema = z.object({
  harness_id: z.number().min(0).max(7),
  harness_name: z.string(),
  model: z.string(),
  scores: z.object({
    raw: z.number(),
    normalized: z.number().min(0).max(1),
  }),
  timestamp: z.string().datetime(),
  prev_hash: z.string(),
  hash: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

export type HarnessResult = z.infer<typeof HarnessResultSchema>;
```

### 2. Harness Interface

```typescript
interface Harness {
  id: number;           // 0-7
  name: string;         // SENSE, FUSE, etc.
  run(model: string, prompt: string): Promise<HarnessResult>;
}
```

### 3. Orchestration Patterns

Pattern codes use binary notation where each bit represents a power of 8:

| Pattern | Code | Topology | Description |
|---------|------|----------|-------------|
| 1-1     | :00  | `[1]`    | Single model |
| 8-1     | :10  | `[8,1]`  | Scatter-gather |
| 1-8     | :01  | `[1,8]`  | Broadcast |
| 8-1-8-1 | :1010| `[8,1,8,1]` | Double diamond |

```typescript
function parsePatternCode(code: string): number[] {
  // :10 → [8, 1], :01 → [1, 8], :1010 → [8, 1, 8, 1]
  const bits = code.replace(':', '').split('').reverse();
  return bits.map((b, i) => b === '1' ? Math.pow(8, i + 1) : 1);
}
```

### 4. Eval Ledger

```typescript
interface EvalLedger {
  append(result: HarnessResult): Promise<void>;
  verify(): Promise<{ valid: boolean; entries: number; firstCorrupt?: number }>;
  read(): AsyncIterable<HarnessResult>;
}
```

Hash chain: `hash_n = SHA256(JSON.stringify(entry_n) + hash_{n-1})`

### 5. Fitness Score Computation

```typescript
interface FitnessConfig {
  weights: Record<number, number>;  // harness_id → weight
}

function computeFitness(results: HarnessResult[], config: FitnessConfig): number {
  const totalWeight = Object.values(config.weights).reduce((a, b) => a + b, 0);
  const weightedSum = results.reduce((sum, r) => {
    return sum + r.scores.normalized * (config.weights[r.harness_id] || 1);
  }, 0);
  return weightedSum / totalWeight;  // 0.0 to 1.0
}
```

## Data Models

### Ledger Entry (JSONL line)

```json
{
  "harness_id": 0,
  "harness_name": "SENSE",
  "model": "llama3.2:3b",
  "scores": { "raw": 8, "normalized": 0.8 },
  "timestamp": "2026-01-07T12:00:00Z",
  "prev_hash": "abc123...",
  "hash": "def456...",
  "metadata": { "pattern": ":00", "stage": 0 }
}
```

### Fitness Config

```json
{
  "weights": {
    "0": 1.0,  "1": 1.0,  "2": 1.5,  "3": 1.0,
    "4": 1.2,  "5": 1.0,  "6": 1.0,  "7": 2.0
  }
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Hash Chain Integrity

*For any* sequence of ledger entries, each entry's hash SHALL equal `SHA256(JSON.stringify(entry) + prev_hash)`, and the first entry's prev_hash SHALL be a known genesis value.

**Validates: Requirements 1.2, 1.5, 6.1**

### Property 2: Append-Only Invariant

*For any* ledger state before and after an append operation, all entries that existed before the append SHALL remain unchanged (same content and same hash).

**Validates: Requirements 1.4**

### Property 3: Result Schema Validation

*For any* HarnessResult, it SHALL validate against the HarnessResultSchema, and any result that fails validation SHALL be rejected before logging.

**Validates: Requirements 7.2, 7.3**

### Property 4: Fitness Score Bounds

*For any* set of normalized harness scores and any valid weight configuration, the computed fitness score SHALL be in the range [0.0, 1.0].

**Validates: Requirements 4.2, 4.4**

### Property 5: Sequential Execution Order

*For any* evaluation run, harness execution timestamps SHALL be monotonically increasing in port order (0 < 1 < 2 < ... < 7).

**Validates: Requirements 2.2, 2.4**

### Property 6: Pattern Code Parsing Round-Trip

*For any* valid pattern code string, parsing then serializing SHALL produce an equivalent pattern code.

**Validates: Requirements 5.1, 5.6**

### Property 7: Verification Detects Tampering

*For any* valid ledger, if any entry is modified, the verify command SHALL return `valid: false` and report the correct `firstCorrupt` index.

**Validates: Requirements 6.1, 6.2**

## Error Handling

| Error | Handling |
|-------|----------|
| Ollama connection failure | Retry 3x with exponential backoff, then fail harness with score 0 |
| Schema validation failure | Reject result, log error, do not append to ledger |
| Hash chain corruption | Report first corrupt index, halt evaluation |
| Invalid pattern code | Reject with parse error, suggest valid patterns |

## Testing Strategy

### Unit Tests
- Schema validation (valid/invalid results)
- Pattern code parsing (all standard patterns + edge cases)
- Fitness computation (various weight configs)
- Hash computation (known inputs → known outputs)

### Property-Based Tests (fast-check)
- Property 1: Hash chain integrity across random entry sequences
- Property 2: Append-only invariant with random operations
- Property 3: Schema validation with random valid/invalid inputs
- Property 4: Fitness bounds with random scores and weights
- Property 6: Pattern code round-trip with random valid codes
- Property 7: Tampering detection with random modifications

### Integration Tests
- Full 8-harness run against mock Ollama
- Pattern execution (:00, :10, :01, :1010)
- Ledger verify command on valid/corrupted files

### Test Configuration
- Property tests: minimum 100 iterations
- Tag format: `Feature: map-elite-harness, Property N: {description}`
