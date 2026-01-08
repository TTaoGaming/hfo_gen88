# Requirements Document

## Introduction

The Pyre Praetorian (Port 5) is the IMMUNIZER of the HFO Gen 88 immune system. This spec defines the Defense-in-Depth architecture that prevents AI agents from bypassing constraints. The architecture implements **8 defense layers** — one for each Legendary Commander and their verb — forming a complete Galois Lattice defense grid.

The core insight: **AI agents are probabilistic engines. They WILL ignore prompt-level constraints. The only reliable defense is infrastructure-level enforcement where agents physically CANNOT bypass the rules.**

### The 8-Layer Defense Architecture (End Goal)

```
Layer │ Port │ Commander        │ Verb      │ Defense Role
──────┼──────┼──────────────────┼───────────┼─────────────────────────────
  0   │  P0  │ Lidless Legion   │ SENSE     │ Input Observation & Logging
  1   │  P1  │ Web Weaver       │ FUSE      │ Protocol Bridging & Routing
  2   │  P2  │ Mirror Magus     │ SHAPE     │ Schema Validation & Transform
  3   │  P3  │ Spore Storm      │ DELIVER   │ Execution & Side Effects
  4   │  P4  │ Red Regnant      │ SCREAM    │ Violation Detection & Testing
  5   │  P5  │ Pyre Praetorian  │ IMMUNIZE  │ Policy Enforcement & Gating
  6   │  P6  │ Kraken Keeper    │ STORE     │ Audit Trail & Persistence
  7   │  P7  │ Spider Sovereign │ DECIDE    │ Orchestration & Approval
```

### Phased Implementation

- **Phase 1 (MVP)**: Layers 2, 4, 5, 6 — Core validation, testing, enforcement, audit
- **Phase 2**: Layers 0, 1 — Input observation, protocol bridging
- **Phase 3**: Layers 3, 7 — Execution engine, orchestration

## Glossary

- **Pyre_Praetorian**: Port 5 Commander responsible for defense, validation, and immunization
- **Red_Regnant**: Port 4 Commander responsible for testing and violation detection
- **Lidless_Legion**: Port 0 Commander responsible for observation and sensing
- **Web_Weaver**: Port 1 Commander responsible for protocol bridging
- **Mirror_Magus**: Port 2 Commander responsible for schema validation and transformation
- **Spore_Storm**: Port 3 Commander responsible for execution and delivery
- **Kraken_Keeper**: Port 6 Commander responsible for storage and audit
- **Spider_Sovereign**: Port 7 Commander responsible for orchestration and decisions
- **MCP_Server**: Model Context Protocol server that provides tools to AI agents
- **Defense_Layer**: A single layer in the defense-in-depth architecture, mapped to a Port
- **Immunization_Certificate**: Proof that an artifact has survived the Pyre Dance
- **Strange_Loop**: Co-evolutionary feedback cycle between testing and defense
- **Medallion_Gate**: Enforcement point that controls Bronze→Silver→Gold promotion
- **Attack_Vector**: A pattern of AI agent misbehavior (e.g., INSTRUCTION_AMNESIA)
- **Shield_Book**: Registry of known attack vectors and their defenses
- **Pyre_Dance**: The validation and sanitization pipeline
- **Galois_Lattice**: 8×8 semantic manifold organizing Commander interactions

## Requirements

### Requirement 1: 8-Layer Defense Architecture

**User Story:** As the Warlock, I want 8 independent defense layers mapped to the 8 Legendary Commanders, so that the defense grid mirrors the HFO Galois Lattice.

#### Acceptance Criteria

1. THE Defense_Architecture SHALL implement exactly 8 defense layers corresponding to Ports 0-7
2. WHEN an AI agent attempts any operation, THE MCP_Server SHALL route through layers in sequence: 0→1→2→5→4→6→3→7
3. IF any Defense_Layer rejects the operation, THEN THE MCP_Server SHALL deny and log to Blackboard
4. THE Layer sequence SHALL follow HIVE/8 pattern: SENSE→FUSE→SHAPE→IMMUNIZE→SCREAM→STORE→DELIVER→DECIDE
5. WHEN all 8 layers pass, THE MCP_Server SHALL execute the operation and log success
6. THE Architecture SHALL support phased implementation (Phase 1: Layers 2,4,5,6)

### Requirement 2: Layer 0 — Lidless Legion (SENSE)

**User Story:** As the Lidless Legion, I want to observe and log all incoming requests, so that nothing enters the system unnoticed.

#### Acceptance Criteria

1. THE Lidless_Legion_Layer SHALL log every incoming tool call with timestamp and parameters
2. THE Layer SHALL extract metadata: agent ID, session ID, request hash
3. THE Layer SHALL detect anomalous request patterns (rate limiting, repetition)
4. WHEN request rate exceeds threshold, THE Layer SHALL throttle with backpressure
5. THE Layer SHALL pass all requests to Layer 1 (no blocking, observation only)
6. **Phase**: 2 (deferred)

### Requirement 3: Layer 1 — Web Weaver (FUSE)

**User Story:** As the Web Weaver, I want to bridge protocols and route requests, so that the defense grid works with any MCP client.

#### Acceptance Criteria

1. THE Web_Weaver_Layer SHALL accept requests via MCP stdio transport
2. THE Layer SHALL normalize request format to internal VacuoleEnvelope schema
3. THE Layer SHALL route requests to appropriate downstream layers based on tool type
4. THE Layer SHALL handle protocol errors gracefully with structured error responses
5. THE Layer SHALL support future transports (HTTP, WebSocket) without core changes
6. **Phase**: 2 (deferred)

### Requirement 4: Layer 2 — Mirror Magus (SHAPE)

**User Story:** As the Mirror Magus, I want to validate and transform all inputs, so that malformed data cannot enter the system.

#### Acceptance Criteria

1. THE Mirror_Magus_Layer SHALL validate all tool inputs against Zod schemas
2. WHEN input fails schema validation, THE Layer SHALL reject with detailed error message
3. THE Layer SHALL sanitize string inputs to prevent injection attacks
4. THE Layer SHALL transform inputs to canonical form (path normalization, encoding)
5. FOR ALL valid inputs, parsing then serializing SHALL produce equivalent data (round-trip property)
6. **Phase**: 1 (MVP)

### Requirement 5: Layer 5 — Pyre Praetorian (IMMUNIZE)

**User Story:** As the Pyre Praetorian, I want to enforce policies and gate operations, so that only allowed actions can proceed.

#### Acceptance Criteria

1. THE Pyre_Praetorian_Layer SHALL load policies from YAML configuration file
2. WHEN an operation matches a DENY policy, THE Layer SHALL reject the operation
3. THE Layer SHALL enforce Medallion rules: no Silver/Gold writes without approval
4. THE Layer SHALL enforce root pollution rules: only whitelisted files in root
5. THE Layer SHALL check for valid Immunization_Certificate before promotion
6. WHEN policies are updated, THE MCP_Server SHALL reload without restart
7. **Phase**: 1 (MVP)

### Requirement 6: Layer 4 — Red Regnant (SCREAM)

**User Story:** As the Red Regnant, I want to detect violations and test code quality, so that Theater and deception are caught.

#### Acceptance Criteria

1. THE Red_Regnant_Layer SHALL scan operations for known attack patterns from Shield_Book
2. WHEN a violation is detected, THE Layer SHALL emit SCREAM event to Blackboard
3. THE Layer SHALL verify mutation scores are within valid range (80-98.99%)
4. THE Layer SHALL detect Theater patterns: trivial assertions, hardcoded values, silent catches
5. THE Layer SHALL partner with Pyre_Praetorian in Strange_Loop feedback
6. **Phase**: 1 (MVP)

### Requirement 7: Layer 6 — Kraken Keeper (STORE)

**User Story:** As the Kraken Keeper, I want to persist all audit data, so that complete history is available for investigation.

#### Acceptance Criteria

1. THE Kraken_Keeper_Layer SHALL log every operation to Obsidian Blackboard (JSONL)
2. THE Log_Entry SHALL include: timestamp, agent, tool, parameters, result, duration
3. THE Layer SHALL store Immunization_Certificates in Shield_Book
4. THE Layer SHALL support querying logs by time range, agent, and event type
5. THE Layer SHALL retain logs for minimum 30 days
6. **Phase**: 1 (MVP)

### Requirement 8: Layer 3 — Spore Storm (DELIVER)

**User Story:** As the Spore Storm, I want to execute approved operations, so that side effects only happen after all validation passes.

#### Acceptance Criteria

1. THE Spore_Storm_Layer SHALL execute file system operations only after Layers 0-6 approve
2. THE Layer SHALL use Temporal activities for durable execution (retry on failure)
3. THE Layer SHALL emit events to Blackboard for each execution
4. THE Layer SHALL support rollback for failed multi-step operations
5. THE Layer SHALL enforce atomic writes (no partial file states)
6. **Phase**: 3 (deferred)

### Requirement 9: Layer 7 — Spider Sovereign (DECIDE)

**User Story:** As the Spider Sovereign, I want to orchestrate complex workflows and approve critical operations, so that human-in-the-loop is enforced for high-risk actions.

#### Acceptance Criteria

1. THE Spider_Sovereign_Layer SHALL orchestrate multi-step workflows via Temporal
2. THE Layer SHALL require WARLOCK_APPROVAL signal for Gold promotions
3. THE Layer SHALL implement consensus voting for multi-agent decisions
4. THE Layer SHALL emit DECIDE events with reasoning to Blackboard
5. THE Layer SHALL support async approval workflows (wait for human)
6. **Phase**: 3 (deferred)

### Requirement 10: Co-Evolutionary Strange Loop

**User Story:** As the Pyre Praetorian, I want to partner with the Red Regnant in a feedback loop, so that defenses evolve based on detected attacks.

#### Acceptance Criteria

1. WHEN Red_Regnant detects a new attack pattern, THE Pyre_Praetorian SHALL add it to the Shield_Book
2. WHEN Shield_Book is updated, THE Policy_Engine SHALL generate new defense rules
3. THE Strange_Loop SHALL operate on HIVE/8 cycle: Red tests (E phase) → Blue defends (V phase)
4. FOR ALL attack vectors in Shield_Book, THE Defense_Architecture SHALL have corresponding countermeasures
5. THE Strange_Loop SHALL log each evolution cycle to the Blackboard

### Requirement 11: Attack Vector Registry (Shield Book)

**User Story:** As the Pyre Praetorian, I want a registry of known attack patterns, so that I can defend against entire classes of misbehavior.

#### Acceptance Criteria

1. THE Shield_Book SHALL store attack vectors with: ID, name, pattern, countermeasure, first_seen, frequency
2. WHEN a new attack is detected, THE Shield_Book SHALL auto-generate a unique ID
3. THE Shield_Book SHALL support pattern matching for detecting attack variants
4. THE Shield_Book SHALL track frequency of each attack vector
5. THE Shield_Book SHALL be stored as JSONL for append-only durability

### Requirement 12: Immunization Certificate Generation

**User Story:** As the Pyre Praetorian, I want to issue certificates for code that survives the Pyre Dance, so that only validated code can be promoted.

#### Acceptance Criteria

1. THE Immunization_Certificate SHALL include: artifact path, mutation score, test results, timestamp, hash
2. THE Certificate SHALL be cryptographically signed with SHA-256
3. WHEN verifying a certificate, THE System SHALL recompute hash and compare
4. THE Certificate SHALL expire after 24 hours (code must be re-tested before promotion)
5. THE Certificate SHALL be stored in the Shield Book for audit

### Requirement 13: Platform Independence

**User Story:** As the Warlock, I want the defense system to work with any MCP-compatible IDE, so that I am not locked into a single tool.

#### Acceptance Criteria

1. THE MCP_Server SHALL use standard MCP protocol (stdio transport)
2. THE MCP_Server SHALL provide configuration templates for Kiro, VS Code, Cursor, and Claude Desktop
3. THE MCP_Server SHALL not depend on any IDE-specific features
4. THE MCP_Server SHALL be runnable via `uvx` or direct Python execution
5. THE MCP_Server SHALL be packageable as a standalone tool

### Requirement 14: Phase 1 MVP Scope

**User Story:** As the Warlock, I want a minimal viable defense system quickly, so that I can start enforcing constraints immediately.

#### Acceptance Criteria

1. THE Phase_1_MVP SHALL implement Layers 2, 4, 5, 6 (Mirror Magus, Red Regnant, Pyre Praetorian, Kraken Keeper)
2. THE Phase_1_MVP SHALL provide `hfo_write_file`, `hfo_read_file`, `hfo_scream`, `hfo_promote` tools
3. THE Phase_1_MVP SHALL enforce medallion lockdown (no Silver/Gold writes)
4. THE Phase_1_MVP SHALL enforce root pollution rules
5. THE Phase_1_MVP SHALL log all operations to Blackboard
6. THE Phase_1_MVP SHALL be deployable within 1 week
