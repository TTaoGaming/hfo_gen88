# Silver Tier Health Check

## Purpose
Periodic verification of Silver-tier artifacts to ensure they maintain their quality standards.

## Promoted Artifacts

| Port | Commander | Artifact | Mutation Score | Tests |
|------|-----------|----------|----------------|-------|
| 4 | RED_REGNANT | `score-classifier.ts` | 92.96% | 40 |
| 5 | PYRE_PRAETORIAN | `path-classifier.ts` | 84.07% | 58 |

## Running Health Checks

### Quick Test (Unit + Property Tests)
```bash
npx vitest run --config hot_obsidian_sandbox/silver/1_projects/health-check/vitest.silver.config.ts
```

### Full Health Check with Receipts
```bash
npx tsx hot_obsidian_sandbox/silver/1_projects/health-check/run-health-check.ts
```

### Mutation Testing (Re-verify Goldilocks)
```bash
# P4 RED REGNANT
npx stryker run hot_obsidian_sandbox/bronze/1_projects/stabilization/runners/stryker.p4.core.config.mjs

# P5 PYRE PRAETORIAN
npx stryker run hot_obsidian_sandbox/bronze/1_projects/stabilization/runners/stryker.p5.core.config.mjs
```

## Receipts
All health check results are logged to `hot_obsidian_sandbox/hot_obsidianblackboard.jsonl` with SHA-256 tamper-evident hashes.

## Promotion Date
2026-01-07 (WARLOCK_APPROVED)
