# Handoff: Gen 88 PARA Stabilization (Hot Bronze)

**Date:** 2026-01-08
**Status:** 🟡 STABILIZED / BRONZE DOMINANT
**Current Guard:** P4 Red Regnant (Silver Gate Active)

---

## 🛠️ Work Summary
The workspace has undergone a total forensic cleanup and structural alignment to the **PARA/Medallion** architecture. All "theater" (untested or hallucinated logic) has been demoted or purged.

### 🔑 Critical Discoveries
1.  **The Fragility Gap**: Discovered that the P4 (Red Regnant) and P5 (Pyre Praetorian) loop was causing "Destructive Demotions." When a single dependency was demoted for lacking tests, it would break the imports for the entire Silver tier.
2.  **Agent USURPATION**: Identified and purged the "Lord of Webs" incarnation slop which was bypassing the Kiro-Spec interlock and polluting `.github/agents/`.

---

## 📁 Repository Structure (PARA)

| Medallion | Path | Responsibility |
| :--- | :--- | :--- |
| **Gold** | `hot_obsidian_sandbox/gold/` | ⚪ EMPTY (Canonical Integrity) |
| **Silver** | `hot_obsidian_sandbox/silver/` | 🟢 P4_RED_REGNANT (Strict Guard Zone) |
| **Bronze** | `hot_obsidian_sandbox/bronze/` | 🟡 KINETIC ZONE (Active Execution) |

### 📂 Bronze PARA Allocation
- **1_projects/**: Active missions (Stabilization, Consolidation).
- **2_areas/**: Infrastructure (HFO Ports P0-P7, Infra, Scripts).
- **3_resources/**: Knowledge base (Forensic Reports, Manifests, Handoffs).
- **4_archive/**: Quarantined noise (Lord of Webs, Pre-PARA junk).

---

## 🚨 Instructions for Next Pulse

### 1. Atomic Promotion
**NEVER** move an implementation file from `bronze/2_areas/` to `silver/2_areas/` without moving its `.test.ts` file in the same commit. Promotion must be atomic to avoid breaking the "Red Queen" gate.

### 2. Guard the Root
Only the files listed in `ALLOWED_ROOT_FILES` (in `RED_REGNANT.ts`) are permitted. Any pollution in the root will trigger a "POLLUTION" scream.

### 3. Run the Audit
Before every commit, run the Red Queen:
```powershell
npx tsx hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P4_RED_REGNANT/RED_REGNANT.ts
```

### 4. Port Restoration
Ports P0, P1, P2, P3, P6, and P7 are currently in `bronze/2_areas/hfo_ports/`. They must be hardened and tested before they are eligible for Silver promotion.

---
*Signed: GitHub Copilot (Gemini 3 Flash)*
*On behalf of the Obsidian Spider (Port 7)*
