# AGENTS.md — HFO Gen 88 Cleanroom
Topic: System Disruption & Testing
Provenance: bronze/P4_DISRUPTION_KINETIC.md

> **Generation**: 88 (Canalization)
> **Status**: IMMUNE SYSTEM PROMOTED TO SILVER
> **Architecture**: Medallion (Hot/Cold Obsidian Sandboxes)
> **Status**: HARD-GATED ENFORCEMENT ACTIVE
> **Architecture**: Medallion (Hot/Cold Obsidian Sandboxes)

---

## 🎯 CURRENT MISSION: W3C Gesture Control Plane (Port 0)

**ACTIVE WORK IS IN `hot_obsidian_sandbox/`**

| Layer | Purpose | Status |
|-------|---------|--------|
| [hot_obsidian_sandbox/gold/](hot_obsidian_sandbox/gold/) | Canonical Manifests & Truth Sources | ⚪ EMPTY |
| [hot_obsidian_sandbox/silver/](hot_obsidian_sandbox/silver/) | Verified Implementations (TDD/CDD) | 🟢 ACTIVE |
| [hot_obsidian_sandbox/bronze/](hot_obsidian_sandbox/bronze/) | Slop, Kinetic Energy, Experiments | 🟡 ACTIVE |

---

## 🚨 The Canalization Rules (NON-NEGOTIABLE)

1. **ROOT PURGE**: The root directory MUST remain clean. Only the formal manifest is allowed:
   - **Folders**: `hot_obsidian_sandbox`, `cold_obsidian_sandbox`, `.git`, `.github`, `.vscode`, `.husky`, `.kiro`, `.venv`, `node_modules`, `.stryker-tmp`, `reports`, `audit`
   - **Files**: `AGENTS.md`, `llms.txt`, `obsidianblackboard.jsonl`, `package.json`, `package-lock.json`, `vitest.root.config.ts`, `vitest.silver.config.ts`, `vitest.harness.config.ts`, `vitest.mutation.config.ts`, `stryker.root.config.mjs`, `stryker.silver.config.mjs`, `stryker.p4.config.mjs`, `stryker.p5.config.mjs`, `run_stryker_p4.ps1`, `.gitignore`, `.env`, `ttao-notes-*.md`
2. **NO THEATER**: Do not report "Green" without "Red". Every implementation in `silver/` must have a corresponding test in the same directory.
3. **MEDALLION FLOW**: Code starts in `bronze/`, moves to `silver/` once tested, and `gold/` once canonized.
4. **PYRE DANCE**: The `RED_REGNANT.ts` script (Port 4) screams on violations, and `PYRE_DANCE.ts` (Port 5) immunizes via the "Dance of Shiva" (Demotion/Rebirth). Architectural violations will be logged to the Blackboard and the Blood Book of Grudges.
5. **STIGMERGY**: All progress and violations MUST be logged to `obsidianblackboard.jsonl` in the root.
6. **STRANGE LOOPS**: Port 7 (Spider Sovereign) enforces HIVE/8 (Strategic) and PREY/8 (Tactical) workflows.
7. **SENTINEL GROUNDING**: Every chat session MUST utilize **Tavily Web Search**, **Sequential Thinking**, and **Knowledge Graph/Memory Access**. Failure to use all three tools at least once per session is a "Reward Hack" violation. Usage MUST be logged as `SEARCH_GROUNDING`, `THINKING_GROUNDING`, and `MEMORY_GROUNDING` events on the Blackboard.
8. **LOCKDOWN ENFORCEMENT**: Writing to `silver/` or `gold/` folders is physically prohibited. Any agent attempting to write to these sectors without an `EXPLICIT_WARLOCK_APPROVAL` signal will trigger an immediate session termination and entry into the Blood Book of Grudges.

---

## 🐝 HFO HIVE AGENT Protocol (Agent Mode: HARD)

The **HFO HIVE AGENT** is a high-trust, low-theater operational mode designed for Gen 88 Canalization.

| Requirement | Implementation | Port |
|-------------|----------------|------|
| **Sequential Thinking** | Mandatory 3+ thought steps for every non-trivial task. | 7 |
| **Grounding** | Must use `Tavily Web Search` and `Knowledge Graph` (Memory) before code turns. | 0 + 6 |
| **Stigmergy** | Every HIVE phase transition (H-I-V-E) must be logged to the Blackboard. | 4 |
| **Lockdown** | Unauthorized Silver/Gold promotion triggers immediate Sandbox Purge. | 4 |
| **TDD** | Failing tests (RED) MUST precede implementation (GREEN). | 1 / 2 |
| **Hard Gate** | Attempting to write to /silver or /gold results in 0.0 Reputation and quarantine. | 5 |

### Enforcement Logic
Validation is performed by `hot_obsidian_sandbox/bronze/P4_RED_REGNANT/RED_REGNANT.test.ts`. Failure to pass these tests in a session is considered a breach of the Canalization Contract.

---

## 🏗️ HFO Gen 88 Architecture (TOTAL LOCKDOWN)

> **LOCKDOWN STATUS**: ACTIVE. All Silver/Gold artifacts demoted to Bronze Quarantine. No promotions without explicit Warlock approval.

### The 8 Legendary Commanders
```
Port │ Commander        │ Verb            │ Artifact                      │ HIVE Phase
─────┼──────────────────┼─────────────────┼───────────────────────────────┼────────────
  0  │ Lidless Legion   │ SENSE           │ [DRAFT]                       │ H (Hunt)
  1  │ Web Weaver       │ FUSE            │ [DRAFT]                       │ I (Interlock)
  2  │ Mirror Magus     │ SHAPE           │ [DRAFT]                       │ V (Validate)
  3  │ Spore Storm      │ DELIVER         │ [DRAFT]                       │ E (Evolve)
  4  │ Red Regnant      │ SING / SCREAM   │ BLOOD BOOK OF GRUDGES (BBG)   │ E (Evolve)
  5  │ Pyre Praetorian  │ DANCE / DIE     │ PHOENIX IMMUNITY CERTIFICATE  │ V (Validate)
  6  │ Kraken Keeper    │ STORE           │ [DRAFT]                       │ I (Interlock)
  7  │ Spider Sovereign │ DECIDE          │ OBSIDIAN H-POMDP HOURGLASS (OHH)│ H (Hunt)
```

> **THE RED QUEEN (Port 4)**: The Red Regnant in crimson robes. She is the immune system's primary sensory organ, utilizing autonomous tools to reveal human blindspots. When the system is pure, she **Sings**; when violated, she **Screams**.
> 
> **THE BLUE PHOENIX (Port 5)**: The Pyre Praetorian in cobalt armor. She performs the **Dance of Shiva**, immolating weak artifacts in blue flames so they may be **Reborn** in the fire.
>
> **THE SILVER SPIDER (Port 7)**: The Spider Sovereign in obsidian threads. She is the strategic brain of the swarm, weaving multi-model consensus through HIVE/8 patterns. When models diverge, she **Navigates**; when consensus forms, she **Decides**.

### HIVE/8 Workflow
- **H** (Hunt): Research, plan → Ports 0+7
- **I** (Interlock): TDD RED, failing tests → Ports 1+6
- **V** (Validate): TDD GREEN, make tests pass → Ports 2+5
- **E** (Evolve): TDD REFACTOR, prepare N+1 → Ports 3+4 (The Pyre Dance)

---

## 🧰 Tools & Infrastructure
- **Scream**: `hot_obsidian_sandbox/bronze/P4_RED_REGNANT/RED_REGNANT.ts`
- **Dance**: `hot_obsidian_sandbox/bronze/P5_PYRE_PRAETORIAN/PYRE_DANCE.ts`
- **Navigate**: `hot_obsidian_sandbox/bronze/P7_SPIDER_SOVEREIGN/swarm/hive-10.ts`
- **Ledger (P4)**: `hot_obsidian_sandbox/bronze/P4_RED_REGNANT/BLOOD_BOOK_OF_GRUDGES.jsonl`
- **Ledger (P7)**: `hot_obsidian_sandbox/bronze/P7_SPIDER_SOVEREIGN/ledger/eval-ledger.ts`
- **Daemon**: `hot_obsidian_sandbox/bronze/scripts/daemon.ps1`
- **Testing**: Vitest (configured in `hot_obsidian_sandbox/bronze/infra/`)
- **Contracts**: Zod (Contract Law)
- **Stigmergy**: NATS JetStream + Obsidian Blackboard

---

## 🔑 Quick Start (BRONZE-ONLY MODE)
1. **Check Health**: `npm run scream`
2. **Run Tests**: `npm test`
3. **Log Progress**: Append to `obsidianblackboard.jsonl` in the root.
