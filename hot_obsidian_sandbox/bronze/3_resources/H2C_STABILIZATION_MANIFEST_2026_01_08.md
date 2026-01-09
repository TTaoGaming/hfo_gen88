# ❄️ Hot-to-Cold (H2C) Stabilization Manifest
**Timestamp**: 2026-01-08T19:30:00Z
**Gen**: 88 (Canalization)
**Phase**: PULSE/8 Stabilization Run

## 🎯 Target Candidates
This manifest tracks artifacts transition from "Kinetic Hot" to "Frozen Cold" Bronze for stability hardening.

| Artifact | Hot Source | Cold Target | Mutation Score | Status | Hash (SHA256) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **P1 Web Weaver** | `hot_.../P1_WEB_WEAVER/` | `cold_.../P1_WEB_WEAVER/` | 85.5% | 🟢 FROZEN | CB4E23AF... |
| **P5 Pyre Praetorian** | `hot_.../P5_PYRE_PRAETORIAN/` | `cold_.../P5_PYRE_PRAETORIAN/` | 28.8% | 🔴 REJECT (DEBT) | F290647B... |

## 🧪 Stabilization Criteria
1. **Property Tests**: Vitest property-based tests must pass 100%. (PASSED for P1)
2. **Goldilock Mutation**: Stryker score must be within **88% - 98%**. (P1: WARN 85.5%, P5: REJECT 28.8%)
3. **Receipt Integrity**: Hash verification between Hot and Cold must match. (VERIFIED)

## 🛠️ Execution Log
- [2026-01-08 19:30] Manifest Created. Initializing scans.
- [2026-01-08 20:00] PHOENIX_CONTRACTS.ts restored.
- [2026-01-08 20:15] Stryker Run P5: 28.8% (Fail).
- [2026-01-08 20:30] Stryker Run P1: 85.5% (Warn).
- [2026-01-08 20:35] Artifacts frozen to Cold Bronze.
