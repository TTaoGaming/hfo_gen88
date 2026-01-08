# Requirements Document: P4 Red Regnant 8 SCREAM Upgrade

## Introduction

This spec upgrades P4 Red Regnant from a monolithic violation detector to a modular 8 SCREAM architecture aligned with the 8 Legendary Commanders and HIVE/8 workflow.

### The Problem

Current P4 implementation has:
- 13 violation types with overlapping semantics
- Monolithic `RED_REGNANT.ts` (~400 lines) that's hard to test
- No clear mapping to commander responsibilities
- Inconsistent receipt generation

### The Solution

Refactor into 8 canonical SCREAM types:
1. Each SCREAM maps to one Legendary Commander
2. Each SCREAM has its own detector module
3. Each SCREAM produces cryptographic receipts
4. Property tests validate each SCREAM independently

## Glossary

- **SCREAM**: A violation detection event emitted by Red Regnant
- **Detector**: A module that detects a specific SCREAM type
- **Receipt**: Cryptographic proof of SCREAM with SHA-256 hash
- **Goldilocks_Score**: Mutation score between 80-98.99%
- **HIVE/8**: The 8-phase workflow (Hunt, Interlock, Validate, Evolve)

## Requirements

### Requirement 1: SCREAM_BLINDSPOT (Port 0 - SENSE)

**User Story:** As the Warlock, I want to detect silent failures and missing observations, so that blindspots don't hide bugs.

#### Acceptance Criteria

1. THE Detector SHALL identify empty catch blocks (silent failures)
2. THE Detector SHALL identify functions without logging/telemetry
3. THE Detector SHALL identify behavioral anomalies (SUSPICION patterns)
4. WHEN a blindspot is detected, THE Detector SHALL emit SCREAM_BLINDSPOT receipt
5. THE receipt SHALL include: timestamp, file, pattern, severity, receiptHash

### Requirement 2: SCREAM_BREACH (Port 1 - FUSE)

**User Story:** As the Warlock, I want to detect contract violations and schema mismatches, so that type safety is enforced.

#### Acceptance Criteria

1. THE Detector SHALL identify `any` types without `@bespoke` justification
2. THE Detector SHALL identify missing provenance headers in Silver/Gold
3. THE Detector SHALL identify Zod schema validation failures
4. WHEN a breach is detected, THE Detector SHALL emit SCREAM_BREACH receipt
5. THE receipt SHALL include: timestamp, file, contractName, violation, receiptHash

### Requirement 3: SCREAM_THEATER (Port 2 - SHAPE)

**User Story:** As the Warlock, I want to detect fake tests and mock poisoning, so that Theater doesn't masquerade as Truth.

#### Acceptance Criteria

1. THE Detector SHALL identify assertionless test files
2. THE Detector SHALL identify mock overuse (>5 mocks per file)
3. THE Detector SHALL identify placeholder logic patterns
4. THE Detector SHALL identify mutation scores >= 99% (too perfect)
5. WHEN theater is detected, THE Detector SHALL emit SCREAM_THEATER receipt
6. THE receipt SHALL include: timestamp, file, theaterType, evidence, receiptHash

### Requirement 4: SCREAM_PHANTOM (Port 3 - DELIVER)

**User Story:** As the Warlock, I want to detect external dependencies and supply chain risks, so that phantoms don't haunt production.

#### Acceptance Criteria

1. THE Detector SHALL identify CDN dependencies in HTML/JS/TS files
2. THE Detector SHALL identify unpinned npm dependencies
3. THE Detector SHALL identify external API calls without fallbacks
4. WHEN a phantom is detected, THE Detector SHALL emit SCREAM_PHANTOM receipt
5. THE receipt SHALL include: timestamp, file, phantomType, url, receiptHash

### Requirement 5: SCREAM_MUTATION (Port 4 - DISRUPT)

**User Story:** As the Warlock, I want to detect mutation testing failures, so that test quality is enforced.

#### Acceptance Criteria

1. THE Detector SHALL identify mutation scores < 80% (FAILURE)
2. THE Detector SHALL identify mutation scores >= 99% (THEATER)
3. THE Detector SHALL identify missing mutation reports
4. THE Detector SHALL identify malformed mutation reports
5. WHEN a mutation issue is detected, THE Detector SHALL emit SCREAM_MUTATION receipt
6. THE receipt SHALL include: timestamp, artifact, score, classification, receiptHash

### Requirement 6: SCREAM_POLLUTION (Port 5 - IMMUNIZE)

**User Story:** As the Warlock, I want to detect root pollution and medallion violations, so that the cleanroom stays clean.

#### Acceptance Criteria

1. THE Detector SHALL identify unauthorized files in root directory
2. THE Detector SHALL identify recursive sandbox loops
3. THE Detector SHALL identify files in wrong medallion tier
4. WHEN pollution is detected, THE Detector SHALL emit SCREAM_POLLUTION receipt
5. THE receipt SHALL include: timestamp, file, pollutionType, expectedLocation, receiptHash

### Requirement 7: SCREAM_AMNESIA (Port 6 - STORE)

**User Story:** As the Warlock, I want to detect debug logs and technical debt, so that context isn't lost.

#### Acceptance Criteria

1. THE Detector SHALL identify console.log/debug in Silver/Gold zones
2. THE Detector SHALL identify TODO/FIXME comments without `@permitted`
3. THE Detector SHALL identify missing documentation in public APIs
4. WHEN amnesia is detected, THE Detector SHALL emit SCREAM_AMNESIA receipt
5. THE receipt SHALL include: timestamp, file, amnesiaType, content, receiptHash

### Requirement 8: SCREAM_LATTICE (Port 7 - DECIDE)

**User Story:** As the Warlock, I want to detect governance violations and BDD misalignment, so that the lattice stays coherent.

#### Acceptance Criteria

1. THE Detector SHALL identify folder density exceeding octal limits
2. THE Detector SHALL identify missing requirement traceability (Validates:)
3. THE Detector SHALL identify bypass annotations (@ignore-regnant, etc.)
4. WHEN a lattice breach is detected, THE Detector SHALL emit SCREAM_LATTICE receipt
5. THE receipt SHALL include: timestamp, file, breachType, limit, actual, receiptHash

### Requirement 9: Unified SCREAM Receipt

**User Story:** As the Warlock, I want all SCREAMs to produce verifiable receipts, so that AI cannot fake results.

#### Acceptance Criteria

1. THE ScreamReceipt SHALL include: type, port, timestamp, file, details, receiptHash
2. THE receiptHash SHALL be valid SHA-256 of receipt content (excluding hash)
3. FOR ALL valid receipts, verification SHALL pass
4. FOR ALL tampered receipts, verification SHALL fail
5. THE receipt format SHALL be consistent across all 8 SCREAM types

### Requirement 10: SCREAM Aggregator

**User Story:** As the Warlock, I want a single audit function that runs all 8 detectors, so that I get a complete picture.

#### Acceptance Criteria

1. THE performScreamAudit function SHALL run all 8 detectors
2. THE function SHALL aggregate all SCREAMs into a single report
3. THE function SHALL log all SCREAMs to the Blood Book
4. THE function SHALL return success only if zero SCREAMs detected
5. THE function SHALL integrate with P5 Pyre Praetorian for enforcement

### Requirement 11: Silver Promotion Criteria

**User Story:** As the Warlock, I want clear promotion criteria for each detector, so that I know when they're ready.

#### Acceptance Criteria

1. EACH detector SHALL pass all unit tests
2. EACH detector SHALL pass property tests (100 iterations)
3. EACH detector SHALL achieve mutation score 80-98.99%
4. ALL receipts SHALL verify correctly
5. THE aggregator SHALL pass integration tests
