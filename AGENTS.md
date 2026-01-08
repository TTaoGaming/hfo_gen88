# AGENTS.md — HFO Gen 88 Cleanroom
Topic: System Disruption & Testing
Provenance: bronze/2_areas/hfo_ports/P4_RED_REGNANT/P4_DISRUPTION_KINETIC.md

> **Generation**: 88 (Canalization)
> **Status**: SYSTEM DEGRADATION / MUFFLED SCREAM (1300+ DISRUPTIONS DETECTED)
> **Architecture**: Medallion (Hot/Cold Obsidian Sandboxes)
> **Status**: HARD-GATED ENFORCEMENT ACTIVE (PORT 4 RED QUEEN)
> **Architecture**: Medallion (Hot/Cold Obsidian Sandboxes)

---

## 🎯 CURRENT MISSION: W3C Gesture Control Plane (Port 0)

**ACTIVE WORK IS IN `hot_obsidian_sandbox/`**

| Layer | Purpose | Status |
|-------|---------|--------|
| [hot_obsidian_sandbox/gold/](hot_obsidian_sandbox/gold/) | Canonical Manifests & Truth Sources | ⚪ EMPTY |
| [hot_obsidian_sandbox/silver/](hot_obsidian_sandbox/silver/) | Verified Implementations (TDD/CDD) | � PURE (P4 Residing) |
| [hot_obsidian_sandbox/bronze/](hot_obsidian_sandbox/bronze/) | Slop, Kinetic Energy, Experiments | 🟡 KINETIC (Warnings Only) |

---

## 🎭 The Mutation Goldilocks Zone (Gen 88 Pareto)

Silver promotion requires verified artifact integrity based on the following scale:

| Score % | Status | Action |
|---------|--------|--------|
| **< 80%** | 🔴 REJECT | Under-tested. Demoted to Bronze. |
| **80% - 87%**| 🟡 WARN | "Passable with Debt". Allowed in Silver with a Warning. |
| **88% - 98%**| 🟢 TARGET | "Goldilocks". Pareto Optimal for Gen 88. |
| **> 99%** | 🔴 SCREAM | "AI Theater". Likely reward hacking or trivial tests. |

---

## 🚨 The Canalization Rules (NON-NEGOTIABLE)

1. **ROOT PURGE**: The root directory MUST remain clean. Only `hot_obsidian_sandbox`, `cold_obsidian_sandbox`, `AGENTS.md`, `llms.txt`, `obsidianblackboard.jsonl`, `package.json`, `ROOT_GOVERNANCE_MANIFEST.md`, and `ttao-notes-*.md` are allowed.
2. **PARA MEDALLIONS**: Every medallion (Gold, Silver, Bronze) MUST follow the PARA structure:
   - `1_projects/`: Active execution units and logic.
   - `2_areas/`: Stable infrastructures, Ports, and Harnesses.
   - `3_resources/`: Knowledge fragments, contracts, and manifests.
   - `4_archive/`: Quarantined slop and demoted history.
3. **NO THEATER**: Do not report "Green" without "Red". Every implementation in `silver/` must have a corresponding test in the same directory.
4. **MEDALLION FLOW**: Code starts in `bronze/`, moves to `silver/` once tested, and `gold/` once canonized.
5. **IMMUNE SYSTEM**: The `RED_REGNANT.ts` script (Port 4) runs on every commit. Architectural violations will be logged to the Blackboards within the sandboxes.
6. **STIGMERGY**: All progress and violations MUST be logged to the appropriate Blackboard:
   - `hot_obsidian_sandbox/hot_obsidianblackboard.jsonl`
   - `cold_obsidian_sandbox/cold_obsidianblackboard.jsonl`
7. **STRANGE LOOPS**: Port 7 (Spider Sovereign) enforces HIVE/8 (Strategic) and PREY/8 (Tactical) workflows.

---

## 🏗️ HFO Gen 88 Architecture

### The 8 Legendary Commanders
```
| Port | Commander        | Verb            | HIVE Phase |
| :--- | :--- | :--- | :--- |
| 0 | Lidless Legion | SENSE | H (Hunt) |
| 1 | Web Weaver | FUSE | I (Interlock) |
| 2 | Mirror Magus | SHAPE | V (Validate) |
| 3 | Spore Storm | DELIVER | E (Evolve) |
| 4 | Red Regnant | DISRUPT / SCREAM| E (Evolve) |
| 5 | Pyre Praetorian | DEFEND / IMMUNIZE| V (Validate) |
| 6 | Kraken Keeper | STORE | I (Interlock) |
| 7 | Spider Sovereign | **NAVIGATE / ORCHESTRATE** | H (Hunt) |

> **Mission Engineering**: The Dual-Anchor MTG Compositions & Literate Declarative Gherkin Scenarios (V5) are archived in [HFO_LEGENDARY_COMMANDERS_MTG_MAPPING_V5.md](hot_obsidian_sandbox/bronze/3_resources/HFO_LEGENDARY_COMMANDERS_MTG_MAPPING_V5.md).

---

## 🏗️ HFO Gen 88 Architecture: Port 7 Centralization
**Spider Sovereign (Port 7)** is the unified navigator for all agentic workflows.
- **Mastra SDK**: Consolidated in `2_areas/hfo_ports/P7_SPIDER_SOVEREIGN/`.
- **Orchestration**: Power of 8 Sequential Pulses (Method B) are managed here.
- **Swarm Intelligence**: Knowledge Crusher Swarm resides in `P7_SPIDER_SOVEREIGN/swarm/`.


---

## 🧰 Tools & Infrastructure
- **Enforcement**: `hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P4_RED_REGNANT/RED_REGNANT.ts`
- **Hardening**: `hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P5_PYRE_PRAETORIAN/PYRE_DANCE.ts`
- **Ledger**: `hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P4_RED_REGNANT/BLOOD_BOOK_OF_GRUDGES.jsonl`
- **Daemon**: `hot_obsidian_sandbox/bronze/2_areas/scripts/daemon.ps1`
- **Testing**: Vitest (configured in `hot_obsidian_sandbox/bronze/infra/`)
- **Contracts**: Zod (Contract Law)
- **Stigmergy**: DuckDB + JSONL Blackboard

---

## 🔑 Quick Start
1. **Check Health**: `npx tsx hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P4_RED_REGNANT/RED_REGNANT.ts`
2. **Log Progress**: Append to `hot_obsidianblackboard.jsonl`.
3. **Clear Loops**: `rm -rf hot_obsidian_sandbox/bronze/1_projects/infra/hot_obsidian_sandbox` (URGENT)
