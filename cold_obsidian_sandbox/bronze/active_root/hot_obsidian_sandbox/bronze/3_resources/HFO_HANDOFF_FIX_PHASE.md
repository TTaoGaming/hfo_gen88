# HFO HANDOFF: BRONZE RECOVERY PHASE (GEN 88)
**Date**: 2026-01-07
**Status**: CRITICAL / RECOVERING
**Context**: "Freezing" incident reported during P4/P5 Mutation Audits.

## 🚨 Current Blockers
1. **Recursive Sandbox Leakage**: Vitest is executing tests inside `.stryker-tmp*` directories, leading to 60+ failed test files.
2. **P4 Root Pollution Sensitivity**: `RED_REGNANT.ts` is flagging its own configuration files (`stryker.p1.config.mjs`, `tsconfig.json`) as pollution.
3. **Environment Noise**: Residual sandbox directories from failed runs are contaminating the workspace.

## 🏗️ Technical Plan (Sequential Thinking Required)
- **Step 1**: Nuclear Cleanup of root - remove all `.stryker-tmp*` and `reports/` to ensure a clean slate.
- **Step 2**: Hard-gate `vitest.root.config.ts`. The `exclude` pattern `**/.stryker-tmp*/**` is not being respected or the `include` pattern is too broad.
- **Step 3**: Internal Whitelisting. Ensure `RED_REGNANT.ts` whitelists its mandatory mutation-control files.
- **Step 4**: Verify P4 "Green" state with `npx vitest run`. No mutation runs until local tests pass.

## 🐝 Swarm Coordination
- **Port 4 (Red Regnant)**: Needs to stabilize whitelists for `tsconfig.json` and `stryker` configs.
- **Port 5 (Pyre Praetorian)**: Ready for 80% score push once P4 is stable.
- **Port 7 (Spider Sovereign)**: Orchestrating the recovery.

**Action**: Proceed to Sequential Thinking for implementation details.
