# Requirements Document

## Introduction

Promote the BLINDSPOT detector (Port 0) from Bronze to Silver medallion. This is the first of 8 SCREAM detectors to achieve Goldilocks mutation score (80.95%). The promotion establishes the pattern for subsequent detector promotions and begins orchestrating the 8 Legendary Commanders for the W3C Gesture Control Plane.

## Glossary

- **BLINDSPOT_Detector**: Port 0 SCREAM detector that identifies silent failures, empty catch blocks, and missing error observations
- **Silver_Medallion**: Verified implementation tier requiring tests, 80%+ mutation score, and NO THEATER
- **SCREAM_Receipt**: Cryptographically hashed violation record with SHA-256 integrity verification
- **Goldilocks_Range**: Mutation score between 80-98.99% (not too low, not suspiciously high)
- **Detector_Interface**: Common interface all 8 SCREAM detectors implement
- **ScreamType**: Enum of 8 canonical SCREAM types aligned with Legendary Commanders

## Requirements

### Requirement 1: Promote BLINDSPOT Detector to Silver

**User Story:** As a system architect, I want the BLINDSPOT detector promoted to Silver, so that I have a verified, tested implementation for detecting silent failures.

#### Acceptance Criteria

1. THE Silver_Medallion SHALL contain the BLINDSPOT detector implementation at `silver/2_areas/P4_RED_REGNANT/detectors/blindspot.ts`
2. THE Silver_Medallion SHALL contain corresponding tests at `silver/2_areas/P4_RED_REGNANT/detectors/blindspot.test.ts`
3. WHEN tests are run against the Silver BLINDSPOT detector THEN all tests SHALL pass
4. THE Silver BLINDSPOT detector SHALL maintain 80%+ mutation score
5. THE Silver_Medallion SHALL contain the detector contracts at `silver/2_areas/P4_RED_REGNANT/contracts/detector.ts`
6. THE Silver_Medallion SHALL contain the screams contracts at `silver/2_areas/P4_RED_REGNANT/contracts/screams.ts`

### Requirement 2: Promote Supporting Contracts to Silver

**User Story:** As a developer, I want the SCREAM contracts in Silver, so that all detectors share verified type definitions.

#### Acceptance Criteria

1. THE Silver contracts/screams.ts SHALL export ScreamType, ScreamReceipt, and verification functions
2. THE Silver contracts/detector.ts SHALL export Detector interface and DetectorConfig
3. WHEN contracts are imported THEN they SHALL provide full type safety via Zod schemas
4. THE Silver contracts SHALL have corresponding test files verifying schema validation

### Requirement 3: Verify Real-World Functionality

**User Story:** As a quality engineer, I want proof the detector works on real code, so that I know it's not cosmetic theater.

#### Acceptance Criteria

1. WHEN the BLINDSPOT detector scans the Bronze directory THEN it SHALL find real violations
2. WHEN violations are found THEN all SCREAM receipts SHALL pass cryptographic verification
3. THE integration tests SHALL verify the detector against planted violations in realistic code
4. THE detector SHALL complete scanning 200+ files in under 10 seconds

### Requirement 4: Document Silver Promotion

**User Story:** As a maintainer, I want the promotion documented, so that future promotions follow the same pattern.

#### Acceptance Criteria

1. THE Silver_Medallion SHALL contain a SILVER_RECEIPT.json with promotion metadata
2. THE Blackboard SHALL contain a log entry recording the promotion
3. THE SILVER_RECEIPT SHALL include mutation score, test count, and verification timestamp
