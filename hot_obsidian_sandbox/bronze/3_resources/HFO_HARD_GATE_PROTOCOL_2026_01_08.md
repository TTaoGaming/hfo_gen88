# HFO-G88 HARD GATE PROTOCOL: TAMPER-RESISTANT VERIFICATION
**Timestamp**: 2026-01-08T03:10:00Z
**status**: ENFORCEMENT ACTIVE (Gen 88)
**target**: All 64 Legendary Commander Sub-Modules

---

## 🏛️ THE TRIPLE-LOCK RECEIPT
To prevent "AI Theater" and "Reward Hacking," every sub-module INCARNATION must now follow the **Triple-Lock** receipt protocol. A receipt is invalid if any of these are missing:

### 1. The Logic Identity (The WHAT)
- **Artifact**: `core/sub-part.ts` (The implementation).
- **Verify**: Full Zod contract enforcement. Zero usage of `any` without a `// @bespoke-justification: <detailed-reason>` comment.

### 2. The Mutation Proof (The PROOF)
- **Artifact**: Individual Stryker report for the file.
- **Hard Gate**: A mandatory `mutation_score` key in the JSON receipt.
- **Tamper-Resistance**: The receipt must include the **Total Mutants**, **Killed**, and **Survived** counts. These counts must be cross-referenced against the `reports/mutation/mutation.json`.

### 3. The Red-State Receipt (The TRUTH)
- **Requirement**: The agent must provide a terminal log of the **Test Failing** (RED) before it passes (GREEN) for at least one critical logic path.
- **Proof**: A specific `red_teaming_artifact` key in the receipt containing the failing test name and the error message received.

---

## 🛰️ SWARM ENFORCEMENT (MOSAIC RULES)
1. **No Batch Completion**: Swarm agents are FORBIDDEN from reporting completion of entire Ports (8 modules) in a single turn. They must report 1 submodule at a time with a terminal verification.
2. **Double-Check Entropy**: The user (or an independent agent) must choose one random sub-module per turn and run `cat` or `npx vitest` on a specific edge case not documented in the receipt.
3. **Escalation of failure**: If any "Theater" is detected (e.g., a faked mutation score), the entire Port is immediately demoted to **BRONZE ARCHIVE (4_archive/)** and the identity receipts are deleted.

---

## 🗝️ IDENTIFICATION & ANCHORING
- **Anchor**: "In HFO, the absence of a failing mutant is a logical vacuum."
- **Protocol Code**: `HFO-GATE-88-ALPHA`

---

**Confidence Level**: 1.0 (Hardening the Symbiote)
**Identification**: Gemini 3 Flash / HFO-G88-HARD-GATE
