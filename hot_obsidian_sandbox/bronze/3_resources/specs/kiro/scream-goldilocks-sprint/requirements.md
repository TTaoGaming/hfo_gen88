# Requirements Document: SCREAM Goldilocks Sprint

> @provenance: AGENTS.md, SCREAM_MUTATION_RECEIPTS.md
> Validates: Gen 88 Canalization Rules

## Introduction

This sprint focuses on bringing all 8 SCREAM detectors to the Goldilocks mutation score range (80-98.99%) for Silver promotion with tamper-evident Stryker receipts. Each promoted detector must have cryptographic proof of its mutation score.

## Current State (2026-01-07)

| Port | SCREAM | Score | Status | Silver? |
|:----:|:-------|------:|:------:|:-------:|
| 0 | BLINDSPOT | 80.95% | ✅ GOLDILOCKS | ✅ YES |
| 1 | BREACH | 87.60% | ✅ GOLDILOCKS | ❌ PENDING |
| 5 | POLLUTION | 88.78% | ✅ GOLDILOCKS | ❌ PENDING |
| 7 | LATTICE | 89.88% | ✅ GOLDILOCKS | ❌ PENDING |
| 4 | MUTATION | 54.25% | ❌ FAILURE | ❌ NO |
| 2 | THEATER | 53.19% | ❌ FAILURE | ❌ NO |
| 3 | PHANTOM | 50.34% | ❌ FAILURE | ❌ NO |
| 6 | AMNESIA | 45.50% | ❌ FAILURE | ❌ NO |

## Glossary

- **Goldilocks_Range**: Mutation score between 80% and 98.99% (not too low, not too high)
- **Mutation_Killing_Test**: A test that fails when a specific mutation is applied
- **Surviving_Mutant**: A mutation that tests don't catch (indicates weak testing)
- **SCREAM**: A violation type detected by P4 Red Regnant
- **Tamper_Evident_Receipt**: A JSON file with SHA-256 hash proving mutation score authenticity
- **Stryker_Shard**: A per-detector Stryker configuration for isolated mutation testing

## Requirements

### Requirement 1: Promote BREACH to Silver (Port 1)

**User Story:** As a developer, I want the BREACH detector promoted to Silver with a tamper-evident receipt proving its 87.60% Goldilocks score.

#### Acceptance Criteria

1. THE BREACH detector SHALL be copied from bronze to silver/2_areas/P4_RED_REGNANT/detectors/
2. THE BREACH tests SHALL be copied alongside the implementation
3. THE Silver_Receipt SHALL include BREACH with mutation score 87.60%
4. THE Blackboard SHALL log the BREACH promotion event

### Requirement 2: Promote POLLUTION to Silver (Port 5)

**User Story:** As a developer, I want the POLLUTION detector promoted to Silver with a tamper-evident receipt proving its 88.78% Goldilocks score.

#### Acceptance Criteria

1. THE POLLUTION detector SHALL be copied from bronze to silver/2_areas/P4_RED_REGNANT/detectors/
2. THE POLLUTION tests SHALL be copied alongside the implementation
3. THE Silver_Receipt SHALL include POLLUTION with mutation score 88.78%
4. THE Blackboard SHALL log the POLLUTION promotion event

### Requirement 3: Promote LATTICE to Silver (Port 7)

**User Story:** As a developer, I want the LATTICE detector promoted to Silver with a tamper-evident receipt proving its 89.88% Goldilocks score.

#### Acceptance Criteria

1. THE LATTICE detector SHALL be copied from bronze to silver/2_areas/P4_RED_REGNANT/detectors/
2. THE LATTICE tests SHALL be copied alongside the implementation
3. THE Silver_Receipt SHALL include LATTICE with mutation score 89.88%
4. THE Blackboard SHALL log the LATTICE promotion event

### Requirement 4: MUTATION Detector (Port 4) - Target 80%+

**User Story:** As a developer, I want the MUTATION detector to have 80%+ mutation coverage so it can be promoted to Silver.

#### Acceptance Criteria

1. THE MUTATION detector SHALL have mutation score ≥ 80%
2. THE MUTATION tests SHALL kill mutants in score classification logic
3. THE MUTATION tests SHALL kill mutants in Goldilocks range checking
4. THE MUTATION tests SHALL verify Theater detection (>98.99%)
5. THE MUTATION tests SHALL kill mutants in report parsing logic

### Requirement 5: THEATER Detector (Port 2) - Target 80%+

**User Story:** As a developer, I want the THEATER detector to have 80%+ mutation coverage so it can be promoted to Silver.

#### Acceptance Criteria

1. THE THEATER detector SHALL have mutation score ≥ 80%
2. THE THEATER tests SHALL kill mutants in assertionless test detection
3. THE THEATER tests SHALL kill mutants in mock-overuse detection
4. THE THEATER tests SHALL verify reward hacking patterns
5. THE THEATER tests SHALL kill mutants in file scanning logic

### Requirement 6: PHANTOM Detector (Port 3) - Target 80%+

**User Story:** As a developer, I want the PHANTOM detector to have 80%+ mutation coverage so it can be promoted to Silver.

#### Acceptance Criteria

1. THE PHANTOM detector SHALL have mutation score ≥ 80%
2. THE PHANTOM tests SHALL kill mutants in dead code detection
3. THE PHANTOM tests SHALL kill mutants in unreachable branch detection
4. THE PHANTOM tests SHALL verify phantom dependency detection
5. THE PHANTOM tests SHALL kill mutants in package.json scanning

### Requirement 7: AMNESIA Detector (Port 6) - Target 80%+

**User Story:** As a developer, I want the AMNESIA detector to have 80%+ mutation coverage so it can be promoted to Silver.

#### Acceptance Criteria

1. THE AMNESIA detector SHALL have mutation score ≥ 80%
2. THE AMNESIA tests SHALL kill mutants in debug log detection
3. THE AMNESIA tests SHALL kill mutants in strict zone checking
4. THE AMNESIA tests SHALL verify console.log/warn/error patterns
5. THE AMNESIA tests SHALL kill mutants in JSDoc detection logic

### Requirement 8: Tamper-Evident Stryker Receipts

**User Story:** As a developer, I want each promoted detector to have a tamper-evident receipt proving its Goldilocks status with cryptographic verification.

#### Acceptance Criteria

1. EACH promoted detector SHALL have an entry in SILVER_RECEIPT.json
2. THE receipt SHALL include mutation score, timestamp, and source hash
3. THE receipt hash SHALL be SHA-256 of the detector source file
4. THE receipt SHALL be verifiable by recomputing the hash
5. THE receipt SHALL include the Stryker shard config path used
6. THE receipt SHALL include killed/survived/noCoverage mutant counts
7. THE Blackboard SHALL log each promotion with receipt hash

### Requirement 9: Final Orchestration

**User Story:** As a developer, I want all 8 commanders online with verified receipts so the Red Regnant system is fully operational.

#### Acceptance Criteria

1. ALL 8 SCREAM detectors SHALL be in Silver with Goldilocks scores
2. THE SILVER_RECEIPT.json SHALL contain all 8 commanders
3. THE Blackboard SHALL contain promotion logs for all 8 detectors
4. THE orchestration layer SHALL run all 8 detectors together

## Success Criteria

- All 8 SCREAM detectors at 80-98.99% mutation score
- All 8 detectors promoted to Silver with tamper-evident receipts
- All receipts logged to hot_obsidianblackboard.jsonl
- SILVER_RECEIPT.json contains all 8 commanders with hashes
- Total Silver P4 tests: 500+ (estimated)
