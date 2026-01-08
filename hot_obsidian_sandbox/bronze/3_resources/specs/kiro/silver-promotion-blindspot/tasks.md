# Implementation Plan: Silver Promotion - BLINDSPOT Detector

## Overview

Promote the BLINDSPOT detector (Port 0) from Bronze to Silver medallion. Execute piece by piece, verifying each component works before proceeding.

## Tasks

- [x] 1. Promote SCREAM contracts to Silver
  - [x] 1.1 Copy contracts/screams.ts to Silver with provenance header
    - Source: `bronze/2_areas/hfo_ports/P4_RED_REGNANT/contracts/screams.ts`
    - Target: `silver/2_areas/P4_RED_REGNANT/contracts/screams.ts`
    - Update tier annotation from BRONZE to SILVER
    - _Requirements: 1.6, 2.1_
  - [x] 1.2 Create contracts/screams.test.ts in Silver
    - Test ScreamType enum validation
    - Test ScreamReceipt schema validation
    - Test createScreamReceipt function
    - Test verifyScreamReceipt function
    - _Requirements: 2.3, 2.4_
  - [x] 1.3 Copy contracts/detector.ts to Silver with provenance header
    - Source: `bronze/2_areas/hfo_ports/P4_RED_REGNANT/contracts/detector.ts`
    - Target: `silver/2_areas/P4_RED_REGNANT/contracts/detector.ts`
    - Update tier annotation from BRONZE to SILVER
    - _Requirements: 1.5, 2.2_
  - [x] 1.4 Create contracts/detector.test.ts in Silver
    - Test DetectorConfig schema validation
    - Test DetectorResult schema validation
    - Test mergeConfig function
    - Test shouldScanFile function
    - _Requirements: 2.3, 2.4_

- [x] 2. Checkpoint - Verify contracts work
  - Run tests: `npx vitest run hot_obsidian_sandbox/silver/2_areas/P4_RED_REGNANT/contracts`
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Promote BLINDSPOT detector to Silver
  - [x] 3.1 Copy detectors/blindspot.ts to Silver with provenance header
    - Source: `bronze/2_areas/hfo_ports/P4_RED_REGNANT/detectors/blindspot.ts`
    - Target: `silver/2_areas/P4_RED_REGNANT/detectors/blindspot.ts`
    - Update tier annotation from BRONZE to SILVER
    - Update import paths to use Silver contracts
    - _Requirements: 1.1_
  - [x] 3.2 Copy detectors/blindspot.test.ts to Silver
    - Source: `bronze/2_areas/hfo_ports/P4_RED_REGNANT/detectors/blindspot.test.ts`
    - Target: `silver/2_areas/P4_RED_REGNANT/detectors/blindspot.test.ts`
    - Update import paths to use Silver modules
    - _Requirements: 1.2_
  - [x] 3.3 Copy detectors/blindspot.integration.test.ts to Silver
    - Source: `bronze/2_areas/hfo_ports/P4_RED_REGNANT/detectors/blindspot.integration.test.ts`
    - Target: `silver/2_areas/P4_RED_REGNANT/detectors/blindspot.integration.test.ts`
    - Update import paths
    - _Requirements: 3.1, 3.3_

- [x] 4. Checkpoint - Verify BLINDSPOT detector works
  - Run tests: `npx vitest run hot_obsidian_sandbox/silver/2_areas/P4_RED_REGNANT/detectors`
  - Ensure all 76+ tests pass
  - Verify integration tests scan real codebase
  - _Requirements: 1.3, 3.1, 3.4_

- [x] 5. Create SILVER_RECEIPT.json
  - [x] 5.1 Generate promotion receipt with metadata
    - Include promotion timestamp
    - Include artifact list with test counts
    - Include mutation score (80.95%)
    - Include verification results
    - _Requirements: 4.1, 4.3_

- [x] 6. Log promotion to Blackboard
  - [x] 6.1 Append promotion entry to hot_obsidianblackboard.jsonl
    - Type: PROMOTION
    - Mark: BLINDSPOT_SILVER_PROMOTION
    - Include artifact paths and verification status
    - _Requirements: 4.2_

- [x] 7. Final checkpoint - Full verification
  - Run all Silver P4 tests: `npx vitest run hot_obsidian_sandbox/silver/2_areas/P4_RED_REGNANT`
  - Verify all tests pass
  - Confirm SILVER_RECEIPT.json is valid
  - Confirm Blackboard entry exists

## Notes

- Execute tasks in order - each builds on the previous
- Verify each checkpoint before proceeding
- All imports must use relative paths within Silver
- Provenance headers must reference this spec
