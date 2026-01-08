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

1. **ROOT PURGE**: The root directory MUST remain clean. Only `hot_obsidian_sandbox`, `cold_obsidian_sandbox`, `AGENTS.md`, `llms.txt`, `ROOT_GOVERNANCE_MANIFEST.md`, and `ttao-notes-*.md` are allowed.
2. **PARA MEDALLIONS**: Every medallion (Gold, Silver, Bronze) MUST follow the PARA structure:
   - `1_projects/`: Active execution units and logic.
   - `2_areas/`: Stable infrastructures, Ports, and Harnesses.
   - `3_resources/`: Knowledge fragments, contracts, and manifests.
   - `4_archive/`: Quarantined slop and demoted history.
3. **NO THEATER**: Do not report "Green" without "Red". Every implementation in `silver/` must have a corresponding test in the same directory.
4. **MEDALLION FLOW**: Code starts in `bronze/`, moves to `silver/` once tested, and `gold/` once canonized.
5. **IMMUNE SYSTEM**: The `physic_scream.ts` script (Port 4) runs on every commit. Architectural violations will be logged to the Blackboards within the sandboxes.
6. **STIGMERGY**: All progress and violations MUST be logged to the appropriate Blackboard:
   - `hot_obsidian_sandbox/hot_obsidianblackboard.jsonl`
   - `cold_obsidian_sandbox/cold_obsidianblackboard.jsonl`
7. **STRANGE LOOPS**: Port 7 (Spider Sovereign) enforces HIVE/8 (Strategic) and PREY/8 (Tactical) workflows.

---

## 🏗️ HFO Gen 88 Architecture

### The 8 Legendary Commanders
```
Port │ Commander        │ Verb            │ HIVE Phase
─────┼──────────────────┼─────────────────┼────────────
  0  │ Lidless Legion   │ SENSE           │ H (Hunt)
  1  │ Web Weaver       │ FUSE            │ I (Interlock)
  2  │ Mirror Magus     │ SHAPE           │ V (Validate)
  3  │ Spore Storm      │ DELIVER         │ E (Evolve)
  4  │ Red Regnant      │ DISRUPT / TEST  │ E (Evolve)
  5  │ Pyre Praetorian  │ DEFEND / IMMUNIZE│ V (Validate)
  6  │ Kraken Keeper    │ STORE           │ I (Interlock)
  7  │ Spider Sovereign │ DECIDE          │ H (Hunt)
```

### HIVE/8 Workflow
- **H** (Hunt): Research, plan → Ports 0+7
- **I** (Interlock): TDD RED, failing tests → Ports 1+6
- **V** (Validate): TDD GREEN, make tests pass → Ports 2+5
- **E** (Evolve): TDD REFACTOR, prepare N+1 → Ports 3+4

---

## 🧰 Tools & Infrastructure
- **Enforcement**: `hot_obsidian_sandbox/silver/P4_RED_REGNANT/physic_scream.ts`
- **Hardening**: `hot_obsidian_sandbox/silver/P5_PYRE_PRAETORIAN/pyre_dance.ts`
- **Ledger**: `hot_obsidian_sandbox/silver/P4_RED_REGNANT/BLOOD_BOOK_OF_GRUDGES.jsonl`
- **Daemon**: `hot_obsidian_sandbox/bronze/scripts/daemon.ps1`
- **Testing**: Vitest (configured in `hot_obsidian_sandbox/bronze/infra/`)
- **Contracts**: Zod (Contract Law)
- **Stigmergy**: NATS JetStream + Obsidian Blackboard

---

## 🔑 Quick Start
1. **Check Health**: `cd hot_obsidian_sandbox/bronze/infra; npx tsx ../../silver/P4_RED_REGNANT/physic_scream.ts`
2. **Run Tests**: `cd hot_obsidian_sandbox/bronze/infra; npm test`
3. **Log Progress**: Append to `obsidianblackboard.jsonl` in the root.
