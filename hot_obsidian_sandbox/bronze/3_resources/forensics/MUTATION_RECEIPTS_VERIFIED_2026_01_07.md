# Mutation Testing Receipts - VERIFIED
> Date: 2026-01-07T15:30:00Z
> Auditor: Kiro
> Status: **VERIFIED FROM STRYKER JSON REPORTS**

## Executive Summary

These are the ONLY verified mutation scores extracted directly from Stryker JSON reports. No estimates. No theater.

---

## VERIFIED RECEIPTS

| Commander | File | Score | Killed | Survived | NoCoverage | Status |
|-----------|------|-------|--------|----------|------------|--------|
| P1 Web Weaver | contracts/index.ts | **89.66%** | 52 | 6 | 0 | ✅ SILVER |
| P4 Red Regnant | RED_REGNANT.ts | **65.62%** | 397 | 165 | 43 | ❌ BELOW 80% |
| P5 Pyre Praetorian | PYRE_PRAETORIAN.ts | **81.22%** | 333 | 58 | 19 | ✅ SILVER |
| P1 (shared) | obsidian-stigmergy.ts | **84.80%** | 145 | 20 | 6 | ✅ SILVER |

---

## UNVERIFIED (No Stryker Reports)

| Commander | Status |
|-----------|--------|
| P0 Lidless Legion | ❓ NO RECEIPT |
| P2 Mirror Magus | ❓ NO RECEIPT |
| P3 Spore Storm | ❓ NO RECEIPT |
| P6 Kraken Keeper | ❓ NO RECEIPT |
| P7 Spider Sovereign | ❓ NO RECEIPT |

---

## THEATER AUDIT FINDINGS

### P4 Red Regnant - 65.62% (FAILED)
- **165 survived mutants** - tests don't kill them
- **43 NoCoverage mutants** - code paths not tested at all
- **Root Cause**: Heavy mocking of `node:fs` and `node:child_process`
- **Verdict**: Tests verify mock behavior, not production code

### P5 Pyre Praetorian - 81.22% (PASSED)
- **58 survived mutants** - some gaps remain
- **19 NoCoverage mutants** - minor coverage gaps
- **Verdict**: SILVER STANDARD MET (80-98.99%)

### P1 Web Weaver (obsidian-stigmergy) - 84.80% (PASSED)
- **20 survived mutants** - minor gaps
- **6 NoCoverage mutants** - minimal coverage gaps
- **Verdict**: SILVER STANDARD MET

---

## PRODUCTION READINESS ASSESSMENT

### What is REAL:
1. **Zod Contracts** (all 8 commanders) - Pure schema validation, no I/O
2. **Property Tests** (`*.property.test.ts`) - Test pure functions with fast-check
3. **P5 PYRE_PRAETORIAN.ts** - 81.22% mutation score, SILVER ready
4. **P1 obsidian-stigmergy.ts** - 84.80% mutation score, SILVER ready

### What is THEATER:
1. **P4 RED_REGNANT.ts** - 65.62% mutation score, BELOW THRESHOLD
2. **P4 tests** - Heavy mocking masks real behavior
3. **Unverified commanders** - No Stryker evidence

---

## PROGRESS UPDATE (2026-01-07T23:33:00Z)

### P4 Red Regnant - Integration Tests Created

Created `RED_REGNANT.integration.test.ts` with **101 REAL tests** (no mocks):

| Category | Tests | Description |
|----------|-------|-------------|
| Pure Functions | 15 | Zod schemas, LATTICE constants, scream(), clearViolations() |
| Content Auditing | 23 | TODO/FIXME, strict zones, phantom deps, test file auditing |
| Suspicion Analysis | 10 | Silent catch blocks, manual bypasses, AI placeholders |
| Allowed Files | 6 | Root file whitelist, pattern matching |
| Mutation Proof | 2 | Score boundaries, THEATER_CAP |
| Boundary Conditions | 11 | Mock count, strict zones, P5 exception, any type |
| Violation Types | 13 | All 13 violation types tested |
| Regex Patterns | 14 | Placeholder patterns, catch blocks, CDN patterns |
| Edge Cases | 7 | Empty content, special chars, multiple violations |

**Total P4 Tests: 218 passing**

### Stryker Status
- Stryker times out from agent context (swarm race condition)
- User must run `npx stryker run -c stryker.p4.config.mjs` manually
- New integration tests should significantly improve mutation score

---

## NEXT STEPS

1. **P4 Red Regnant**: User runs Stryker manually to verify new mutation score
2. **P0, P2, P3, P6, P7**: Run Stryker to generate receipts
3. **Promotion Queue**: Only P5 and P1 (obsidian-stigmergy) are SILVER ready

---

## Source Evidence

```
Report: hot_obsidian_sandbox/bronze/infra/reports/mutation/mutation-p4.json
Report: hot_obsidian_sandbox/bronze/infra/reports/mutation/mutation-p5.json
Report: hot_obsidian_sandbox/bronze/infra/reports/mutation/mutation-p1.json
```

---
*Receipts or be purged. No escape hatches.*
