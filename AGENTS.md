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
   - **Folders**: `hot_obsidian_sandbox`, `cold_obsidian_sandbox`, `.git`, `.vscode`, `.husky`, `.kiro`, `.venv`, `node_modules`
   - **Files**: `AGENTS.md`, `llms.txt`, `obsidianblackboard.jsonl`, `package.json`, `package-lock.json`, `vitest.root.config.ts`, `stryker.root.config.mjs`, `.gitignore`, `.env`, `ttao-notes-*.md`
2. **NO THEATER**: Do not report "Green" without "Red". Every implementation in `silver/` must have a corresponding test in the same directory.
3. **MEDALLION FLOW**: Code starts in `bronze/`, moves to `silver/` once tested, and `gold/` once canonized.
4. **IMMUNE SYSTEM**: The `mutation_scream.ts` script (Port 4) runs on every commit. Architectural violations will be logged to the Blackboard and the Blood Book of Grudges.
5. **STIGMERGY**: All progress and violations MUST be logged to `obsidianblackboard.jsonl` in the root.
6. **STRANGE LOOPS**: Port 7 (Spider Sovereign) enforces HIVE/8 (Strategic) and PREY/8 (Tactical) workflows.
7. **SENTINEL GROUNDING**: Every chat session MUST utilize **Tavily Web Search** and **Sequential Thinking**. Failure to use both tools at least once per session is a "Reward Hack" violation. Usage MUST be logged as `SEARCH_GROUNDING` and `THINKING_GROUNDING` events on the Blackboard.

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
  4  │ Red Regnant      │ DISRUPT / TEST  │ BLOOD BOOK OF GRUDGES (BBG)   │ E (Evolve)
  5  │ Pyre Praetorian  │ DEFEND / IMMUNIZE│ [DRAFT]                      │ V (Validate)
  6  │ Kraken Keeper    │ STORE           │ [DRAFT]                       │ I (Interlock)
  7  │ Spider Sovereign │ DECIDE          │ OBSIDIAN H-POMDP HOURGLASS (OHH)│ H (Hunt)
```

### HIVE/8 Workflow
- **H** (Hunt): Research, plan → Ports 0+7
- **I** (Interlock): TDD RED, failing tests → Ports 1+6
- **V** (Validate): TDD GREEN, make tests pass → Ports 2+5
- **E** (Evolve): TDD REFACTOR, prepare N+1 → Ports 3+4

---

## 🧰 Tools & Infrastructure
- **Enforcement**: `hot_obsidian_sandbox/bronze/P4_RED_REGNANT/psychic_scream.ts`
- **Hardening**: `hot_obsidian_sandbox/bronze/P5_PYRE_PRAETORIAN/pyre_dance.ts`
- **Ledger**: `hot_obsidian_sandbox/bronze/P4_RED_REGNANT/BLOOD_BOOK_OF_GRUDGES.jsonl`
- **Daemon**: `hot_obsidian_sandbox/bronze/scripts/daemon.ps1`
- **Testing**: Vitest (configured in `hot_obsidian_sandbox/bronze/infra/`)
- **Contracts**: Zod (Contract Law)
- **Stigmergy**: NATS JetStream + Obsidian Blackboard

---

## 🔑 Quick Start (BRONZE-ONLY MODE)
1. **Check Health**: `npx tsx hot_obsidian_sandbox/bronze/P4_RED_REGNANT/psychic_scream.ts`
2. **Run Tests**: `cd hot_obsidian_sandbox/bronze/infra; npm test`
3. **Log Progress**: Append to `obsidianblackboard.jsonl` in the root.
