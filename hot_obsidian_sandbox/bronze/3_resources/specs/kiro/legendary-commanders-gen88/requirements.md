# Requirements Document: HFO Legendary Commanders Gen 88 Conceptual Incarnation

> Validates: AGENTS.md, LEGENDARY_COMMANDERS_V9.md, PROMOTION_QUEUE_2026_01_07.md
> @provenance: ttao-notes-2026-01-06.md

## Introduction

Gen 88 is the generation where we fully **conceptually incarnate** the 8 Legendary Commanders with strict Medallion bronze-to-silver gating and receipt verification. Each commander represents a functional archetype of the HFO swarm, grounded in real technology and enforced by mutation testing.

The goal is NOT to build new functionality from scratch, but to **consolidate existing scattered artifacts** into coherent commander folders, add rigorous tests, and promote to Silver tier with auditable receipts.

## Glossary

- **Legendary_Commander**: One of 8 functional archetypes (Ports 0-7) that embody specific verbs and responsibilities in the HFO swarm
- **Conceptual_Incarnation**: The process of consolidating scattered code into a coherent folder structure with ledger, tests, and Zod contracts
- **Silver_Standard**: 80-98.99% mutation coverage + JSON receipt + property tests
- **Receipt**: A JSON file produced by Stryker mutation testing that proves the artifact's quality
- **Medallion_Flow**: Bronze → Silver → Gold progression with hard gates
- **Galois_Lattice**: 8×8 semantic manifold where commanders occupy the diagonal
- **HIVE/8**: Strategic scatter-gather workflow (Hunt-Interlock-Validate-Evolve)
- **PREY/8**: Tactical kill-web workflow (Perceive-React-Execute-Yield)
- **Pyre_Dance**: Co-evolutionary loop between P4 (Red Regnant) and P5 (Pyre Praetorian)

## Requirements

### Requirement 1: Commander Folder Structure

**User Story:** As a developer, I want each Legendary Commander to have a standardized folder structure, so that I can easily navigate and understand the codebase.

#### Acceptance Criteria

1. THE System SHALL create a folder `P{N}_{COMMANDER_NAME}/` in `hot_obsidian_sandbox/bronze/` for each of the 8 commanders
2. WHEN a commander folder is created, THE System SHALL include a `P{N}_{COMMANDER_NAME}_LEDGER.md` file documenting identity, verb, scope, and architecture
3. WHEN a commander folder is created, THE System SHALL include a `{COMMANDER_NAME}.ts` main implementation file
4. WHEN a commander folder is created, THE System SHALL include a `{COMMANDER_NAME}.test.ts` unit test file
5. WHEN a commander folder is created, THE System SHALL include a `{COMMANDER_NAME}.property.ts` property-based test file
6. WHEN a commander folder is created, THE System SHALL include a `contracts/` subfolder with Zod schemas

### Requirement 2: Port 0 - Lidless Legion (SENSE/OBSERVE)

**User Story:** As a developer, I want the Lidless Legion commander to handle all observation and sensing operations, so that the swarm has a unified perception layer.

#### Acceptance Criteria

1. THE Lidless_Legion SHALL consolidate all web search, Tavily, and observation code under `P0_LIDLESS_LEGION/`
2. THE Lidless_Legion SHALL expose an `observe()` function that returns validated `Observation` objects
3. THE Lidless_Legion SHALL use Zod schemas for all input/output validation
4. THE Lidless_Legion SHALL log all observations to stigmergy (obsidianblackboard.jsonl)
5. THE Lidless_Legion SHALL NOT transform data (that's P2's job)
6. THE Lidless_Legion SHALL NOT store data (that's P6's job)
7. THE Lidless_Legion SHALL NOT make decisions (that's P7's job)

### Requirement 3: Port 1 - Web Weaver (BRIDGE/FUSE)

**User Story:** As a developer, I want the Web Weaver commander to handle all contract and bridging operations, so that the swarm has unified stigmergy schemas.

#### Acceptance Criteria

1. THE Web_Weaver SHALL consolidate all Zod contracts, NATS bridges, and stigmergy schemas under `P1_WEB_WEAVER/`
2. THE Web_Weaver SHALL define the `VacuoleEnvelope` schema for all inter-commander messages
3. THE Web_Weaver SHALL define the `SilverPromotionReceipt` schema for medallion gating
4. THE Web_Weaver SHALL expose a `bridge()` function for protocol adaptation
5. THE Web_Weaver SHALL expose a `fuse()` function for contract composition
6. WHEN a message is bridged, THE Web_Weaver SHALL validate it against the appropriate schema

### Requirement 4: Port 2 - Mirror Magus (SHAPE/TRANSFORM)

**User Story:** As a developer, I want the Mirror Magus commander to handle all data transformation operations, so that the swarm has unified shaping logic.

#### Acceptance Criteria

1. THE Mirror_Magus SHALL consolidate all transformation, filtering, and schema migration code under `P2_MIRROR_MAGUS/`
2. THE Mirror_Magus SHALL expose a `shape()` function for data transformation
3. THE Mirror_Magus SHALL implement the One Euro Filter for sensor smoothing
4. THE Mirror_Magus SHALL support schema versioning and migration
5. WHEN data is shaped, THE Mirror_Magus SHALL validate both input and output schemas

### Requirement 5: Port 3 - Spore Storm (DELIVER/INJECT)

**User Story:** As a developer, I want the Spore Storm commander to handle all delivery and injection operations, so that the swarm has unified effect delivery.

#### Acceptance Criteria

1. THE Spore_Storm SHALL consolidate all file injection, event emission, and cascade logic under `P3_SPORE_STORM/`
2. THE Spore_Storm SHALL expose an `inject()` function for payload delivery
3. THE Spore_Storm SHALL expose a `deliver()` function for cascade propagation
4. THE Spore_Storm SHALL support Temporal.io activities for durable execution
5. WHEN a payload is injected, THE Spore_Storm SHALL log the injection to stigmergy

### Requirement 6: Port 4 - Red Regnant (DISRUPT/TEST)

**User Story:** As a developer, I want the Red Regnant commander to handle all testing and disruption operations, so that the swarm has unified quality enforcement.

#### Acceptance Criteria

1. THE Red_Regnant SHALL consolidate all mutation testing, behavioral auditing, and disruption code under `P4_RED_REGNANT/`
2. THE Red_Regnant SHALL expose a `scream()` function for violation reporting
3. THE Red_Regnant SHALL expose a `sing()` function for purity confirmation
4. THE Red_Regnant SHALL maintain the Blood Book of Grudges (JSONL ledger)
5. THE Red_Regnant SHALL enforce the Silver Standard (80-98.99% mutation coverage)
6. THE Red_Regnant SHALL detect Theater (100% scores, assertionless tests, mock-overuse)
7. THE Red_Regnant SHALL detect Amnesia (debug logs in strict zones)
8. THE Red_Regnant SHALL detect Pollution (unauthorized files in root)
9. WHEN a violation is detected, THE Red_Regnant SHALL log it to the Blood Book and stigmergy

### Requirement 7: Port 5 - Pyre Praetorian (IMMUNIZE/DEFEND)

**User Story:** As a developer, I want the Pyre Praetorian commander to handle all immunization and defense operations, so that the swarm has unified security enforcement.

#### Acceptance Criteria

1. THE Pyre_Praetorian SHALL consolidate all validation, sanitization, and defense code under `P5_PYRE_PRAETORIAN/`
2. THE Pyre_Praetorian SHALL expose a `dance()` function for the Pyre Dance protocol
3. THE Pyre_Praetorian SHALL expose a `die()` function for artifact demotion
4. THE Pyre_Praetorian SHALL expose a `reborn()` function for artifact rebirth
5. THE Pyre_Praetorian SHALL issue Phoenix Immunity Certificates for promoted artifacts
6. THE Pyre_Praetorian SHALL defend against entire attack vectors, not just instances
7. WHEN an artifact is demoted, THE Pyre_Praetorian SHALL move it to quarantine
8. WHEN an artifact is reborn, THE Pyre_Praetorian SHALL log the rebirth to stigmergy

### Requirement 8: Port 6 - Kraken Keeper (STORE/ASSIMILATE)

**User Story:** As a developer, I want the Kraken Keeper commander to handle all storage and assimilation operations, so that the swarm has unified data persistence.

#### Acceptance Criteria

1. THE Kraken_Keeper SHALL consolidate all DuckDB, MAP-ELITE archive, and storage code under `P6_KRAKEN_KEEPER/`
2. THE Kraken_Keeper SHALL expose an `assimilate()` function for data ingestion
3. THE Kraken_Keeper SHALL expose a `store()` function for artifact persistence
4. THE Kraken_Keeper SHALL implement the MAP-ELITE archive for quality-diversity storage
5. THE Kraken_Keeper SHALL support temporal indexing for historical queries
6. WHEN data is assimilated, THE Kraken_Keeper SHALL validate it against the appropriate schema

### Requirement 9: Port 7 - Spider Sovereign (DECIDE/NAVIGATE)

**User Story:** As a developer, I want the Spider Sovereign commander to handle all decision and navigation operations, so that the swarm has unified C2 orchestration.

#### Acceptance Criteria

1. THE Spider_Sovereign SHALL consolidate all eval harness, swarm orchestration, and HIVE/8 code under `P7_SPIDER_SOVEREIGN/`
2. THE Spider_Sovereign SHALL expose a `decide()` function for strategic decisions
3. THE Spider_Sovereign SHALL expose a `navigate()` function for workflow orchestration
4. THE Spider_Sovereign SHALL implement HIVE/8:10 scatter-gather with hybrid consensus
5. THE Spider_Sovereign SHALL implement critique + weighted voting for BFT consensus
6. THE Spider_Sovereign SHALL log all decisions to stigmergy
7. WHEN consensus is reached, THE Spider_Sovereign SHALL record the method used (hybrid_agree, weighted_majority, critique_confident, etc.)

### Requirement 10: Silver Promotion Gating

**User Story:** As a developer, I want strict silver promotion gating with receipt verification, so that only quality-proven code enters the Silver tier.

#### Acceptance Criteria

1. THE System SHALL require 80-98.99% mutation coverage for Silver promotion
2. THE System SHALL require a JSON receipt from Stryker for each promoted artifact
3. THE System SHALL require property-based tests for all logic-heavy functions
4. THE System SHALL require Zod contracts for all public interfaces
5. THE System SHALL require provenance headers (`@provenance`, `Validates:`) in all Silver files
6. IF mutation score is below 80%, THEN THE System SHALL reject promotion
7. IF mutation score is above 98.99%, THEN THE System SHALL flag as Theater and reject
8. WHEN an artifact is promoted, THE System SHALL log the promotion to stigmergy with receipt hash

### Requirement 11: Pyre Dance Protocol (P4 x P5 Co-Evolution)

**User Story:** As a developer, I want the Red Regnant and Pyre Praetorian to dance together, so that the swarm has co-evolutionary quality enforcement.

#### Acceptance Criteria

1. WHEN Red_Regnant screams, THE Pyre_Praetorian SHALL respond with immunization
2. THE Pyre_Dance SHALL defend against attack vectors, not just instances
3. THE Pyre_Dance SHALL use higher-intelligence reasoning to adapt to meta-patterns
4. THE Pyre_Dance SHALL log all dance steps to stigmergy
5. THE Pyre_Dance SHALL continue until the artifact passes or is quarantined

### Requirement 12: Galois Lattice Enforcement

**User Story:** As a developer, I want the Galois Lattice to enforce semantic consistency, so that commanders stay in their lanes.

#### Acceptance Criteria

1. THE System SHALL enforce that each commander only performs its designated verb
2. THE System SHALL enforce octal governance (powers of 8: 8, 64, 512, 4096)
3. THE System SHALL enforce that HIVE/8 uses anti-diagonal pairings (0+7, 1+6, 2+5, 3+4)
4. THE System SHALL enforce that PREY/8 uses serpentine pairings (0+6, 1+7, 2+4, 3+5)
5. IF a commander attempts to perform another commander's verb, THEN THE System SHALL scream

---

## Notes for Gen 88 Implementation

### What We Already Have (Consolidation Targets)

| Commander | Existing Artifacts | Status |
|-----------|-------------------|--------|
| P0 Lidless Legion | `P0_GESTURE_MONOLITH/`, Tavily search code | Scattered |
| P1 Web Weaver | `contracts/`, `P1_WEB_WEAVER_LEDGER.md` | Draft |
| P2 Mirror Magus | One Euro Filter, schema migration | Scattered |
| P3 Spore Storm | `P3_SPORE_STORM_LEDGER.md` | Draft |
| P4 Red Regnant | `P4_RED_REGNANT/` folder, RED_REGNANT.ts | **Active** |
| P5 Pyre Praetorian | `P5_PYRE_PRAETORIAN/` folder | **Active** |
| P6 Kraken Keeper | DuckDB code, `P6_KRAKEN_KEEPER_LEDGER.md` | Draft |
| P7 Spider Sovereign | `P7_SPIDER_SOVEREIGN/` folder | **Active** |

### Priority Order

1. **P4 + P5** (Red Regnant + Pyre Praetorian) - The immune system core
2. **P7** (Spider Sovereign) - Already consolidated, needs tests
3. **P1** (Web Weaver) - Contracts are foundational
4. **P6** (Kraken Keeper) - Storage is needed for MAP-ELITE
5. **P0** (Lidless Legion) - Observation layer
6. **P2** (Mirror Magus) - Transformation layer
7. **P3** (Spore Storm) - Delivery layer

### Key Insight: Test x Test

The Red Regnant is the "Test x Test" commander - she tests the tests. This means:
- Property tests for the property test framework
- Mutation tests for the mutation test framework
- The immune system must be self-referential (quine-like)

### Key Insight: Hybrid Consensus

The Spider Sovereign uses hybrid consensus (critique + weighted voting):
- Weighted voting computed FIRST as ground truth
- Critique answer compared against weighted majority
- If 50%+ weighted agreement → weighted wins (robust to hallucination)
- This was validated on the Petersen graph test (critique picked wrong, weighted picked correct)

### Key Insight: Receipt Verification

Every Silver promotion requires a JSON receipt:
```json
{
  "artifact": "P4_RED_REGNANT/RED_REGNANT.ts",
  "mutationScore": 88.5,
  "timestamp": "2026-01-07T19:00:00Z",
  "hash": "sha256:abc123...",
  "strykerConfig": "stryker.p4.config.mjs"
}
```

### Key Insight: The Pyre Dance

P4 and P5 must "dance" together:
1. P4 screams (detects violation)
2. P5 immunizes (defends the vector)
3. P4 re-tests (validates the defense)
4. Loop until clean or quarantined

This is the "Dance of Shiva" - destruction and rebirth in a strange loop.
