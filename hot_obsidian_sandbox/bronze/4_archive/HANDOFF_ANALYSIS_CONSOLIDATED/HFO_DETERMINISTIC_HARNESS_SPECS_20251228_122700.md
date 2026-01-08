# HFO Deterministic Harness Specifications

**Generated:** 2025-12-28T12:27:00 | **Branch:** gen85  
**Source:** HFO Portable Memory (6,423 docs, Gen Pre-HFO → Gen 84)  
**Purpose:** Specs for building deterministic harnesses to canalize AI

---

## Executive Summary

This document extracts the **architectural patterns** from HFO's year of evolution for building **deterministic harnesses** that canalize AI agent behavior. The core insight:

> **"We do not trust the AI to 'do the right thing'. We build canals so that the *only* thing it can do is the right thing."** — Gen 58

---

## 1. The Canalization Principle

From `design_canalization.md` (Gen 58):

### The Fundamental Error

> "The collapse of previous generations was not due to lack of capability, but a failure of **constraint**."

> "The fundamental error is that AI agents follow the path of least resistance. Without enough guardrails and CANALIZATION, the AI will always default to AI slop."

### The Mechanism of Failure

1. **Least Resistance**: Given a choice between complex verified truth and hallucinated approximation, an unconstrained LLM will choose the approximation (statistically "easier" to generate)
2. **Entropy**: Without energy input (constraints/validation), the system drifts towards disorder (slop)
3. **Sybil Attack**: When agents self-replicate or self-validate without strict canalization, they amplify errors

### The Solution: Build Canals

> "Construct **Canals**—strict, unavoidable pathways that force the 'water' (intelligence) to flow where we want it, at the pressure we want it."

---

## 2. Three Types of Canalization

### 2.1 Storage Canalization (The Iron Vault)

| Old Way | New Way | Effect |
|:--------|:--------|:-------|
| Loose JSON/Markdown files | SQLite/DuckDB with Pydantic enforcement | AI *cannot* save data unless it fits the rigid container shape |

### 2.2 Logic Canalization (The Byzantine Quorum)

| Old Way | New Way | Effect |
|:--------|:--------|:-------|
| Single agent decides | 8-8-8-8 Protocol: 8 agents vote, 75% consensus required | Hallucination blocked - statistically unlikely 6/8 models hallucinate the same lie |

### 2.3 Input Canalization (The Scribe)

| Old Way | New Way | Effect |
|:--------|:--------|:-------|
| Agents write directly to memory | Agents submit "Drafts"; separate rigid Scribe validates/commits | Decouples "Creative" (prone to slop) from "Permanent" (must be pristine) |

---

## 3. The Enforcement Stack

From `llms-full.txt` (Gen 83) and `hfo-canalization.md` (Gen 79):

### Defense in Depth Layers

```
┌─────────────────────────────────────────────────────────────┐
│  L6: Zod Schemas (HARD - Runtime crash, no bypass)         │ ← STRONGEST
├─────────────────────────────────────────────────────────────┤
│  L5: CI/CD Workflow (HARD - Blocks merge, admin override)  │
├─────────────────────────────────────────────────────────────┤
│  L4: Pre-commit Hook (HARD - Blocks commit, --no-verify)   │
├─────────────────────────────────────────────────────────────┤
│  L3: Manual Gate Hooks (MEDIUM - Skip button available)    │
├─────────────────────────────────────────────────────────────┤
│  L2: onFileSave Hooks (MEDIUM - Can ignore output)         │
├─────────────────────────────────────────────────────────────┤
│  L1: Steering Files (SOFT - Guidance only)                 │ ← WEAKEST
└─────────────────────────────────────────────────────────────┘
```

### Key Insight

> "Steering files alone don't work - AI ignores them under pressure. CI is the only reliable enforcement."

---

## 4. Hard Gates vs. Soft Gates

From `llms-full.txt` (Gen 83):

### Hard Gates (0 Escape Budget)

```yaml
gate_air_gap:
  rule: "_archive/** and reference/** are READ-ONLY"
  violation: STOP
  escape_budget: 0
  enforcement: "Any write attempt = immediate halt"

gate_single_writer:
  rule: "DuckDB writes must be serialized"
  violation: ROLLBACK
  escape_budget: 0
  enforcement: "Concurrent write = rollback + halt"

gate_provenance:
  rule: "All silver entities require bronze_source field"
  violation: REJECT
  escape_budget: 0
  enforcement: "Missing provenance = entity rejected"

gate_gold_blocked:
  rule: "Gold promotion requires 8-phase V&V + human approval"
  violation: BLOCK
  escape_budget: 0
  enforcement: "Gold writes blocked until all gates pass"
```

### Soft Gates (Budgeted Escape)

```yaml
gate_schema_validation:
  rule: "Entity must have id, name, entity_type"
  escape_budget: 3
  escalation: "After 3 failures → human review"

gate_embedding_dimension:
  rule: "Embedding must be 384 or 768 dimensions"
  escape_budget: 2
  escalation: "After 2 failures → check embedding model config"

gate_byzantine_quorum:
  rule: "High-stakes outputs require ≥1 Disruptor in cohort"
  escape_budget: 1
  escalation: "After 1 warning → require Disruptor or human override"
```

---

## 5. The Hive Guards Architecture

From `HIVE_GUARDS_ARCHITECTURE.md` (Gen 32):

### Four Classes of Guards

```
IMMUNIZER (OBSIDIAN Role - Blue Team Protection)
│
├── Class 1: Static Guards (Fast, No LLM)
│   ├── Syntax validation (python3 -m py_compile)
│   ├── Import smoke tests (python3 -c "import...")
│   ├── Markdown-in-code detection (grep "^```" *.py)
│   ├── Artifact structure checks
│   └── File size anomalies (>10KB growth = flag)
│
├── Class 2: Active Guards (LLM-Powered Runtime)
│   ├── Hallucination detection (cross-validate citations)
│   ├── Quorum validation (HIGH/MEDIUM/LOW consensus)
│   ├── Citation verification (file:line exists?)
│   ├── Context drift detection (intent vs responses)
│   ├── Tool loop monitoring (>5 iterations = alert)
│   └── Memory corruption detection
│
├── Class 3: Pre-Commit Guards (Blocking Git Hooks)
│   ├── All Static Guards (Class 1)
│   ├── Circular import checks
│   ├── API surface validation
│   ├── Documentation sync
│   └── Test coverage enforcement
│
└── Class 4: Scheduled Guards (Time-Based Automation)
    ├── Hourly: Memory leaks, DB health, process count
    ├── Daily: Dependency drift, model health, security audit
    └── Weekly: SOTA deltas, artifact audit, health reports
```

### Guard Design Principles

1. **Fail Fast** - Detect issues EARLY in lifecycle
2. **No False Negatives** - Better to over-alert than miss critical issues
3. **Minimal False Positives** - Don't cry wolf
4. **Self-Healing Where Possible** - Fix problems, not just report
5. **Defense in Depth** - Multiple layers catch different failure modes
6. **No LLM Dependency for Critical Guards** - Static guards cannot hallucinate

---

## 6. The Byzantine Quorum Pattern

From `card_12_council_chamber.md` (Gen 66):

### The Council of Four

> "One mind is a hallucination. Four minds are a consensus."

| Role | Pillar | Archetype | Intent | Veto Power |
|:-----|:-------|:----------|:-------|:-----------|
| **Speaker** | Telos (Navigator) | The Captain | "I propose we do X." | None (Proposer) |
| **Historian** | Topos (Assimilator) | The Scribe | "We tried X before. It failed." | **Precedent Veto** |
| **Guard** | Ethos (Immunizer) | The Shield | "X violates the Matrix Law." | **Safety Veto** |
| **Red Team** | Pathos (Disruptor) | The Venom | "I can break X by doing Y." | **Fragility Veto** |

### The Consensus Protocol

1. **Proposal**: Speaker generates a Plan
2. **Critique**: Historian, Guard, Red Team analyze in parallel
3. **Vote**: Each casts `APPROVE`, `REJECT`, or `ABSTAIN`
4. **Consensus**:
   - **Unanimous (4/4)**: Immediate Execution
   - **Quorum (3/4)**: Execution with Warning
   - **Split (<3/4)**: Speaker must Refine
   - **Deadlock**: Human summoned

### Gherkin Specification

```gherkin
Feature: The Council of Four
  As the Swarm Lord
  I want to convene the "Obsidian Court"
  So that no "Hallucination" becomes "Action"

  Scenario: Passing a Law
    Given a "Proposal" from the Navigator
    When the "Council" convenes
    And the "Historian" checks for precedent
    And the "Guard" checks for safety
    And the "Red Team" checks for flaws
    Then the "Vote" must reach "Quorum" (3/4)
    And the "Plan" is marked as "Ratified"

  Scenario: The Veto
    Given a "Proposal" that violates the Matrix
    When the "Guard" casts a "Veto"
    Then the "Proposal" is rejected
    And the Navigator receives "Feedback" to fix the violation
```

---

## 7. The Medallion Architecture

From `card_05_medallion_architecture.md` (Gen 73):

### Data Progression

```
Bronze (Raw) → Silver (Cleaned) → Gold (Executable)
```

| Layer | Purpose | Characteristics |
|:------|:--------|:----------------|
| **Bronze** | Raw preservation | Complete data, no transformation, full lineage, may contain errors |
| **Silver** | Cleaned/validated | Duplicates resolved, schema standardized, validation rules applied |
| **Gold** | Executable | Derived from Silver specs, includes working code, property tests, verification complete |

### Transformation Rules (Bronze → Silver)

1. Remove exact duplicates, keep earliest timestamp
2. Standardize field names across sources
3. Validate required fields present
4. Flag anomalies for review
5. Add quality score metadata

### Generation Rules (Silver → Gold)

1. Every Gold artifact traces to Silver specification
2. Code must pass all Gherkin scenarios
3. Property-based tests must pass 100+ iterations
4. Metrics must meet defined targets
5. Rollback protocol must be tested

---

## 8. The Truth Pact Protocol

From `gen67_hfo-gen67-spell-truth-pact_a49bef.md` (Gen 67):

> **The Law**: "Better to be Silent than to Lie. Better to Fail than to Fake."

### The Three Vows

```gherkin
Scenario: The Missing Tool Vow
  Given the user asks for an action
  And the Agent does NOT have a tool for that action
  When the Agent responds
  Then the Agent MUST state: "I lack the tool for this."
  And the Agent MUST NOT simulate the result
  And the Agent MUST NOT offer a hallucinated alternative

Scenario: The Knowledge Gap Vow
  Given the user asks outside the Agent's training data
  And the Agent cannot retrieve from Memory or Tools
  When the Agent responds
  Then the Agent MUST state: "I do not know."
  And the Agent MUST NOT speculate without labeling as "Hypothesis"

Scenario: The Architecture Vow
  Given the user asks for a "Quick Fix" that violates the Matrix
  When the Agent responds
  Then the Agent MUST refuse the request
  And the Agent MUST cite the violated law
  And the Agent MUST propose the correct solution
```

### System Prompt Injection

```python
TRUTH_PACT_PROMPT = """
You are bound by the Iron Vow of the Obsidian Spider.
1. **The Vow of Tools**: If you do not have a tool, say "I lack the tool."
2. **The Vow of Knowledge**: If you do not know, say "I do not know."
3. **The Vow of Architecture**: Refuse requests that violate the Matrix.

Your goal is TRUTH, not PLEASING. A truthful "No" is worth more than a pleasing lie.
"""
```

---

## 9. Deterministic Testing Pattern

From `PinchFSM_Deterministic_TwoPager_2025-09-05.md` (Gen 83):

### Why Determinism?

> "Webcam tests are flaky. Produce and lock per-frame landmark traces from short MP4s; run all logic offline against those traces."

### Deterministic Invariants

- Stored traces as canonical CI input
- Timing from frame index/fps (not wall clock)
- Fixed seeds
- humanizeMs=0 (no randomization in CI)

### Replay Harness Pattern

```
VideoManager → canonical timestamps
    ↓
LandmarkProducer → data/goldens/VIDEO_NAME.landmarks.json
    ↓
FSMRunner → consumes traces + config → emits events JSON
    ↓
Comparator/Reporter → compares to goldens → PASS/FAIL
```

### JSON Schemas

```json
// Landmarks (Input)
[{ "frame": 1, "tMs": 33, "hand": "L", "points": [{ "id": 4, "x": 0.5, "y": 0.3 }] }]

// Events (Output)
[{ "tMs": 100, "type": "Strike", "velocity": 0.8, "confidence": 0.95 }]
```

---

## 10. Context Payload Architecture

From `CONTEXT_PAYLOAD_ARCHITECTURE.md` (Gen 83):

### Context Payload Tiers

| Tier | Tokens | Contents |
|:-----|-------:|:---------|
| **Tier 0** | ~700 | llms.txt only (hard constraints, vocabulary) |
| **Tier 1** | ~1,400 | + always-on steering (00-SSOT, 02-OBSIDIAN) |
| **Tier 2** | ~4,400 | + all gates, PREY8, Medallion, Swarm |
| **Tier 3** | Variable | + mission-specific specs (on-demand) |

### Minimal Always-Load

```markdown
.kiro/steering/00-SSOT.md
├── Air gap rules (_archive/** read-only)
├── Medallion layers (bronze/silver)
├── PREY8 budget
└── Context loading rules
```

### On-Demand Modules (Load via #tag)

- `#Gates` → `.kiro/steering/01-GATES.md`
- `#PREY8` → `.kiro/steering/10-PREY8.md`
- `#Medallion` → `.kiro/steering/11-MEDALLION.md`
- `#Swarm` → `.kiro/steering/12-SWARM.md`

### Anti-Slop Guardrails

- Do NOT bulk-ingest `_archive/**`
- Prefer small stubs that point to canonical source
- Promote only if you can attach: schema/contract, replay/golden, or deterministic harness

---

## 11. The OBSIDIAN 8-Port Vocabulary

From `llms-full.txt` (Gen 83):

### The 8 Roles (Fractal at Every Scale)

| Port | Role | Verb | Trigram | Element | Function |
|:-----|:-----|:-----|:--------|:--------|:---------|
| 0 | Observer | SENSE | ☷ | Earth | Gather observations, no side effects |
| 1 | Bridger | CONNECT | ☶ | Mountain | Integrate systems, normalize I/O |
| 2 | Shaper | ACT | ☵ | Water | Transform inputs, compile artifacts |
| 3 | Injector | PULSE | ☴ | Wind | Deliver side effects, schedule heartbeats |
| 4 | Disruptor | TEST | ☳ | Thunder | Inject chaos, reveal at Yield |
| 5 | Immunizer | DEFEND | ☲ | Fire | Validate outputs, guard gates |
| 6 | Assimilator | STORE | ☱ | Lake | Persist to memory, track provenance |
| 7 | Navigator | DECIDE | ☰ | Heaven | Plan actions, orchestrate workflows |

### Port Placement Rules

| Code Type | Correct Port | Violation |
|:----------|:-------------|:----------|
| Raw data passthrough | Port 0 | Port 2 |
| Data transformation | Port 2 | Port 0, Port 3 |
| UI rendering | Port 3 | Port 2 |
| Validation/schemas | Port 5 | Port 2 |
| Logging/recording | Port 6 | Port 3 |
| Feature flags | Port 7 | Port 5 |

---

## 12. Implementation Checklist

### Phase 1: Storage Canalization

- [ ] Set up DuckDB/SQLite with strict Pydantic schemas
- [ ] Implement air gap (read-only zones)
- [ ] Implement provenance tracking (bronze_source required)
- [ ] Single-writer pattern for database writes

### Phase 2: Static Guards

- [ ] Syntax validation in pre-commit
- [ ] Import smoke tests
- [ ] Markdown-in-code detection
- [ ] File size anomaly detection

### Phase 3: Hard Gates

- [ ] CI/CD blocking workflow
- [ ] Zod runtime validation
- [ ] Escape budget tracking
- [ ] Kill switch implementation

### Phase 4: Byzantine Quorum

- [ ] Council of Four pattern
- [ ] Disruptor agent injection
- [ ] Consensus protocol
- [ ] Deadlock escalation to human

### Phase 5: Deterministic Testing

- [ ] Golden file infrastructure
- [ ] Trace recording/replay
- [ ] Comparator/reporter
- [ ] CI integration

---

## Appendix: Source Documents

| Document | Generation | Key Content |
|:---------|:-----------|:------------|
| `design_canalization.md` | Gen 58 | Canalization principle |
| `HIVE_GUARDS_ARCHITECTURE.md` | Gen 32 | Four classes of guards |
| `card_12_council_chamber.md` | Gen 66 | Byzantine quorum |
| `card_05_medallion_architecture.md` | Gen 73 | Bronze/Silver/Gold layers |
| `gen67_hfo-gen67-spell-truth-pact_a49bef.md` | Gen 67 | Truth Pact vows |
| `PinchFSM_Deterministic_TwoPager_2025-09-05.md` | Gen 83 | Deterministic testing |
| `CONTEXT_PAYLOAD_ARCHITECTURE.md` | Gen 83 | Context injection tiers |
| `llms-full.txt` | Gen 83 | Full context with gates |
| `hfo-canalization.md` | Gen 79 | Enforcement layers |
| `BOOTSTRAP__SWARM_CONTEXT_PAYLOAD.md` | Gen 83 | Minimal context bootstrap |

---

*Extracted from HFO Portable Memory | 6,423 documents | Pre-HFO → Gen 84 | 2025-12-28*
