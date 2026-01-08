# Implementation Plan: P4 Red Regnant 8 SCREAM Upgrade

## Overview

Refactoring P4 Red Regnant from a monolithic violation detector to a modular 8 SCREAM architecture. Each SCREAM type maps to one Legendary Commander and produces cryptographic receipts.

## Tasks

- [x] 1. Create SCREAM contracts and schemas
  - [x] 1.1 Create `contracts/screams.ts` with ScreamType enum and ScreamReceipt schema
    - Define 8 SCREAM types aligned with ports 0-7
    - Implement `createScreamReceipt()` with SHA-256 hashing
    - Implement `verifyScreamReceipt()` for integrity checking
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [x] 1.2 Create `contracts/detector.ts` with Detector interface
    - Define DetectorConfig, DetectorResult interfaces
    - Define Detector interface with detect() method
    - _Requirements: 1-8 (all detectors)_

  - [x]* 1.3 Write property test for SCREAM receipt integrity
    - **Property 1: SCREAM Receipt Integrity**
    - **Validates: Requirements 9.3, 9.4**

- [x] 2. Implement SCREAM_BLINDSPOT detector (Port 0)
  - [x] 2.1 Create `detectors/blindspot.ts`
    - Detect empty catch blocks
    - Detect empty then handlers
    - Detect @ignore-error annotations
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x]* 2.2 Write unit tests for blindspot detector (32 tests)
    - Test pattern matching accuracy
    - Test edge cases
    - _Requirements: 1.1, 11.1_

- [x] 3. Implement SCREAM_BREACH detector (Port 1)
  - [x] 3.1 Create `detectors/breach.ts`
    - Detect `any` types without @bespoke
    - Detect missing provenance headers
    - Detect Zod schema failures
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x]* 3.2 Write unit tests for breach detector (33 tests)
    - Test type safety violations
    - Test provenance checking
    - _Requirements: 2.1, 11.1_

- [x] 4. Implement SCREAM_THEATER detector (Port 2)
  - [x] 4.1 Create `detectors/theater.ts`
    - Detect assertionless tests
    - Detect mock overuse (>5 mocks)
    - Detect placeholder patterns
    - Detect 99%+ mutation scores
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x]* 4.2 Write unit tests for theater detector (26 tests)
    - Test placeholder detection
    - Test mock counting
    - _Requirements: 3.1, 11.1_

- [x] 5. Implement SCREAM_PHANTOM detector (Port 3)
  - [x] 5.1 Create `detectors/phantom.ts`
    - Detect CDN dependencies
    - Detect unpinned npm deps
    - Detect external API calls
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x]* 5.2 Write unit tests for phantom detector (27 tests)
    - Test CDN detection
    - Test dependency analysis
    - _Requirements: 4.1, 11.1_

- [x] 6. Implement SCREAM_MUTATION detector (Port 4)
  - [x] 6.1 Create `detectors/mutation.ts`
    - Detect scores < 80% (FAILURE)
    - Detect scores >= 99% (THEATER)
    - Detect missing reports
    - Detect malformed reports
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x]* 6.2 Write unit tests for mutation detector (30 tests)
    - Test score classification
    - Test report parsing
    - _Requirements: 5.1, 11.1_

- [x] 7. Checkpoint - First 5 detectors ✅
  - Run all tests for detectors 0-4: **148 tests passing**
  - Verify receipt generation: **All receipts verify correctly**

- [x] 8. Implement SCREAM_POLLUTION detector (Port 5)
  - [x] 8.1 Create `detectors/pollution.ts`
    - Detect unauthorized root files
    - Detect recursive sandbox loops
    - Detect medallion tier violations
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x]* 8.2 Write unit tests for pollution detector (28 tests)
    - Test root whitelist
    - Test recursive detection
    - _Requirements: 6.1, 11.1_

- [x] 9. Implement SCREAM_AMNESIA detector (Port 6)
  - [x] 9.1 Create `detectors/amnesia.ts`
    - Detect console.log/debug in Silver/Gold
    - Detect TODO/FIXME without @permitted
    - Detect missing API documentation
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x]* 9.2 Write unit tests for amnesia detector (26 tests)
    - Test debug log detection
    - Test debt detection
    - _Requirements: 7.1, 11.1_

- [x] 10. Implement SCREAM_LATTICE detector (Port 7)
  - [x] 10.1 Create `detectors/lattice.ts`
    - Detect folder density violations
    - Detect missing requirement traceability
    - Detect bypass annotations
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x]* 10.2 Write unit tests for lattice detector (26 tests)
    - Test octal limits
    - Test traceability checking
    - _Requirements: 8.1, 11.1_

- [x] 11. Checkpoint - All 8 detectors ✅
  - Run all tests for detectors 0-7: **228 tests passing**
  - Verify all receipts: **All receipts verify correctly**
  - Contracts + Detectors: **243 tests passing**

- [x] 12. Implement SCREAM Aggregator
  - [x] 12.1 Create `core/scream-aggregator.ts`
    - Instantiate all 8 detectors
    - Implement `performScreamAudit()` method
    - Implement Blood Book logging
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x]* 12.2 Write unit tests for aggregator (37 tests)
    - Test detector invocation
    - Test result aggregation
    - _Requirements: 10.1, 11.1_

  - [x]* 12.3 Write property test for aggregator completeness (11 tests)
    - **Property 5: Aggregator Completeness**
    - **Validates: Requirements 10.1, 10.2**

- [ ] 13. Write property tests for detector determinism
  - [ ]* 13.1 Write property test for detector determinism
    - **Property 2: Detector Determinism**
    - **Validates: Requirements 1-8**

  - [ ]* 13.2 Write property test for SCREAM type exclusivity
    - **Property 3: SCREAM Type Exclusivity**
    - **Validates: Requirements 1-8**

  - [ ]* 13.3 Write property test for port alignment
    - **Property 4: Port Alignment**
    - **Validates: Requirements 1-8**

- [ ] 14. Final checkpoint - Full system validation
  - Run all unit tests
  - Run all property tests (100 iterations)
  - Verify all receipts
  - Check mutation scores for each detector
  - Ask the user if questions arise

- [ ] 15. Integration with P5 Pyre Praetorian
  - [ ] 15.1 Update aggregator to call P5 on violations
    - Import danceDie from P5
    - Pass violations to P5 for enforcement
    - _Requirements: 10.5_

  - [ ]* 15.2 Write integration test for P4-P5 handoff
    - Test SCREAM → IMMUNIZE flow
    - _Requirements: 10.5, 11.5_

## Notes

- Tasks marked with `*` are optional test tasks
- Each detector should achieve Goldilocks mutation score (80-98.99%)
- All receipts must verify correctly before Silver promotion
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases

## Success Criteria

- [x] All 8 detectors implemented
- [x] All unit tests pass (291 tests: 243 detectors + 48 aggregator)
- [ ] All property tests pass (100 iterations each)
- [x] All receipts verify correctly
- [ ] Mutation score 80-98.99% for each detector
- [ ] Aggregator integrates with P5 Pyre Praetorian
