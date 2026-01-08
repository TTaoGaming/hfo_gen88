# Forensic Analysis: Red Regnant 8 SCREAM Types
> Date: 2026-01-07T19:30:00Z
> Analyst: Kiro (Gen 88)
> Provenance: P4_RED_REGNANT_LEDGER.md, RED_REGNANT.ts, contracts/index.ts

## Executive Summary

P4 Red Regnant currently has **13 violation types** defined in contracts but the implementation is scattered. This analysis maps the existing types to a canonical set of **8 SCREAM types** aligned with the 8 Legendary Commanders and HIVE/8 workflow.

## Current State Analysis

### Existing Violation Types (contracts/index.ts)

```typescript
ViolationTypeSchema = z.enum([
  'THEATER',          // 100% scores, assertionless tests, mock-overuse
  'POLLUTION',        // Illegal files in root/bronze
  'AMNESIA',          // Debug logs in Strict Zones
  'BESPOKE',          // 'any' without // @bespoke
  'VIOLATION',        // Missing provenance or headers
  'MUTATION_FAILURE', // Score < 80% (Silver Standard)
  'MUTATION_GAP',     // Mutation report missing or malformed
  'LATTICE_BREACH',   // Octal governance violations
  'BDD_MISALIGNMENT', // Missing traceability
  'OMISSION',         // Silent success/catch blocks
  'PHANTOM',          // External/CDN dependencies
  'SUSPICION',        // Behavioral anomalies
  'DEBT',             // TODO/FIXME in codebase
]);
```

### Implementation Coverage (RED_REGNANT.ts)

| Violation Type | Detection Function | Status |
|:---------------|:-------------------|:-------|
| THEATER | `auditContent()`, `analyzeSuspicion()` | ✅ Implemented |
| POLLUTION | `checkRootPollution()` | ✅ Implemented |
| AMNESIA | `auditContent()` | ✅ Implemented |
| BESPOKE | `auditContent()` | ✅ Implemented |
| VIOLATION | `checkSilverShroud()` | ✅ Implemented |
| MUTATION_FAILURE | `checkMutationProof()` | ✅ Implemented |
| MUTATION_GAP | `checkMutationProof()` | ✅ Implemented |
| LATTICE_BREACH | `checkLatticeHealth()` | ✅ Implemented |
| BDD_MISALIGNMENT | `auditContent()` | ✅ Implemented |
| OMISSION | `analyzeSuspicion()` | ✅ Implemented |
| PHANTOM | `auditContent()` | ✅ Implemented |
| SUSPICION | `analyzeSuspicion()` | ✅ Implemented |
| DEBT | `auditContent()` | ⚠️ Partial (merged with AMNESIA) |

## Proposed 8 SCREAM Architecture

Aligning with the 8 Legendary Commanders and HIVE/8 workflow:

### The 8 Canonical SCREAMs

| # | SCREAM Name | Verb | Detection Target | Commander Alignment |
|:--|:------------|:-----|:-----------------|:--------------------|
| 0 | **SCREAM_BLINDSPOT** | SENSE | Missing observations, silent failures | P0 Lidless Legion |
| 1 | **SCREAM_BREACH** | FUSE | Contract violations, schema mismatches | P1 Web Weaver |
| 2 | **SCREAM_THEATER** | SHAPE | Fake tests, mock poisoning, 100% scores | P2 Mirror Magus |
| 3 | **SCREAM_PHANTOM** | DELIVER | External deps, CDN pollution, supply chain | P3 Spore Storm |
| 4 | **SCREAM_MUTATION** | DISRUPT | Score < 80%, score > 99%, missing reports | P4 Red Regnant |
| 5 | **SCREAM_POLLUTION** | IMMUNIZE | Root pollution, medallion violations | P5 Pyre Praetorian |
| 6 | **SCREAM_AMNESIA** | STORE | Debug logs, TODO/FIXME, lost context | P6 Kraken Keeper |
| 7 | **SCREAM_LATTICE** | DECIDE | Octal governance, BDD misalignment | P7 Spider Sovereign |

### Mapping Old → New

| Old Type | New SCREAM | Rationale |
|:---------|:-----------|:----------|
| THEATER | SCREAM_THEATER | Direct mapping |
| POLLUTION | SCREAM_POLLUTION | Direct mapping |
| AMNESIA | SCREAM_AMNESIA | Direct mapping |
| BESPOKE | SCREAM_BREACH | Type safety is contract law |
| VIOLATION | SCREAM_BREACH | Missing provenance = contract breach |
| MUTATION_FAILURE | SCREAM_MUTATION | Direct mapping |
| MUTATION_GAP | SCREAM_MUTATION | Same category |
| LATTICE_BREACH | SCREAM_LATTICE | Direct mapping |
| BDD_MISALIGNMENT | SCREAM_LATTICE | Governance category |
| OMISSION | SCREAM_BLINDSPOT | Silent failures = missing observation |
| PHANTOM | SCREAM_PHANTOM | Direct mapping |
| SUSPICION | SCREAM_BLINDSPOT | Behavioral anomalies = sensing |
| DEBT | SCREAM_AMNESIA | Technical debt = lost context |

## Silver Implementation Status

### Current Silver P4 (score-classifier.ts)

```
hot_obsidian_sandbox/silver/2_areas/P4_RED_REGNANT/
├── contracts/
│   └── index.ts          # SILVER_STANDARD, ViolationTypeSchema
├── core/
│   ├── score-classifier.ts           # classifyScore, createScreamReceipt
│   ├── score-classifier.test.ts      # Unit tests
│   └── score-classifier.property.test.ts  # Property tests
```

**Mutation Score**: 92.96% (Goldilocks ✅)

### Missing Silver Components

1. **8 SCREAM Detectors** - Individual detection modules for each SCREAM type
2. **SCREAM Receipt Factory** - Unified receipt creation with SHA-256 hashing
3. **SCREAM Aggregator** - Combines all detectors into single audit
4. **Property Tests** - For each SCREAM type

## Bronze Artifacts Inventory

### P4_RED_REGNANT Bronze Structure

```
hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P4_RED_REGNANT/
├── contracts/index.ts           # Zod schemas (13 violation types)
├── core/score-classifier.ts     # Score classification (promoted to Silver)
├── RED_REGNANT.ts               # Main implementation (needs refactor)
├── RED_REGNANT.test.ts          # Tests
├── RED_REGNANT.property.test.ts # Property tests
├── BLOOD_BOOK_OF_GRUDGES.jsonl  # Violation ledger
├── OWASP_LLM_TOP10/             # Security playbooks
├── ATTACK_PLAYBOOKS.md          # MITRE ATT&CK integration
└── P4_RED_REGNANT_LEDGER.md     # Commander ledger
```

### Key Files for Refactor

| File | Lines | Purpose | Action |
|:-----|:------|:--------|:-------|
| RED_REGNANT.ts | ~400 | Monolithic implementation | Split into 8 detectors |
| contracts/index.ts | ~80 | Violation schemas | Expand to 8 SCREAM schemas |
| BLOOD_BOOK_OF_GRUDGES.jsonl | ~100 | Historical violations | Migrate to new format |

## Recommendations

### Phase 1: Contract Upgrade (Bronze)
1. Create `contracts/screams.ts` with 8 SCREAM schemas
2. Create `contracts/receipts.ts` with unified receipt factory
3. Add property tests for schema validation

### Phase 2: Detector Implementation (Bronze)
1. Create `detectors/` folder with 8 detector modules
2. Each detector: `detect{ScreamName}.ts` + `detect{ScreamName}.test.ts`
3. Property tests for each detector

### Phase 3: Silver Promotion
1. Promote detectors that achieve Goldilocks mutation score
2. Create unified `performScreamAudit()` in Silver
3. Integrate with P5 Pyre Praetorian for enforcement

## Risk Assessment

| Risk | Severity | Mitigation |
|:-----|:---------|:-----------|
| Breaking existing violations | HIGH | Maintain backward compatibility mapping |
| Test coverage gaps | MEDIUM | Property tests for each SCREAM |
| Performance regression | LOW | Lazy loading of detectors |

---

**Next Action**: Create spec for P4 Red Regnant 8 SCREAM upgrade
