# Bronze Medallion Datalake Organization: Trade Study

**Date**: 2026-01-06T23:15:00Z
**Purpose**: Evaluate non-destructive organization systems for bronze layer
**Constraint**: Must preserve existing files, add structure via metadata/symlinks/manifests

---

## The 4 Options

### Option A: PARA (Projects, Areas, Resources, Archive)

Tiago Forte's system for actionable knowledge management.

```
bronze/
├── 1_projects/          # Active work with deadlines (Gen 89 bootstrap)
├── 2_areas/             # Ongoing responsibilities (8 ports, TTV campaign)
├── 3_resources/         # Reference material (contracts, algorithms)
├── 4_archive/           # Completed/inactive (Gen 88 artifacts)
└── _index/              # Symlinks to originals (non-destructive)
```

**Non-destructive implementation**: Create `_index/` with symlinks organized by PARA, leave originals in place.

### Option B: Johnny Decimal (Category.ID System)

Hierarchical numbering with strict 10-category limit per level.

```
bronze/
├── 10-19_infrastructure/
│   ├── 11_contracts/
│   ├── 12_adapters/
│   └── 13_scripts/
├── 20-29_ports/
│   ├── 20_P0_sense/
│   ├── 24_P4_disrupt/
│   └── 27_P7_navigate/
├── 30-39_campaigns/
│   ├── 31_TTV/
│   └── 32_W3C_gesture/
└── 90-99_archive/
    └── 91_gen88_handoff/
```

**Non-destructive implementation**: Create numbered manifest files that reference originals by path.

### Option C: Zettelkasten-Hybrid (Atomic Notes + Links)

Luhmann's slip-box adapted for code artifacts with bidirectional links.

```
bronze/
├── _zettel/                    # Index cards (metadata only)
│   ├── 202601061500_one_euro_filter.md
│   ├── 202601061501_mediapipe_adapter.md
│   └── 202601061502_pointer_contracts.md
├── _graph/                     # Link graph (JSONL)
│   └── links.jsonl
└── [original files unchanged]
```

**Non-destructive implementation**: Create `_zettel/` with atomic index cards pointing to originals, `_graph/` for relationships.

### Option D: HFO-Native (Port x Domain Galois Grid)

Your existing 8-port architecture as the organizing principle.

```
bronze/
├── _galois/                    # 8x8 grid index
│   ├── P0_sense/              # Port 0 artifacts
│   ├── P1_fuse/               # Port 1 artifacts
│   ├── P2_shape/              # Port 2 artifacts
│   ├── P3_deliver/            # Port 3 artifacts
│   ├── P4_disrupt/            # Port 4 artifacts
│   ├── P5_defend/             # Port 5 artifacts
│   ├── P6_store/              # Port 6 artifacts
│   ├── P7_navigate/           # Port 7 artifacts
│   └── _cross_port/           # Multi-port artifacts
└── [original files unchanged]
```

**Non-destructive implementation**: Create `_galois/` with symlinks/manifests organized by port assignment.

---

## Matrix Trade Study

### Evaluation Criteria

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Non-Destructive | 5 | Preserves existing files completely |
| AI-Parseable | 4 | Easy for LLMs to navigate and understand |
| Human-Navigable | 3 | Intuitive for humans to browse |
| Scalability | 3 | Works as bronze grows (100s to 1000s of files) |
| HFO Alignment | 4 | Fits existing 8-port architecture |
| Migration Effort | 2 | Time to implement |

### Scoring Matrix (1-5, higher is better)

| Criterion | Weight | PARA | Johnny Decimal | Zettelkasten | HFO-Native |
|-----------|--------|------|----------------|--------------|------------|
| Non-Destructive | 5 | 5 | 4 | 5 | 5 |
| AI-Parseable | 4 | 4 | 5 | 3 | 4 |
| Human-Navigable | 3 | 5 | 4 | 3 | 4 |
| Scalability | 3 | 3 | 5 | 4 | 4 |
| HFO Alignment | 4 | 2 | 3 | 3 | 5 |
| Migration Effort | 2 | 4 | 3 | 2 | 4 |

### Weighted Scores

| Option | Calculation | Total |
|--------|-------------|-------|
| **PARA** | (5×5)+(4×4)+(3×5)+(3×3)+(4×2)+(2×4) | **73** |
| **Johnny Decimal** | (5×4)+(4×5)+(3×4)+(3×5)+(4×3)+(2×3) | **75** |
| **Zettelkasten** | (5×5)+(4×3)+(3×3)+(3×4)+(4×3)+(2×2) | **66** |
| **HFO-Native** | (5×5)+(4×4)+(3×4)+(3×4)+(4×5)+(2×4) | **81** |

---

## Detailed Analysis

### Option A: PARA

**Strengths**:
- Intuitive actionability hierarchy (projects → areas → resources → archive)
- Well-documented methodology with community support
- Natural fit for "what should I work on next?"

**Weaknesses**:
- Doesn't align with 8-port architecture
- "Areas" vs "Resources" distinction can be fuzzy for code artifacts
- Requires constant re-categorization as projects complete

**Best For**: Personal knowledge management, not code datalakes

### Option B: Johnny Decimal

**Strengths**:
- Strict numbering prevents folder sprawl
- Highly AI-parseable (numbers are unambiguous)
- Scales well with clear boundaries

**Weaknesses**:
- 10-category limit per level can feel arbitrary
- Numbers don't carry semantic meaning for HFO
- Requires upfront category planning

**Best For**: Large organizations with stable category structures

### Option C: Zettelkasten-Hybrid

**Strengths**:
- Atomic notes enable fine-grained linking
- Bidirectional links capture relationships
- Timestamp-based IDs are collision-free

**Weaknesses**:
- High overhead to create index cards for each artifact
- Graph navigation requires tooling
- Less intuitive for browsing

**Best For**: Research-heavy knowledge bases, not operational code

### Option D: HFO-Native (RECOMMENDED)

**Strengths**:
- Directly aligns with existing 8-port architecture
- Port assignment is already defined in your system
- Cross-port artifacts have explicit home
- Leverages existing Galois lattice mental model

**Weaknesses**:
- Requires port assignment for each artifact
- Some artifacts span multiple ports
- Unique to HFO (no external documentation)

**Best For**: Your specific use case

---

## Recommendation: HFO-Native with PARA Overlay

**Hybrid approach**: Use HFO-Native as primary structure, PARA as secondary filter.

```
bronze/
├── _index/                          # Non-destructive overlay
│   ├── by_port/                     # HFO-Native (primary)
│   │   ├── P0_sense/
│   │   ├── P4_disrupt/
│   │   └── P7_navigate/
│   ├── by_actionability/            # PARA (secondary)
│   │   ├── 1_active/               # Currently working on
│   │   ├── 2_reference/            # Useful but not active
│   │   └── 3_archive/              # Historical
│   └── manifest.jsonl               # Machine-readable index
└── [all original files unchanged]
```

### Implementation (Non-Destructive)

```typescript
// manifest.jsonl entry format
interface BronzeArtifact {
  path: string;           // Original file path
  port: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 'cross';
  actionability: 'active' | 'reference' | 'archive';
  tags: string[];         // Semantic tags
  lastMined: string;      // ISO timestamp
  signalQuality: 'critical' | 'high' | 'medium' | 'low';
}
```

### Migration Steps

1. Create `bronze/_index/` folder
2. Generate `manifest.jsonl` from existing files
3. Create symlinks in `by_port/` and `by_actionability/`
4. Update mining scripts to maintain manifest

---

## Decision Matrix Summary

| Rank | Option | Score | Recommendation |
|------|--------|-------|----------------|
| 1 | **HFO-Native** | 81 | PRIMARY - Aligns with architecture |
| 2 | Johnny Decimal | 75 | CONSIDER - If strict numbering needed |
| 3 | PARA | 73 | OVERLAY - For actionability filter |
| 4 | Zettelkasten | 66 | SKIP - Too much overhead |

**Final Recommendation**: HFO-Native with PARA overlay, implemented via `_index/` folder with symlinks and `manifest.jsonl`.

---

*Trade Study by: Kiro (Claude Sonnet 4)*
*Timestamp: 2026-01-06T23:15:00Z*
