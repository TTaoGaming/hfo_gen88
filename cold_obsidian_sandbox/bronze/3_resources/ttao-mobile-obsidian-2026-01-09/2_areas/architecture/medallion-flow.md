# 🏅 Medallion Architecture
**Reference**: PARA + Refinement Flow
**Layer**: 2_areas (Infrastructure)

---

## The 8-Stage Refinement Sequence

```
Stage 1: Hot Bronze   ← Kinetic, active development
    ↓
Stage 2: Cold Bronze  ← Hardened, read-only (requires Receipt)
    ↓
Stage 3: Hot Silver   ← Consolidated, verified integration
    ↓
Stage 4: Cold Silver  ← Hardened integration truth
    ↓
Stage 5: Hot Gold     ← Canonical manifest
    ↓
Stage 6: Cold Gold    ← Immutable truth
    ↓
Stage 7: Hot HFO      ← Synergistic, cross-port fusion
    ↓
Stage 8: Cold HFO     ← Omniscient, MAP ELITE truth
```

---

## PARA Structure (Per Medallion)

```
medallion/
├── 1_projects/   ← Active execution units
├── 2_areas/      ← Stable infrastructure
├── 3_resources/  ← Knowledge fragments
└── 4_archive/    ← Quarantined history
```

---

## Critical Rules

### Tripwire Rule
> **NEVER** move directly from Hot Bronze to Hot Silver.
> All code MUST cool in Cold Bronze first.

### Receipt Requirement
Moving to Cold Bronze requires:
- Mutation Score ≥ 88%
- Hashed manifest
- Tamper-Evident Receipt in `3_resources/receipts/`

### No Theater Rule
> Do not report "Green" without "Red".
> Every implementation in Silver must have a corresponding test.

---

## Sandbox Architecture

```
workspace/
├── hot_obsidian_sandbox/    ← Active kinetic work
│   ├── bronze/              ← 🟡 STABILIZING
│   ├── silver/              ← 🔴 DEMOTED
│   ├── gold/                ← ⚪ EMPTY
│   └── hfo/                 ← Cross-port fusion
│
└── cold_obsidian_sandbox/   ← Hardened archive
    ├── bronze/              ← Read-only stabilization
    ├── silver/              ← Verified integration
    ├── gold/                ← Canonical truth
    └── hfo/                 ← MAP ELITE truth
```

---

## Stigmergy Blackboards

| Blackboard | Purpose |
|:---|:---|
| `hot_obsidianblackboard.jsonl` | Active kinetic signals |
| `cold_obsidianblackboard.jsonl` | Hardened historical record |
| `BLOOD_BOOK_OF_GRUDGES.jsonl` | Port 4 violation ledger |

---

## Goldilocks Zone

| Score | Status | Action |
|:---:|:---:|:---|
| < 80% | 🔴 REJECT | Under-tested → Bronze |
| 80-87% | 🟡 WARN | Debt → Silver with warning |
| 88-98% | 🟢 TARGET | Pareto optimal |
| > 99% | 🔴 SCREAM | AI Theater detected |

---

*See: [[../commanders/index]] for port responsibilities*
