# Design Document

## Overview

This design promotes the BLINDSPOT detector from Bronze to Silver medallion. The promotion follows the Medallion Flow principle: code starts in Bronze, moves to Silver once tested and verified. BLINDSPOT is the first detector to achieve Goldilocks mutation score (80.95%), establishing the pattern for the remaining 7 SCREAM detectors.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SILVER MEDALLION                              │
│  hot_obsidian_sandbox/silver/2_areas/P4_RED_REGNANT/            │
├─────────────────────────────────────────────────────────────────┤
│  contracts/                                                      │
│    ├── screams.ts          (8 SCREAM types + receipts)          │
│    ├── screams.test.ts     (schema validation tests)            │
│    ├── detector.ts         (Detector interface + config)        │
│    └── detector.test.ts    (interface tests)                    │
│                                                                  │
│  detectors/                                                      │
│    ├── blindspot.ts        (Port 0 - SENSE)                     │
│    └── blindspot.test.ts   (76 tests, 80.95% mutation)          │
│                                                                  │
│  core/                                                           │
│    ├── score-classifier.ts (already in Silver)                  │
│    └── score-classifier.test.ts                                 │
│                                                                  │
│  SILVER_RECEIPT.json       (promotion metadata)                 │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. SCREAM Contracts (contracts/screams.ts)

```typescript
// 8 canonical SCREAM types aligned with Legendary Commanders
export const ScreamType = z.enum([
  'SCREAM_BLINDSPOT',  // Port 0 - Lidless Legion - SENSE
  'SCREAM_BREACH',     // Port 1 - Web Weaver - FUSE
  'SCREAM_THEATER',    // Port 2 - Mirror Magus - SHAPE
  'SCREAM_PHANTOM',    // Port 3 - Spore Storm - DELIVER
  'SCREAM_MUTATION',   // Port 4 - Red Regnant - DISRUPT
  'SCREAM_POLLUTION',  // Port 5 - Pyre Praetorian - IMMUNIZE
  'SCREAM_AMNESIA',    // Port 6 - Kraken Keeper - STORE
  'SCREAM_LATTICE',    // Port 7 - Spider Sovereign - DECIDE
]);

// Cryptographically verifiable receipt
export interface ScreamReceipt {
  type: ScreamType;
  port: number;           // 0-7
  timestamp: number;
  file: string;
  details: Record<string, unknown>;
  severity: 'warning' | 'error' | 'critical';
  receiptHash: string;    // sha256:...
}

// Receipt creation with SHA-256 hash
export function createScreamReceipt(...): ScreamReceipt;

// Verify receipt integrity (anti-tampering)
export function verifyScreamReceipt(receipt: ScreamReceipt): boolean;
```

### 2. Detector Interface (contracts/detector.ts)

```typescript
export interface Detector {
  readonly name: string;
  readonly port: number;           // 0-7
  readonly screamType: ScreamType;
  readonly description: string;
  
  detect(
    targetPath: string, 
    config?: Partial<DetectorConfig>
  ): Promise<DetectorResult>;
}

export interface DetectorConfig {
  enabled: boolean;
  severity: ScreamSeverity;
  excludeDirs: string[];
  fileExtensions: string[];
}

export interface DetectorResult {
  screamType: ScreamType;
  receipts: ScreamReceipt[];
  filesScanned: number;
  violationsFound: number;
  duration: number;
}
```

### 3. BLINDSPOT Detector (detectors/blindspot.ts)

```typescript
export const BLINDSPOT_PATTERNS = {
  EMPTY_CATCH: /catch\s*\([^)]*\)\s*\{\s*\}/g,
  EMPTY_THEN: /\.then\(\s*\(\)\s*=>\s*\{\s*\}\s*\)/g,
  IGNORE_ERROR: /\/\/\s*@ignore-error/gi,
  EMPTY_FINALLY: /finally\s*\{\s*\}/g,
  CATCH_CONSOLE_ONLY: /catch\s*\([^)]*\)\s*\{\s*console\.(log|warn)\([^)]*\);\s*\}/g,
  ASYNC_NO_TRY: /async\s+function\s+\w+\s*\([^)]*\)\s*\{(?![\s\S]*try\s*\{)/g,
  PROMISE_NO_CATCH: /new\s+Promise\s*\([^)]*\)(?![\s\S]*\.catch)/g,
};

export class BlindspotDetector implements Detector {
  readonly name = 'SCREAM_BLINDSPOT';
  readonly port = 0;
  readonly screamType = 'SCREAM_BLINDSPOT';
  
  async detect(targetPath: string, config?: Partial<DetectorConfig>): Promise<DetectorResult>;
}
```

## Data Models

### SILVER_RECEIPT.json

```json
{
  "promotion": {
    "from": "bronze",
    "to": "silver",
    "timestamp": "2026-01-07T22:00:00.000Z",
    "generation": 88
  },
  "artifacts": [
    {
      "path": "contracts/screams.ts",
      "tests": "contracts/screams.test.ts",
      "status": "verified"
    },
    {
      "path": "contracts/detector.ts", 
      "tests": "contracts/detector.test.ts",
      "status": "verified"
    },
    {
      "path": "detectors/blindspot.ts",
      "tests": "detectors/blindspot.test.ts",
      "mutationScore": 80.95,
      "testCount": 76,
      "status": "goldilocks"
    }
  ],
  "verification": {
    "realCodebaseScan": true,
    "filesScanned": 206,
    "violationsFound": 30,
    "receiptIntegrity": "all_valid"
  }
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Receipt Hash Integrity
*For any* SCREAM receipt created by the BLINDSPOT detector, verifying the receipt SHALL return true (hash matches content).
**Validates: Requirements 3.2**

### Property 2: Detector Port Alignment
*For any* BLINDSPOT detector instance, the port SHALL always be 0 and screamType SHALL always be 'SCREAM_BLINDSPOT'.
**Validates: Requirements 1.1**

### Property 3: File Scanning Completeness
*For any* directory scan, filesScanned SHALL equal the count of files matching the configured extensions that are not in excluded directories.
**Validates: Requirements 3.4**

### Property 4: Violation Detection Accuracy
*For any* file containing a BLINDSPOT pattern, the detector SHALL produce at least one receipt with the correct patternName.
**Validates: Requirements 3.1, 3.3**

### Property 5: Silver Test Parity
*For any* test in Bronze blindspot.test.ts, an equivalent test SHALL exist in Silver blindspot.test.ts and SHALL pass.
**Validates: Requirements 1.2, 1.3**

## Error Handling

1. **Non-existent paths**: Return empty result with filesScanned=0
2. **Unreadable files**: Skip silently, continue scanning
3. **Invalid config**: Merge with defaults, never crash
4. **Empty directories**: Return valid result with filesScanned=0

## Testing Strategy

### Unit Tests (blindspot.test.ts)
- Pattern detection for each BLINDSPOT_PATTERN
- Directory scanning and exclusion
- Receipt generation and validation
- Configuration handling
- Edge cases (empty files, non-existent paths)

### Integration Tests (blindspot.integration.test.ts)
- Real codebase scanning
- Planted violation detection
- Receipt integrity verification
- Performance benchmarks

### Property Tests
- Receipt hash integrity (round-trip)
- Port/type alignment invariants
- Scan completeness properties

### Mutation Testing
- Target: 80%+ (Goldilocks)
- Current: 80.95%
- Tool: Stryker
