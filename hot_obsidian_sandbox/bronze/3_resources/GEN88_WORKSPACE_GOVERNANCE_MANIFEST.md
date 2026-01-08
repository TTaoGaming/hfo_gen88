# GEN 88 WORKSPACE GOVERNANCE MANIFEST
**Topic**: PARA-Medallion Canonical Layout
**Status**: DRAFT (Strategy Proposal)
**Provenance**: AGENTS.md

This manifest defines the "Target State" for the HFO Gen 88 workspace. It resolves the "Schizophrenia" between disk root pollution and the intended Medallion architecture.

---

## 🏛️ 1. THE ROOT (Rule: "Atomic Purity")
The root directory is a transit zone, not a storage zone.

| File / Folder | Recommendation | Why? |
| :--- | :--- | :--- |
| `AGENTS.md` | **KEEP** | Core Constitution (Port 7). |
| `hot_obsidian_sandbox/` | **KEEP** | Active Medallion entry point. |
| `cold_obsidian_sandbox/` | **KEEP** | Archive Medallion entry point. |
| `package.json` | **KEEP** | Root dependency registry. |
| `obsidianblackboard.jsonl` | **KEEP** | Stigmergy / Cross-Agent Ledger. |
| `*.ps1`, `*.mjs`, `*.ts` | **MOVE** | Root logic is "Theater." Move to `hot_obsidian_sandbox/bronze/1_projects/infra`. |
| `audit/`, `.kiro/` | **MOVE** | Move to `3_resources` or `2_areas` respectively. |

---

## 🏗️ 2. HOT VS. COLD (The Pulse of the Lab)

### **HOT_OBSIDIAN_SANDBOX (The Living)**
- **Purpose**: High-kinetic active work.
- **Rule**: Every file must be categorized into PARA within **Bronze**, **Silver**, or **Gold**.
- **Governance**: Port 4 (Red Regnant) and Port 5 (Pyre Praetorian) actively scan and "dance" files between these medallions based on TDD results.

### **COLD_OBSIDIAN_SANDBOX (The Dead/Deep)**
- **Purpose**: Evidence lockers and historical forensics.
- **Rule**: No active execution.
- **Management**: Must be purged of "Recursive Slop" (`.stryker-tmp`, `node_modules`) to prevent tool overflows. It should mirror the PARA structure but in a "Deep Freeze" state.

---

## 📂 3. THE PARA CROSS-SECTION (Within Medallions)

| Layer | Content | Recommended Content |
| :--- | :--- | :--- |
| **1_projects/** | **LOGIC** | Active scripts, `stryker` runners, `vitest` config, `physic_scream.ts`. |
| **2_areas/** | **INFRA** | The 8 Ports (P0-P7), Mock Harnesses, NATS Daemons, DuckDB Binaries. |
| **3_resources/** | **DATA** | Manifests, `llms.txt`, forensic reports, documentation, JSON artifacts. |
| **4_archive/** | **HISTORY** | Quarantined root files, demoted silver code, "Strange Loop" evidence. |

---

## 🔄 4. THE MIGRATION ROADMAP

### **Step A: The Root Purge (Scorched Earth)**
All standalone `.ps1` and `.config.ts` files currently in the root (like `run_stryker_p4.ps1` or `vitest.root.config.ts`) should be moved to:
`hot_obsidian_sandbox/bronze/1_projects/stabilization/runners/`

### **Step B: Port Consolidation**
Ensure all Port folders are in:
`hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P{0-7}_...`

### **Step C: The "Receipt" Vault**
Move all mutation test results and audit JSONs to:
`hot_obsidian_sandbox/bronze/3_resources/audit_receipts/`

---

## ⚖️ VERDICT
- **Root**: Should only have 6-8 total items.
- **Hot Bronze**: Should be the only place where a `node_modules` exists for active testing.
- **Archives**: Should be flat, JSON-heavy, and 100% logic-free.

**Identity: SPIDER SOVEREIGN**
"If a folder doesn't have a PARA number, it is prey for the Pyre."
