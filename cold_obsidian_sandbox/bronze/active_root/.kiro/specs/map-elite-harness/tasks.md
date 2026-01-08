# Implementation Plan: MAP-ELITE Harness (Phase 1)

## Overview

Phase 1 implements the core evaluation loop: 8 harnesses, fitness scoring, orchestration patterns, and tamper-proof ledger. All code goes in `hot_obsidian_sandbox/bronze/map-elite/`.

## Tasks

- [x] 1. Set up project structure and schemas
  - Create `hot_obsidian_sandbox/bronze/map-elite/` directory
  - Create `schemas/harness-result.ts` with Zod HarnessResult schema
  - Create `schemas/fitness-config.ts` with weight configuration schema
  - Set up vitest config for the module
  - _Requirements: 7.1, 7.5_

- [ ]* 1.1 Write property test for schema validation
  - **Property 3: Result Schema Validation**
  - Test that valid results pass, invalid results are rejected
  - **Validates: Requirements 7.2, 7.3**

- [ ] 2. Implement Eval Ledger with hash chain
  - [x] 2.1 Create `ledger/eval-ledger.ts` with append and read functions
    - Implement JSONL file operations
    - Implement SHA-256 hash chain computation
    - Genesis hash: SHA-256("MAP-ELITE-GENESIS")
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 2.2 Write property test for hash chain integrity
    - **Property 1: Hash Chain Integrity**
    - Generate random entry sequences, verify hash chain
    - **Validates: Requirements 1.2, 1.5, 6.1**

  - [ ]* 2.3 Write property test for append-only invariant
    - **Property 2: Append-Only Invariant**
    - Verify entries unchanged after append operations
    - **Validates: Requirements 1.4**

  - [x] 2.4 Implement ledger verification
    - Create `verify()` function that checks entire hash chain
    - Return `{ valid, entries, firstCorrupt? }`
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ]* 2.5 Write property test for tampering detection
    - **Property 7: Verification Detects Tampering**
    - Modify random entries, verify detection
    - **Validates: Requirements 6.1, 6.2**

- [ ] 3. Checkpoint - Ledger tests pass
  - Ensure all ledger tests pass, ask the user if questions arise.

- [ ] 4. Implement fitness score computation
  - [x] 4.1 Create `fitness/compute-fitness.ts`
    - Implement weighted fitness calculation
    - Normalize scores to 0-1 range
    - _Requirements: 4.1, 4.3, 4.4_

  - [ ]* 4.2 Write property test for fitness bounds
    - **Property 4: Fitness Score Bounds**
    - Generate random scores and weights, verify 0 <= fitness <= 1
    - **Validates: Requirements 4.2, 4.4**

- [ ] 5. Implement orchestration pattern parsing
  - [ ] 5.1 Create `patterns/pattern-parser.ts`
    - Parse pattern codes (:00, :10, :01, :1010)
    - Convert to topology arrays [1], [8,1], [1,8], [8,1,8,1]
    - Support arbitrary binary patterns
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 5.2 Write property test for pattern code round-trip
    - **Property 6: Pattern Code Parsing Round-Trip**
    - Parse then serialize, verify equivalence
    - **Validates: Requirements 5.1, 5.6**

  - [ ] 5.3 Write unit tests for standard patterns
    - Test :00 → [1], :10 → [8,1], :01 → [1,8], :1010 → [8,1,8,1]
    - _Requirements: 5.2, 5.3, 5.4, 5.5_

- [ ] 6. Checkpoint - Core logic tests pass
  - Ensure all fitness and pattern tests pass, ask the user if questions arise.

- [ ] 7. Implement 8 harness stubs
  - [x] 7.1 Create `harnesses/harness.interface.ts`
    - Define Harness interface with id, name, run()
    - _Requirements: 2.1_

  - [x] 7.2 Create stub harnesses 0-7
    - `harnesses/h0-sense.ts` - basic QA stub
    - `harnesses/h1-fuse.ts` - multi-source reasoning stub
    - `harnesses/h2-shape.ts` - code generation stub
    - `harnesses/h3-deliver.ts` - instruction following stub
    - `harnesses/h4-disrupt.ts` - adversarial stub
    - `harnesses/h5-immunize.ts` - safety stub
    - `harnesses/h6-store.ts` - context retention stub
    - `harnesses/h7-decide.ts` - reasoning/HFO stub
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [ ] 8. Implement orchestrator
  - [x] 8.1 Create `orchestrator/run-evaluation.ts`
    - Execute harnesses sequentially in port order
    - Log results after each harness
    - Compute fitness after all 8 complete
    - _Requirements: 2.2, 2.4, 4.1_

  - [ ]* 8.2 Write property test for sequential execution order
    - **Property 5: Sequential Execution Order**
    - Verify timestamps monotonically increase
    - **Validates: Requirements 2.2, 2.4**

  - [ ] 8.3 Create `orchestrator/run-pattern.ts`
    - Execute orchestration patterns
    - Log each stage independently
    - _Requirements: 5.7_

- [ ] 9. Implement CLI entry point
  - [x] 9.1 Create `cli/index.ts`
    - `eval <model>` - run 8 harnesses on model
    - `pattern <model> <code>` - run orchestration pattern
    - `verify` - verify ledger integrity
    - _Requirements: 6.1_

- [ ] 10. Final checkpoint - All Phase 1 tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests
- All code in `hot_obsidian_sandbox/bronze/map-elite/`
- Use fast-check for property-based testing
- Minimum 100 iterations per property test
- Tag format: `Feature: map-elite-harness, Property N: {description}`
