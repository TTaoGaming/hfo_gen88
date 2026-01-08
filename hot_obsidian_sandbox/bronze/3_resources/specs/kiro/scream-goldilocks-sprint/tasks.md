# Implementation Plan: SCREAM Goldilocks Sprint

> @provenance: requirements.md, design.md
> Validates: Gen 88 Canalization Rules

## Overview

This sprint brings all 8 SCREAM detectors to Goldilocks range (80-98.99%) and promotes them to Silver with tamper-evident Stryker receipts.

## Current Status

| Port | SCREAM | Score | Status |
|:----:|:-------|------:|:------:|
| 0 | BLINDSPOT | 80.95% | ✅ SILVER |
| 1 | BREACH | 87.60% | ✅ GOLDILOCKS (promote) |
| 5 | POLLUTION | 88.78% | ✅ GOLDILOCKS (promote) |
| 7 | LATTICE | 89.88% | ✅ GOLDILOCKS (promote) |
| 4 | MUTATION | 54.25% | 🔴 NEXT |
| 2 | THEATER | 53.19% | 🔴 |
| 3 | PHANTOM | 50.34% | 🔴 |
| 6 | AMNESIA | 45.50% | 🔴 |

## Tasks

- [-] 1. Promote BREACH to Silver (Port 1) ✅ 87.60% GOLDILOCKS
  - [x] 1.1 Copy breach.ts to silver/2_areas/P4_RED_REGNANT/detectors/
    - _Requirements: 1.1_
  - [x] 1.2 Copy breach.test.ts to silver/2_areas/P4_RED_REGNANT/detectors/
    - _Requirements: 1.2_
  - [x] 1.3 Generate SHA-256 hash of breach.ts source
    - _Requirements: 8.3_
  - [x] 1.4 Update SILVER_RECEIPT.json with BREACH commander entry
    - Include: port 1, score 87.60%, sourceHash, strykerShard
    - _Requirements: 1.3, 8.1, 8.2, 8.5, 8.6_
  - [ ] 1.5 Log promotion to hot_obsidianblackboard.jsonl
    - _Requirements: 1.4, 8.7_

- [ ] 2. Promote POLLUTION to Silver (Port 5) ✅ 88.78% GOLDILOCKS
  - [ ] 2.1 Copy pollution.ts to silver/2_areas/P4_RED_REGNANT/detectors/
    - _Requirements: 2.1_
  - [ ] 2.2 Copy pollution.test.ts to silver/2_areas/P4_RED_REGNANT/detectors/
    - _Requirements: 2.2_
  - [ ] 2.3 Generate SHA-256 hash of pollution.ts source
    - _Requirements: 8.3_
  - [ ] 2.4 Update SILVER_RECEIPT.json with POLLUTION commander entry
    - Include: port 5, score 88.78%, sourceHash, strykerShard
    - _Requirements: 2.3, 8.1, 8.2, 8.5, 8.6_
  - [ ] 2.5 Log promotion to hot_obsidianblackboard.jsonl
    - _Requirements: 2.4, 8.7_

- [ ] 3. Promote LATTICE to Silver (Port 7) ✅ 89.88% GOLDILOCKS
  - [ ] 3.1 Copy lattice.ts to silver/2_areas/P4_RED_REGNANT/detectors/
    - _Requirements: 3.1_
  - [ ] 3.2 Copy lattice.test.ts to silver/2_areas/P4_RED_REGNANT/detectors/
    - _Requirements: 3.2_
  - [ ] 3.3 Generate SHA-256 hash of lattice.ts source
    - _Requirements: 8.3_
  - [ ] 3.4 Update SILVER_RECEIPT.json with LATTICE commander entry
    - Include: port 7, score 89.88%, sourceHash, strykerShard
    - _Requirements: 3.3, 8.1, 8.2, 8.5, 8.6_
  - [ ] 3.5 Log promotion to hot_obsidianblackboard.jsonl
    - _Requirements: 3.4, 8.7_

- [ ] 4. Checkpoint - Verify 4/8 Commanders in Silver
  - Run Silver P4 tests: `npx vitest run hot_obsidian_sandbox/silver/2_areas/P4_RED_REGNANT`
  - Verify SILVER_RECEIPT.json has 4 commanders (BLINDSPOT, BREACH, POLLUTION, LATTICE)
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. MUTATION Detector (Port 4) → 80%+
  - [ ] 5.1 Run Stryker to identify surviving mutants
    - Command: `npx stryker run hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P4_RED_REGNANT/stryker-shards/shard-4-mutation.mjs`
    - Current: 54.25%
    - _Requirements: 4.1_
  - [ ] 5.2 Add mutation-killing tests for score classification
    - Test exact boundary values (80, 98.99)
    - Test Goldilocks range detection
    - _Requirements: 4.2_
  - [ ] 5.3 Add mutation-killing tests for Goldilocks checking
    - Test below threshold (<80)
    - Test above threshold (>98.99)
    - Test within range (80-98.99)
    - _Requirements: 4.3_
  - [ ] 5.4 Add mutation-killing tests for Theater detection
    - Test 100% score detection
    - Test 99%+ score detection
    - _Requirements: 4.4_
  - [ ] 5.5 Add mutation-killing tests for report parsing
    - Test JSON parsing
    - Test directory traversal
    - _Requirements: 4.5_
  - [ ] 5.6 Re-run Stryker to verify 80%+
    - _Requirements: 4.1_
  - [ ] 5.7 Promote to Silver with tamper-evident receipt
    - Copy files, generate hash, update receipt, log to Blackboard
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [ ] 6. THEATER Detector (Port 2) → 80%+
  - [ ] 6.1 Run Stryker to identify surviving mutants
    - Command: `npx stryker run hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P4_RED_REGNANT/stryker-shards/shard-2-theater.mjs`
    - Current: 53.19%
    - _Requirements: 5.1_
  - [ ] 6.2 Add mutation-killing tests for assertionless detection
    - Test tests without expect()
    - Test tests with only console.log
    - _Requirements: 5.2_
  - [ ] 6.3 Add mutation-killing tests for mock-overuse
    - Test excessive mocking patterns
    - Test mock count thresholds
    - _Requirements: 5.3_
  - [ ] 6.4 Add mutation-killing tests for reward hacking
    - Test suspicious test patterns
    - Test trivial assertions
    - _Requirements: 5.4_
  - [ ] 6.5 Add mutation-killing tests for file scanning
    - Test directory traversal
    - Test file filtering
    - _Requirements: 5.5_
  - [ ] 6.6 Re-run Stryker to verify 80%+
    - _Requirements: 5.1_
  - [ ] 6.7 Promote to Silver with tamper-evident receipt
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [ ] 7. PHANTOM Detector (Port 3) → 80%+
  - [ ] 7.1 Run Stryker to identify surviving mutants
    - Command: `npx stryker run hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P4_RED_REGNANT/stryker-shards/shard-3-phantom.mjs`
    - Current: 50.34%
    - _Requirements: 6.1_
  - [ ] 7.2 Add mutation-killing tests for dead code detection
    - Test unreachable code patterns
    - Test unused variable detection
    - _Requirements: 6.2_
  - [ ] 7.3 Add mutation-killing tests for unreachable branches
    - Test always-true/false conditions
    - Test dead else branches
    - _Requirements: 6.3_
  - [ ] 7.4 Add mutation-killing tests for phantom dependencies
    - Test unused imports
    - Test phantom package.json entries
    - _Requirements: 6.4_
  - [ ] 7.5 Add mutation-killing tests for package.json scanning
    - Test dependency version patterns
    - Test wildcard detection
    - _Requirements: 6.5_
  - [ ] 7.6 Re-run Stryker to verify 80%+
    - _Requirements: 6.1_
  - [ ] 7.7 Promote to Silver with tamper-evident receipt
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [ ] 8. AMNESIA Detector (Port 6) → 80%+
  - [ ] 8.1 Run Stryker to identify surviving mutants
    - Command: `npx stryker run hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P4_RED_REGNANT/stryker-shards/shard-6-amnesia.mjs`
    - Current: 45.50%
    - _Requirements: 7.1_
  - [ ] 8.2 Add mutation-killing tests for debug log detection
    - Test console.log patterns
    - Test console.warn patterns
    - Test console.error patterns
    - _Requirements: 7.2_
  - [ ] 8.3 Add mutation-killing tests for strict zone checking
    - Test silver zone enforcement
    - Test gold zone enforcement
    - _Requirements: 7.3_
  - [ ] 8.4 Add mutation-killing tests for pattern matching
    - Test each AMNESIA_PATTERN
    - Test pattern severity mapping
    - _Requirements: 7.4_
  - [ ] 8.5 Add mutation-killing tests for JSDoc detection
    - Test orphaned JSDoc comments
    - Test JSDoc position validation
    - _Requirements: 7.5_
  - [ ] 8.6 Re-run Stryker to verify 80%+
    - _Requirements: 7.1_
  - [ ] 8.7 Promote to Silver with tamper-evident receipt
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [ ] 9. Final Validation - All 8 Commanders Online
  - [ ] 9.1 Run all Silver P4 tests
    - Command: `npx vitest run hot_obsidian_sandbox/silver/2_areas/P4_RED_REGNANT`
    - Verify all 8 detectors pass
    - _Requirements: 9.1_
  - [ ] 9.2 Verify SILVER_RECEIPT.json completeness
    - All 8 commanders present
    - All hashes valid
    - All scores in Goldilocks range
    - _Requirements: 9.2_
  - [ ] 9.3 Verify Blackboard logs
    - 8 promotion entries present
    - All timestamps valid
    - _Requirements: 9.3_
  - [ ] 9.4 Update SCREAM_MUTATION_RECEIPTS.md
    - All 8 detectors at Goldilocks
    - All receipts documented
    - _Requirements: 9.4_

## Notes

- Work proceeds in priority order (promotions first, then smallest gap)
- Each detector is a self-contained unit of work
- Stryker runs are expensive (~5-10 min each)
- Quick iteration with Vitest before Stryker
- Receipts are tamper-evident (SHA-256 hash of source)
- All promotions logged to Blackboard for audit trail
