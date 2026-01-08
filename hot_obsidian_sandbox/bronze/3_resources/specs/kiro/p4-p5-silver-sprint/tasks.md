# Implementation Plan: P4/P5 Silver Sprint

## Overview

A 1-hour time-boxed sprint to promote Red Regnant (P4) and Pyre Praetorian (P5) to Silver tier with verifiable receipts.

**DEADLINE**: 1 hour from task 1 start  
**START TIME**: Set when task 1 begins  
**TARGET**: All tests pass, receipts verify, Goldilocks mutation score

## Tasks

- [x] 1. Initialize sprint and set deadline
  - Record start time to Blackboard
  - Calculate deadline (start + 60 minutes)
  - Create sprint status entry
  - _Requirements: 4.1, 4.2_

- [x] 2. Implement P4 Red Regnant score classifier
  - [x] 2.1 Create `hot_obsidian_sandbox/bronze/P4_RED_REGNANT/core/score-classifier.ts`
    - Implement `classifyScore(score: number): ScoreClassification`
    - Implement `createScreamReceipt(score: number, artifact: string): ScreamReceipt`
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 2.2 Write unit tests for score classifier
    - Test FAILURE boundary (<80)
    - Test GOLDILOCKS range (80-98.99)
    - Test THEATER boundary (>=99)
    - _Requirements: 1.1, 5.1_

  - [x] 2.3 Write property test for score classification determinism
    - **Property 1: Score Classification Determinism**
    - **Validates: Requirements 1.1, 1.5**

  - [x] 2.4 Write property test for score classification boundaries
    - **Property 2: Score Classification Boundaries**
    - **Validates: Requirements 1.1**

- [x] 3. Implement P5 Pyre Praetorian path classifier
  - [x] 3.1 Create `hot_obsidian_sandbox/bronze/P5_PYRE_PRAETORIAN/core/path-classifier.ts`
    - Implement `classifyPath(path: string): { medallion, temperature }`
    - Implement `isRootWhitelisted(filename: string): boolean`
    - Implement `evaluatePolicy(path: string): { decision, reason }`
    - Implement `createPolicyReceipt(path: string): PolicyReceipt`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 3.2 Write unit tests for path classifier
    - Test hot bronze paths → BRONZE/HOT
    - Test hot silver paths → SILVER/HOT
    - Test hot gold paths → GOLD/HOT
    - Test cold paths → COLD temperature
    - Test root paths → ROOT
    - Test whitelist enforcement
    - _Requirements: 2.1, 2.6, 5.4, 5.5_

  - [x] 3.3 Write property test for path classification determinism
    - **Property 4: Path Classification Determinism**
    - **Validates: Requirements 2.1, 2.6**

  - [x] 3.4 Write property test for policy enforcement
    - **Property 5: Policy Enforcement Correctness**
    - **Validates: Requirements 2.2, 2.3**


- [x] 4. Implement receipt verification
  - [x] 4.1 Create `hot_obsidian_sandbox/bronze/contracts/receipt-verification.ts`
    - Implement `verifyReceipt<T>(receipt: T): boolean`
    - Implement `detectTampering<T>(receipt: T): TamperResult`
    - _Requirements: 3.1, 3.2_

  - [x] 4.2 Write property test for SCREAM receipt integrity
    - **Property 3: SCREAM Receipt Integrity**
    - **Validates: Requirements 1.3, 1.4, 3.1, 3.2, 3.3, 3.4**

  - [x] 4.3 Write property test for policy receipt integrity
    - **Property 6: Policy Receipt Integrity**
    - **Validates: Requirements 2.4, 2.5, 3.1, 3.2, 3.3, 3.4**

- [x] 5. Checkpoint - Run all tests
  - Run `npm test` for P4 and P5 tests
  - Verify all unit tests pass ✅ (98/98 passed)
  - Verify all property tests pass (100 iterations) ✅
  - Log intermediate status to Blackboard
  - _Requirements: 5.1, 5.2, 5.4, 5.5_

- [x] 6. Final verification and Blackboard logging
  - [x] 6.1 Verify all receipts
    - Create sample receipts for P4 and P5 ✅
    - Verify each receipt passes verification ✅
    - Verify tampered receipts fail verification ✅
    - _Requirements: 3.3, 3.4, 5.7_

  - [x] 6.2 Log sprint completion to Blackboard
    - Record end time ✅
    - List completed tasks ✅
    - List remaining tasks (if any) ✅
    - Include receipt hashes ✅
    - Set status (COMPLETED or DEADLINE_REACHED) ✅
    - _Requirements: 4.2, 4.3_

## Notes

- All tasks are REQUIRED for Silver promotion
- Mutation testing runs in CI only (per AGENTS.md - never run `npx stryker run` locally)
- If deadline is reached before completion, log current status and stop
- All receipts must verify correctly for Silver promotion
- Target mutation score: 80-98.99% (Goldilocks range)

## Sprint Timeline

| Minute | Task | Status |
|:-------|:-----|:-------|
| 0-5 | Task 1: Initialize sprint | |
| 5-15 | Task 2.1: P4 score-classifier.ts | |
| 15-20 | Task 2.2-2.4: P4 tests | |
| 20-35 | Task 3.1: P5 path-classifier.ts | |
| 35-45 | Task 3.2-3.4: P5 tests | |
| 45-50 | Task 4: Receipt verification | |
| 50-55 | Task 5: Checkpoint | |
| 55-60 | Task 6: Final verification | |

## Success Criteria

- [x] All unit tests pass (98/98)
- [x] All property tests pass (100 iterations each)
- [x] All receipts verify correctly
- [x] Sprint status logged to Blackboard
- [ ] Mutation score 80-98.99% (verified in CI after sprint)
