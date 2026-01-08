# HFO Gen 88 Cold Start Checklist (v2: Anti-Slop & Machine Enforcement)
<!-- @acknowledged: Historical context containing pain patterns -->

## 🛡️ The Anti-Slop Protocol (Machine Enforceable)
- **Mutation Testing (Stryker)**: No code moves to Silver without a >80% mutation score. This kills "fake green" tests.
- **Screamer Enforcement**: The `screamer.ts` script is the immune system. Any root pollution or "Theater" (Green without Red) results in immediate quarantine.
- **Contract Law (Zod)**: All Port communication is gated by Zod schemas. Hallucinated data types will trigger runtime failures.
- **Stigmergy (Blackboard)**: All progress must be logged to the `.jsonl` blackboard. If it's not on the blackboard, it didn't happen.
- **Galois Lattice Alignment**: Every component must map to one of the 8 HFO functional verbs (OBSERVE, BRIDGE, SHAPE, INJECT, DISRUPT, IMMUNIZE, ASSIMILATE, NAVIGATE).
- **Canalization Stack**: Adherence to L1-L6 enforcement layers.

## 🏗️ Phase 1: Infrastructure & Enforcement (Port 4: Red Regnant)
- [x] Initialize Git & GitHub Repo ([INIT_001])
- [x] Enforce Root Purge (Move Blackboard to Silver)
- [x] **Retrieve Gold Batons**: Brought Gen 87X3 Quines into `bronze/provenance/`.
- [x] **Consolidate Provenance**: Pulled Gen 84, 85, 87 context payloads into `bronze/stale_context_payloads/`.
- [x] **Formalize Protocol**: Created `COLD_START_PROTOCOL_GEN88.md`.
- [x] **Formalize Verbs**: Defined HFO vs JADC2 verb mapping in `bronze/contracts/verbs.ts`.
- [x] **Immune System Activation**: Port `screamer.ts` to `hot_obsidian_sandbox/bronze/scripts/` and verify enforcement.
- [ ] **Daemon Setup**: Configure `daemon.ps1` to run `screamer.ts` every 10 minutes.
- [ ] **Promotion Gate**: Create `promote.ps1` that requires `npm test` AND `npm run stryker` to pass before moving Bronze -> Silver.
- [ ] **Vitest/Stryker Baseline**: Verify toolchain in `hot_obsidian_sandbox/bronze/infra/`.

## 🖐️ Phase 2: Gesture Control Plane (Port 0: Lidless Legion)
- [ ] **Contract Definition**: Define Zod schemas for `PointerEvent`, `SensorFrame`, and `SmoothedFrame` in `bronze/contracts/`.
- [ ] **Adapter Extraction**: Pull `PointerEventAdapter` and `OneEuroFilter` from Gen 87X3.
- [ ] **Red Phase**: Create failing Vitest suites that verify the *behavioral contracts*, not just the types.
- [ ] **Mutation Kill**: Run Stryker on the adapters to ensure tests are meaningful.

## 🕸️ Phase 3: Web Weaver & Interlock (Port 1: Web Weaver)
- [ ] **Envelope Schema**: Define `VacuoleEnvelope` (CloudEvents compliant) in Zod.
- [ ] **FSM Extraction**: Pull `XStateFSMAdapter` to `bronze/P1_WEB_WEAVER/`.
- [ ] **Interlock TDD**: Implement failing tests for Port 1 coordination.

## 🛡️ Phase 4: Promotion to Silver
- [ ] **Scream Check**: Run `screamer.ts` to ensure no architectural violations.
- [ ] **Final Promotion**: Move verified Port 0/1 artifacts to `hot_obsidian_sandbox/silver/`.

---
*Provenance: Derived from Gen 87X3 Handoffs, Gen 88 AGENTS.md, and PAIN_REGISTRY_GEN88.md*

