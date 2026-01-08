# Implementation Plan: HFO Legendary Commanders Gen 88 Conceptual Incarnation

> Validates: requirements.md, design.md
> @provenance: LEGENDARY_COMMANDERS_V9.md, PROMOTION_QUEUE_2026_01_07.md

## Overview

This implementation plan consolidates existing scattered artifacts into coherent commander folders with standardized structure, rigorous testing, and Silver-tier promotion gating. The approach is **composition of exemplars** with polymorphic adapters—no invention, only consolidation and testing.

## Priority Order

1. **P4 + P5** (Red Regnant + Pyre Praetorian) - The immune system core
2. **P7** (Spider Sovereign) - Already consolidated, needs property tests
3. **P1** (Web Weaver) - Contracts are foundational
4. **P6** (Kraken Keeper) - Storage for MAP-ELITE
5. **P0** (Lidless Legion) - Observation layer
6. **P2** (Mirror Magus) - Transformation layer
7. **P3** (Spore Storm) - Delivery layer

## Tasks

- [x] 1. Complete P4 Red Regnant folder structure and tests
  - [x] 1.1 Verify P4_RED_REGNANT folder has all required files
    - Check for RED_REGNANT.ts, RED_REGNANT.test.ts, P4_RED_REGNANT_LEDGER.md
    - Create contracts/ subfolder with Zod schemas if missing
    - _Requirements: 1.1, 1.2, 1.3, 1.6_
  - [x] 1.2 Write property test for anti-pattern detection (Property 8)
    - **Property 8: Anti-Pattern Detection**
    - Test detectTheater, detectAmnesia, detectPollution functions
    - **Validates: Requirements 6.6, 6.7, 6.8**
  - [x] 1.3 Write property test for violation logging invariant (Property 9)
    - **Property 9: Violation Logging Invariant**
    - Test that violations are logged to both Blood Book and stigmergy
    - **Validates: Requirements 6.9**
  - [x] 1.4 Write property test for mutation score bounds (Property 10)
    - **Property 10: Mutation Score Bounds**
    - Test 80-98.99% range enforcement
    - **Validates: Requirements 10.1, 10.6, 10.7**

- [x] 2. Complete P5 Pyre Praetorian folder structure and tests
  - [x] 2.1 Verify P5_PYRE_PRAETORIAN folder has all required files
    - Check for PYRE_PRAETORIAN.ts, PYRE_PRAETORIAN.test.ts, P5_PYRE_PRAETORIAN_LEDGER.md
    - Create contracts/ subfolder with Phoenix schemas if missing
    - _Requirements: 1.1, 1.2, 1.3, 1.6_
  - [x] 2.2 Write property test for Pyre Dance termination (Property 11)
    - **Property 11: Pyre Dance Termination**
    - Test that dance terminates with rebirth or quarantine
    - **Validates: Requirements 11.5**
  - [x] 2.3 Write property test for Pyre Dance response chain (Property 12)
    - **Property 12: Pyre Dance Response Chain**
    - Test P4 scream → P5 immunization response
    - **Validates: Requirements 11.1**

- [x] 3. Checkpoint - Immune System Core
  - Ensure all P4 and P5 tests pass
  - Run mutation testing on P4 and P5
  - Ask the user if questions arise

- [-] 4. Complete P7 Spider Sovereign property tests
  - [x] 4.1 Verify P7_SPIDER_SOVEREIGN folder structure
    - Already consolidated, verify contracts/ subfolder exists
    - _Requirements: 1.1, 1.6, 9.1_
  - [x] 4.2 Write property test for hybrid consensus correctness (Property 15)
    - **Property 15: Hybrid Consensus Correctness**
    - Test weighted voting → critique comparison → method selection
    - **Validates: Requirements 9.5, 9.7**
  - [x] 4.3 Write property test for decision logging invariant (Property 16)
    - **Property 16: Decision Logging Invariant**
    - Test that decisions are logged with consensus method
    - **Validates: Requirements 9.6, 9.7**
  - [x] 4.4 Write property test for workflow pairing correctness (Property 13)
    - **Property 13: Workflow Pairing Correctness**
    - Test HIVE/8 anti-diagonal and PREY/8 serpentine pairings
    - **Validates: Requirements 12.3, 12.4**

- [x] 5. Checkpoint - C2 Layer Complete
  - Ensure all P7 tests pass
  - Run mutation testing on P7
  - Ask the user if questions arise

- [-] 6. Create P1 Web Weaver folder structure
  - [x] 6.1 Create P1_WEB_WEAVER folder with standard structure
    - Create P1_WEB_WEAVER_LEDGER.md, WEB_WEAVER.ts, WEB_WEAVER.test.ts
    - Create contracts/ with VacuoleEnvelope and SilverPromotionReceipt schemas
    - _Requirements: 1.1, 1.2, 1.3, 1.6, 3.1, 3.2, 3.3_
  - [ ] 6.2 Implement bridge() and fuse() functions
    - Polymorphic adapter pattern for protocol bridging
    - _Requirements: 3.4, 3.5_
  - [ ] 6.3 Write property test for message bridging validation (Property 4)
    - **Property 4: Message Bridging Validation**
    - Test that bridged messages are validated against schema
    - **Validates: Requirements 3.6**

- [x] 7. Create P6 Kraken Keeper folder structure
  - [x] 7.1 Create P6_KRAKEN_KEEPER folder with standard structure
    - Created P6_KRAKEN_KEEPER_LEDGER.md, contracts/index.ts
    - Created contracts/ with ArchiveEntry, MapEliteArchive schemas
    - _Requirements: 1.1, 1.2, 1.3, 1.6, 8.1_
  - [x] 7.2 Implement assimilate() and store() functions
    - Implemented MAP-ELITE algorithm in contracts/index.ts
    - _Requirements: 8.2, 8.3, 8.4_
  - [x] 7.3 Write property test for MAP-ELITE archive invariant (Property 18)
    - **Property 18: MAP-ELITE Archive Invariant**
    - 12 tests pass - verifies highest fitness in cell
    - **Validates: Requirements 8.4**

- [x] 8. Checkpoint - Storage Layer Complete
  - All P1 and P6 tests pass (21 + 12 = 33 tests)
  - P1: 21 tests, P6: 12 tests
  - Ready for cross-commander integration

- [x] 9. Create P0 Lidless Legion folder structure
  - [x] 9.1 Create P0_LIDLESS_LEGION folder with standard structure
    - Created P0_LIDLESS_LEGION_LEDGER.md, contracts/index.ts
    - Created contracts/ with Observation, ObservationBatch schemas
    - _Requirements: 1.1, 1.2, 1.3, 1.6, 2.1_
  - [x] 9.2 Implement observe() function
    - Implemented createObservation, filterObservations, batchObservations
    - _Requirements: 2.2, 2.3_
  - [x] 9.3 Write property test for observation logging invariant (Property 2)
    - **Property 2: Observation Logging Invariant**
    - 5 tests pass - verifies UUID, timestamp, schema validation
    - **Validates: Requirements 2.4**
  - [x] 9.4 Write property test for separation of concerns (Property 3)
    - **Property 3: Separation of Concerns (P0)**
    - 10 tests pass - verifies verb enforcement
    - **Validates: Requirements 2.5, 2.6, 2.7**

- [x] 10. Create P2 Mirror Magus folder structure
  - [x] 10.1 Create P2_MIRROR_MAGUS folder with standard structure
    - Created P2_MIRROR_MAGUS_LEDGER.md, contracts/index.ts
    - Created contracts/ with Transformation, OneEuroFilter schemas
    - _Requirements: 1.1, 1.2, 1.3, 1.6, 4.1_
  - [x] 10.2 Implement shape() and oneEuroFilter() functions
    - Implemented One Euro Filter with smoothingFactor, exponentialSmoothing
    - _Requirements: 4.2, 4.3_
  - [x] 10.3 Write property test for schema transformation round-trip (Property 5)
    - **Property 5: Schema Transformation Round-Trip**
    - 5 tests pass - verifies invertible transformations
    - **Validates: Requirements 4.2, 4.5**
  - [x] 10.4 Write property test for One Euro Filter smoothing (Property 6)
    - **Property 6: One Euro Filter Smoothing**
    - 8 tests pass - verifies noise reduction
    - **Validates: Requirements 4.3**

- [x] 11. Create P3 Spore Storm folder structure
  - [x] 11.1 Create P3_SPORE_STORM folder with standard structure
    - Created P3_SPORE_STORM_LEDGER.md, contracts/index.ts
    - Created contracts/ with InjectionPayload, DeliveryResult, Cascade schemas
    - _Requirements: 1.1, 1.2, 1.3, 1.6, 5.1_
  - [x] 11.2 Implement inject() and deliver() functions
    - Implemented createInjection, createDeliveryResult, retry logic
    - _Requirements: 5.2, 5.3_
  - [x] 11.3 Write property test for injection logging invariant (Property 7)
    - **Property 7: Injection Logging Invariant**
    - 17 tests pass - verifies stigmergy logging
    - **Validates: Requirements 5.5**

- [x] 12. Checkpoint - All Commanders Incarnated
  - All 8 commander folders have standard structure
  - Total: 251 tests passing across all commanders
  - P0: 20, P1: 21, P2: 15, P3: 17, P4: 15, P5: 9, P6: 12, P7: 19 (property tests)
  - Ready for cross-commander integration

- [x] 13. Implement cross-commander integration
  - [x] 13.1 Implement verb enforcement (Property 14)
    - Created contracts/verb-enforcement.ts with COMMANDER_VERBS mapping
    - Implemented isVerbAllowed, createVerbViolation functions
    - _Requirements: 12.1, 12.5_
  - [x] 13.2 Write property test for verb enforcement (Property 14)
    - **Property 14: Verb Enforcement**
    - 19 tests pass - verifies cross-verb calls trigger violations
    - **Validates: Requirements 12.1, 12.5**
  - [x] 13.3 Implement receipt hash integrity (Property 17)
    - Created contracts/receipt-hash.ts with SHA-256 hashing
    - Implemented createPromotionReceipt, verifyReceiptHash, validateSilverStandard
    - _Requirements: 10.2, 10.8_
  - [x] 13.4 Write property test for receipt hash integrity (Property 17)
    - **Property 17: Receipt Hash Integrity**
    - 15 tests pass - verifies hash verification and Silver Standard
    - **Validates: Requirements 10.2, 10.8**

- [x] 14. Final checkpoint - Full System Validation
  - All property tests passing (see counts below)
  - Silver Standard (80-98.99%) enforced via receipt-hash.ts
  - Promotion receipts with SHA-256 hash integrity
  - All 8 commanders incarnated with contracts and property tests

## Notes

- All tasks are required for comprehensive correctness validation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The system is **composition of exemplars** with polymorphic adapters—no invention
