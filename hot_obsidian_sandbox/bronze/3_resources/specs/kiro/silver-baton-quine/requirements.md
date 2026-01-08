# Requirements Document

## Introduction

The Silver Baton Quine is a single-file handoff artifact designed to transfer essential knowledge from Gen 88 to Gen 89 of the HFO (Hive Fleet Obsidian) system. It must be self-describing (quine property), machine-parseable, and optimized for AI agent consumption within typical context window limits.

## Glossary

- **Baton**: A handoff document containing everything needed to bootstrap a new generation
- **Quine**: A self-describing artifact that contains instructions for its own reconstruction
- **Gen_89**: The next generation of the HFO system being bootstrapped
- **Cold_Start**: The initial bootstrap sequence when an AI agent has no prior context
- **Medallion_Architecture**: The Bronze → Silver → Gold promotion pipeline
- **Stigmergy**: Coordination via shared artifacts (blackboard pattern)
- **Contract_Law**: Zod schema validation at all boundaries

## Requirements

### Requirement 1: Self-Describing Structure

**User Story:** As a Gen 89 AI agent, I want the baton to explain itself, so that I can understand and use it without external documentation.

#### Acceptance Criteria

1. THE Baton SHALL contain a YAML frontmatter block with generation, predecessor, status, and checksum fields
2. WHEN an AI agent reads the first 50 lines, THE Baton SHALL provide enough context to understand its purpose
3. THE Baton SHALL use numbered section markers (§0-§8) for precise cross-referencing
4. THE Baton SHALL not require any external files to be understood

### Requirement 2: Cold Start Optimization

**User Story:** As a Gen 89 AI agent with no prior context, I want critical information at the top, so that I can begin work immediately.

#### Acceptance Criteria

1. THE Baton SHALL place the Cold_Start section (§0) within the first 50 lines
2. WHEN reading §0, THE Agent SHALL find answers to: "What is this?", "What do I do first?", and "How do I verify health?"
3. THE Cold_Start section SHALL contain 3 or fewer commands to verify system health
4. THE Baton SHALL order sections by criticality (most important first)

### Requirement 3: Contract Preservation

**User Story:** As a Gen 89 developer, I want Zod schemas preserved inline, so that I can copy-paste them directly into code.

#### Acceptance Criteria

1. THE Baton SHALL contain all critical Zod schemas in fenced TypeScript code blocks
2. WHEN copying a schema from the Baton, THE Schema SHALL be syntactically valid TypeScript
3. THE Baton SHALL include schemas for: Landmark, SensorFrame, SmoothedFrame, FSMAction, and PointerEventOut
4. THE Baton SHALL not reference external schema files

### Requirement 4: Architecture Summary

**User Story:** As a Gen 89 AI agent, I want a simplified architecture reference, so that I understand the 8-port system without mythology overhead.

#### Acceptance Criteria

1. THE Baton SHALL contain a table mapping ports 0-7 to their verbs and responsibilities
2. THE Baton SHALL use functional names (OBSERVE, BRIDGE, SHAPE, etc.) not mythological names
3. THE Baton SHALL explain the Medallion_Architecture (Bronze → Silver → Gold) in 10 lines or fewer
4. THE Baton SHALL not include I Ching trigrams, binary mappings, or Galois lattice details in the main sections

### Requirement 5: Pattern Documentation

**User Story:** As a Gen 89 developer, I want to know what patterns worked in Gen 88, so that I can reuse proven approaches.

#### Acceptance Criteria

1. THE Baton SHALL document at least 5 successful patterns from Gen 88
2. WHEN documenting a pattern, THE Baton SHALL include: name, description, why it worked, and recommendation
3. THE Baton SHALL include the One Euro Filter as a documented pattern with code reference
4. THE Baton SHALL include Contract Law (Zod validation) as a documented pattern

### Requirement 6: Antipattern Documentation

**User Story:** As a Gen 89 developer, I want to know what failed in Gen 88, so that I can avoid repeating mistakes.

#### Acceptance Criteria

1. THE Baton SHALL document at least 5 antipatterns from Gen 88
2. WHEN documenting an antipattern, THE Baton SHALL include: name, what happened, why it failed, and recommendation
3. THE Baton SHALL include "Nested Folder Hell" as a documented antipattern
4. THE Baton SHALL include "Soft Enforcement" as a documented antipattern
5. THE Baton SHALL include "Mythology Overload" as a documented antipattern

### Requirement 7: Enforcement Script

**User Story:** As a Gen 89 developer, I want a complete enforcement script inline, so that I can implement hard-gated validation immediately.

#### Acceptance Criteria

1. THE Baton SHALL contain a complete, runnable enforcement script in a fenced code block
2. THE Enforcement_Script SHALL check for root pollution (unauthorized files)
3. THE Enforcement_Script SHALL check that Silver files have corresponding tests
4. THE Enforcement_Script SHALL log violations to a blackboard file
5. WHEN a violation is detected, THE Enforcement_Script SHALL exit with non-zero status

### Requirement 8: Bootstrap Checklist

**User Story:** As a Gen 89 AI agent, I want a clear checklist of bootstrap tasks, so that I can track progress systematically.

#### Acceptance Criteria

1. THE Baton SHALL contain a markdown checklist with phases 0-3
2. THE Checklist SHALL include: Clean Slate, Contracts First, Single Enforcement, and Minimal Implementation phases
3. WHEN a phase is complete, THE Agent SHALL be able to mark it with [x]
4. THE Checklist SHALL contain no more than 15 total items

### Requirement 9: Size Constraints

**User Story:** As a Gen 89 AI agent, I want the baton to fit in my context window, so that I don't lose critical information to truncation.

#### Acceptance Criteria

1. THE Baton SHALL be no more than 500 lines total
2. THE Baton SHALL have no section longer than 60 lines
3. THE Baton SHALL use concise language without unnecessary prose
4. IF the Baton exceeds 500 lines, THEN THE Author SHALL move content to an appendix section

### Requirement 10: Integrity Verification

**User Story:** As a Gen 89 AI agent, I want to verify the baton hasn't been corrupted, so that I can trust its contents.

#### Acceptance Criteria

1. THE Baton SHALL include a SHA256 checksum in the YAML frontmatter
2. THE Checksum SHALL cover the content from §0 through §7 (excluding appendix)
3. WHEN the checksum doesn't match, THE Agent SHALL treat the baton as potentially corrupted
4. THE Baton SHALL include instructions for regenerating the checksum
