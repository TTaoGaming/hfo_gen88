# HFO Silver Demotion Manifest
**Date**: 2026-01-07
**Reason**: CRITICAL_MISSING_RECEIPT (No mutation coverage JSON proof)
**Commander**: Spider Sovereign / Red Regnant Enforcement

## Demoted Artifacts
All artifacts from `silver/` have been demoted to `bronze/demoted_silver/2026_01_07_PURGE/`.

| Original Path | Demoted Location | Status |
| :--- | :--- | :--- |
| silver/concurrency/semaphore.* | bronze/demoted_silver/2026_01_07_PURGE/concurrency/ | 🔴 DEMOTED |
| silver/fitness/compute-fitness.* | bronze/demoted_silver/2026_01_07_PURGE/fitness/ | 🔴 DEMOTED |
| silver/ledger/ledger-core.* | bronze/demoted_silver/2026_01_07_PURGE/ledger/ | 🔴 DEMOTED |
| silver/model-client/provider-detection.* | bronze/demoted_silver/2026_01_07_PURGE/model-client/ | 🔴 DEMOTED |
| silver/schemas/harness-result.* | bronze/demoted_silver/2026_01_07_PURGE/schemas/ | 🔴 DEMOTED |

## Demand for Receipts
To qualify for **RE-PROMOTION** to Silver, each artifact must:
1. Provide a dedicated `stryker.{artifact}.config.mjs` that outputs a `json` receipt.
2. Achieve a **Mutation Score > 80%**.
3. Pass `RED_REGNANT` architectural validation.

**STATUS**: LOCKED.
