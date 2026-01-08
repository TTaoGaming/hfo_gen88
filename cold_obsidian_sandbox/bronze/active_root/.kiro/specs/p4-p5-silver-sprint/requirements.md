# Requirements Document: P4/P5 Silver Sprint

## Introduction

**DEADLINE**: 1 hour from spec approval  
**START TIME**: TBD (set when tasks begin)  
**END TIME**: START_TIME + 60 minutes  

This is a time-boxed sprint to promote Red Regnant (P4) and Pyre Praetorian (P5) to Silver tier. The goal is a minimal vertical slice with verifiable receipts that prove correctness.

### The Problem

Current P4/P5 implementations are stuck in a failure loop:
- Tests don't pass baseline
- No clear pass/fail criteria
- AI slop without direction
- No receipts to prove correctness

### The Solution

Build the smallest possible vertical slice that:
1. Has strict pass/fail criteria
2. Produces cryptographic receipts
3. Achieves Goldilocks mutation score (80-98.99%)
4. Can be verified in under 1 hour

## Glossary

- **Red_Regnant**: Port 4 Commander - SCREAM verb - Violation detection
- **Pyre_Praetorian**: Port 5 Commander - IMMUNIZE verb - Policy enforcement
- **Receipt**: Cryptographic proof of operation with SHA-256 hash
- **Goldilocks_Score**: Mutation score between 80-98.99% (not too low, not too high)
- **Vertical_Slice**: Minimal end-to-end functionality that proves the concept
- **Silver_Standard**: Tests pass, mutation score in Goldilocks range, receipts verify

## Requirements

### Requirement 1: P4 Red Regnant Vertical Slice

**User Story:** As the Warlock, I want P4 to detect Theater and emit verifiable SCREAM receipts, so that I can prove violation detection works.

#### Acceptance Criteria

1. THE Red_Regnant SHALL classify mutation scores into three categories: FAILURE (<80%), GOLDILOCKS (80-98.99%), THEATER (>=99%)
2. WHEN a THEATER or FAILURE score is detected, THE Red_Regnant SHALL emit a SCREAM receipt
3. THE SCREAM receipt SHALL include: timestamp, violationType, score, artifact, receiptHash
4. THE receiptHash SHALL be valid SHA-256 of receipt content
5. FOR ALL mutation scores, classification SHALL be deterministic and correct
6. THE implementation SHALL achieve Goldilocks mutation score (80-98.99%)

### Requirement 2: P5 Pyre Praetorian Vertical Slice

**User Story:** As the Warlock, I want P5 to enforce medallion rules and emit verifiable policy receipts, so that I can prove policy enforcement works.

#### Acceptance Criteria

1. THE Pyre_Praetorian SHALL classify paths into medallions: BRONZE, SILVER, GOLD, ROOT
2. WHEN a write targets SILVER or GOLD without approval, THE Pyre_Praetorian SHALL emit DENIED receipt
3. WHEN a write targets BRONZE, THE Pyre_Praetorian SHALL emit ALLOWED receipt
4. THE policy receipt SHALL include: timestamp, path, medallion, decision, receiptHash
5. THE receiptHash SHALL be valid SHA-256 of receipt content
6. FOR ALL paths, medallion classification SHALL be deterministic and correct
7. THE implementation SHALL achieve Goldilocks mutation score (80-98.99%)

### Requirement 3: Receipt Verification

**User Story:** As the Warlock, I want to verify any receipt is authentic, so that AI cannot fake results.

#### Acceptance Criteria

1. THE verifyReceipt function SHALL recompute hash from receipt content
2. THE verifyReceipt function SHALL return true only if computed hash matches receiptHash
3. FOR ALL valid receipts, verification SHALL pass
4. FOR ALL tampered receipts, verification SHALL fail

### Requirement 4: Time-Boxed Execution

**User Story:** As the Warlock, I want strict time enforcement, so that AI cannot loop forever.

#### Acceptance Criteria

1. THE sprint SHALL have a 1-hour deadline from task start
2. WHEN deadline is reached, THE agent SHALL log final status to Blackboard
3. THE Blackboard entry SHALL include: startTime, endTime, tasksCompleted, tasksRemaining, receipts
4. THE agent SHALL NOT continue past deadline without explicit approval

### Requirement 5: Silver Promotion Criteria

**User Story:** As the Warlock, I want clear promotion criteria, so that I know when P4/P5 are ready for Silver.

#### Acceptance Criteria

1. THE P4 implementation SHALL pass all unit tests
2. THE P4 implementation SHALL pass property tests (100 iterations)
3. THE P4 implementation SHALL achieve mutation score 80-98.99%
4. THE P5 implementation SHALL pass all unit tests
5. THE P5 implementation SHALL pass property tests (100 iterations)
6. THE P5 implementation SHALL achieve mutation score 80-98.99%
7. ALL receipts SHALL verify correctly
