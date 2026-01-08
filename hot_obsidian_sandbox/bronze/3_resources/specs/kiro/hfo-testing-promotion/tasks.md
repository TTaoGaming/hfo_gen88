# Implementation Plan: HFO Testing & Silver Promotion

## Overview

This plan extracts pure components from bronze MAP-ELITE to silver tier with comprehensive testing. Each component is tested with unit tests, property-based tests, and mutation testing before promotion.

## Tasks

- [x] 1. Set up silver testing infrastructure
  - [x] 1.1 Create silver directory structure for extracted components
    - Create `hot_obsidian_sandbox/silver/ledger/`, `schemas/`, `fitness/`, `concurrency/`
    - _Requirements: 8.4_
  - [x] 1.2 Configure Stryker for silver mutation testing
    - Create `stryker.silver.config.mjs` targeting silver components
    - Set threshold to 80% break
    - _Requirements: 6.1, 6.2, 6.3_
  - [x] 1.3 Configure vitest for property tests
    - Add fast-check dependency
    - Create vitest config for silver with 100+ iterations
    - _Requirements: 7.1_

- [x] 2. Extract and test Ledger core
  - [x] 2.1 Extract pure ledger functions to silver
    - Move `computeHash()` and `verifyChain()` to `silver/ledger/ledger-core.ts`
    - Keep I/O functions in bronze wrapper
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 2.2 Write unit tests for ledger core
    - Test genesis hash initialization
    - Test single entry hash computation
    - Test chain verification with valid/invalid chains
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 2.3 Write property test: Ledger append-read round-trip
    - **Property 1: Ledger Append-Read Round-Trip**
    - **Validates: Requirements 1.4**
  - [x] 2.4 Write property test: Ledger hash-chain integrity
    - **Property 2: Ledger Hash-Chain Integrity**
    - **Validates: Requirements 1.1, 1.2, 1.5**

- [x] 3. Checkpoint - Verify ledger tests
  - Ensure all ledger tests pass, ask the user if questions arise.

- [x] 4. Extract and test Schema module
  - [x] 4.1 Extract schemas to silver
    - Move `HarnessResultSchema` to `silver/schemas/harness-result.ts`
    - Add validation helper functions
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 4.2 Write unit tests for schema validation
    - Test boundary values (harness_id 0, 7, -1, 8)
    - Test score boundaries (0, 1, -0.1, 1.1)
    - Test timestamp format validation
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [x] 4.3 Write property test: Schema validation boundaries
    - **Property 3: Schema Validation Boundaries**
    - **Validates: Requirements 2.1, 2.2, 2.3**
  - [x] 4.4 Write property test: Schema round-trip
    - **Property 4: Schema Round-Trip**
    - **Validates: Requirements 2.5**

- [x] 5. Checkpoint - Verify schema tests
  - Ensure all schema tests pass, ask the user if questions arise.

- [x] 6. Extract and test Fitness module
  - [x] 6.1 Extract fitness calculator to silver
    - Move `computeFitness()` to `silver/fitness/compute-fitness.ts`
    - Extract `weightedAverage()` as pure helper
    - _Requirements: 3.1, 3.2_
  - [x] 6.2 Write unit tests for fitness calculator
    - Test equal weights (arithmetic mean)
    - Test custom weights
    - Test empty results (returns 0)
    - _Requirements: 3.1, 3.2, 3.3_
  - [x] 6.3 Write property test: Fitness weighted average correctness
    - **Property 5: Fitness Weighted Average Correctness**
    - **Validates: Requirements 3.1, 3.2**
  - [x] 6.4 Write property test: Fitness bounded output
    - **Property 6: Fitness Bounded Output**
    - **Validates: Requirements 3.4**
  - [x] 6.5 Write property test: Fitness idempotence
    - **Property 7: Fitness Idempotence**
    - **Validates: Requirements 3.5**

- [x] 7. Checkpoint - Verify fitness tests
  - Ensure all fitness tests pass, ask the user if questions arise.

- [x] 8. Extract and test Semaphore module
  - [x] 8.1 Extract Semaphore to silver
    - Move `Semaphore` class to `silver/concurrency/semaphore.ts`
    - Add `available()` method for testing
    - _Requirements: 5.1, 5.5_
  - [x] 8.2 Write unit tests for Semaphore
    - Test acquire/release cycle
    - Test blocking when permits exhausted
    - Test release restores permits
    - _Requirements: 5.1, 5.5_
  - [x] 8.3 Write property test: Semaphore concurrency limit
    - **Property 9: Semaphore Concurrency Limit**
    - **Validates: Requirements 5.5**

- [x] 9. Checkpoint - Verify semaphore tests
  - Ensure all semaphore tests pass, ask the user if questions arise.

- [x] 10. Extract and test Provider Detection
  - [x] 10.1 Extract detectProvider to silver
    - Move `detectProvider()` to `silver/model-client/provider-detection.ts`
    - _Requirements: 4.1, 4.2_
  - [x] 10.2 Write unit tests for provider detection
    - Test "model" → ollama
    - Test "org/model" → openrouter
    - Test edge cases (empty string, multiple slashes)
    - _Requirements: 4.1, 4.2_
  - [x] 10.3 Write property test: Provider detection determinism
    - **Property 8: Provider Detection Determinism**
    - **Validates: Requirements 4.1, 4.2, 4.5**

- [x] 11. Run mutation testing on silver components
  - [x] 11.1 Run Stryker on ledger module
    - Target: >80% mutation score
    - Fix any surviving mutants by adding tests
    - _Requirements: 6.1_
  - [x] 11.2 Run Stryker on schema module
    - Target: >80% mutation score
    - _Requirements: 6.3_
  - [x] 11.3 Run Stryker on fitness module
    - Target: >80% mutation score
    - _Requirements: 6.2_
  - [x] 11.4 Run Stryker on semaphore module
    - Target: >80% mutation score
    - _Requirements: 6.1_

- [x] 12. Final checkpoint - Silver promotion gate
  - Verify all unit tests pass
  - Verify all property tests pass (100+ iterations each)
  - Verify mutation score >80% for all silver components
  - Ensure test files co-located with implementations
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 13. Update bronze wrappers to use silver modules
  - [x] 13.1 Update bronze ledger to import silver core
    - Keep I/O in bronze, use silver for hash computation
    - _Requirements: 1.1_
  - [x] 13.2 Update bronze runner to import silver modules
    - Import Semaphore, Fitness from silver
    - _Requirements: 5.1_
  - [x] 13.3 Verify bronze integration tests still pass
    - Run existing MAP-ELITE CLI commands
    - _Requirements: 5.2, 5.3, 5.4_

## Notes

- All property tests are required for comprehensive coverage
- Each silver module must have co-located test file (e.g., `ledger-core.test.ts`)
- Property tests use fast-check with minimum 100 iterations
- Mutation testing uses Stryker with 80% break threshold
- Bronze wrappers remain in bronze tier (I/O, API calls)
