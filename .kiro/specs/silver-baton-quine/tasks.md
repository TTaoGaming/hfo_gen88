# Implementation Plan: Silver Baton Quine

## Overview

This plan creates the Silver Baton Quine artifact and its validation tooling. The baton is a single markdown file; the tooling validates it against the correctness properties.

## Tasks

- [x] 1. Create the Silver Baton document structure
  - [x] 1.1 Create SILVER_BATON_GEN89.md with YAML frontmatter
    - Add generation, predecessor, status, checksum (placeholder), created fields
    - _Requirements: 1.1, 10.1_
  - [x] 1.2 Add §0 COLD START section
    - Purpose statement, first 3 commands, health verification
    - Must be within first 50 lines
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 1.3 Add §1 CONTRACTS section
    - Include Zod schemas: Landmark, SensorFrame, SmoothedFrame, FSMAction, PointerEventOut
    - All schemas in fenced TypeScript blocks
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 2. Add architecture and pattern sections
  - [x] 2.1 Add §2 ARCHITECTURE section
    - 8-port table with functional verbs (OBSERVE, BRIDGE, etc.)
    - Medallion explanation in ≤10 lines
    - No mythology or trigrams
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [x] 2.2 Add §3 PATTERNS section
    - Document 5+ patterns: Medallion, Contract Law, Stigmergy, One Euro Filter, Port Interface
    - Each with: name, description, why it worked, recommendation
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [x] 2.3 Add §4 ANTIPATTERNS section
    - Document 5+ antipatterns: Nested Folder Hell, Soft Enforcement, Mythology Overload, Context Bloat, Multiple Enforcement Scripts
    - Each with: name, what happened, why it failed, recommendation
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 3. Add enforcement and checklist sections
  - [x] 3.1 Add §5 ENFORCEMENT section
    - Complete enforce.ts script inline
    - Must check root pollution, test file existence, log to blackboard
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  - [x] 3.2 Add §6 PAIN REGISTRY section
    - Empty template for Gen 89 to populate
    - Reference to Gen 88 Blood Book
    - _Requirements: 6.1 (fresh registry)_
  - [x] 3.3 Add §7 BOOTSTRAP CHECKLIST section
    - Phases 0-3: Clean Slate, Contracts First, Single Enforcement, Minimal Implementation
    - ≤15 total items with markdown checkboxes
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  - [x] 3.4 Add §8 APPENDIX section (optional)
    - Links to Gen 88 artifacts
    - Technology stack references
    - _Requirements: 9.4_

- [x] 4. Checkpoint - Review baton structure
  - Verify all sections present and within line limits
  - Ensure total ≤500 lines, each section ≤60 lines
  - Ask the user if questions arise.

- [x] 5. Create validation tooling
  - [x] 5.1 Create baton-validator.ts with Zod schemas
    - BatonMetadataSchema, PatternEntrySchema, AntipatternEntrySchema
    - Section parsing utilities
    - _Requirements: 1.1, 5.2, 6.2_
  - [x] 5.2 Implement frontmatter parser
    - Extract and validate YAML frontmatter
    - Report missing/invalid fields
    - _Requirements: 1.1, 10.1_
  - [x] 5.3 Implement section parser
    - Detect §0-§8 markers
    - Extract section content
    - Verify sequential ordering
    - _Requirements: 1.3, 2.4_
  - [x] 5.4 Implement line count validator
    - Total line count check (≤500)
    - Per-section line count check (≤60)
    - _Requirements: 9.1, 9.2_
  - [x] 5.5 Implement checksum validator
    - Compute SHA256 of §0-§7 content
    - Compare to frontmatter checksum
    - _Requirements: 10.2_

- [x] 6. Checkpoint - Validation tooling complete
  - Run validator against baton
  - Fix any violations
  - Ask the user if questions arise.

- [x] 7. Create property-based tests
  - [x] 7.1 Write property test for YAML frontmatter round-trip
    - **Property 1: YAML Frontmatter Structure**
    - **Validates: Requirements 1.1**
  - [x] 7.2 Write property test for section ordering
    - **Property 5: Sequential Section Ordering**
    - **Validates: Requirements 2.4**
  - [x] 7.3 Write property test for TypeScript code block validity
    - **Property 6: TypeScript Code Block Validity (Round-Trip)**
    - **Validates: Requirements 3.2**
  - [x] 7.4 Write property test for line count constraints
    - **Property 13: Total Line Count Constraint**
    - **Property 14: Section Line Count Constraint**
    - **Validates: Requirements 9.1, 9.2**
  - [x] 7.5 Write property test for checksum round-trip
    - **Property 15: Checksum Round-Trip**
    - **Validates: Requirements 10.2**

- [x] 8. Finalize baton
  - [x] 8.1 Compute and embed final checksum
    - Calculate SHA256 of §0-§7
    - Update frontmatter checksum field
    - _Requirements: 10.1, 10.2_
  - [x] 8.2 Final validation pass
    - Run all validators
    - Run all property tests
    - Verify all constraints met
    - _Requirements: All_

- [x] 9. Final checkpoint - Baton ready for Gen 89
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks are required for comprehensive validation
- The baton itself is the primary deliverable; validation tooling ensures correctness
- Property tests use `fast-check` library
- All code goes in `hot_obsidian_sandbox/silver/` once validated
