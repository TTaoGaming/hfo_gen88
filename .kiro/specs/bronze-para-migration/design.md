# Design Document

## Overview

This design describes the migration of hot_obsidian_sandbox/bronze to PARA format. The migration uses a manifest-driven approach where all file movements are planned first, reviewed, then executed with full audit trail.

## Architecture

### Target PARA Structure

```
hot_obsidian_sandbox/bronze/
├── 1_projects/                    # Active work with deadlines
│   ├── README.md
│   ├── gen89_phoenix/             # Gen 89 bootstrap
│   ├── w3c_gesture_pipeline/      # W3C pointer pipeline
│   └── silver_baton_quine/        # Baton validator spec
│
├── 2_areas/                       # Ongoing responsibilities
│   ├── README.md
│   ├── hfo_ports/                 # P0-P7 ledgers and kinetics
│   ├── infrastructure/            # Scripts, infra, tests
│   ├── contracts/                 # Zod schemas, interfaces
│   └── enforcement/               # Red Regnant, Pyre Praetorian
│
├── 3_resources/                   # Reference material
│   ├── README.md
│   ├── strategy/                  # TTV, HFO vision docs
│   ├── analysis/                  # Trade studies, reports
│   ├── templates/                 # Ledger template, exemplars
│   └── algorithms/                # One Euro, sensor fusion
│
├── 4_archive/                     # Completed/inactive
│   ├── README.md
│   ├── gen88_2026_01_06/          # Today's archive
│   ├── gen88_jan_5/               # Previous archive
│   ├── vertical_spikes/           # v1-v4 summaries
│   ├── quarantine/                # Demoted files
│   └── _uncategorized/            # Unclassified files
│
├── _migration_manifest.jsonl      # Audit trail
└── _port_index.md                 # HFO port cross-reference
```

## Components and Interfaces

### Migration Manifest Schema

```typescript
interface MigrationEntry {
  id: string;                      // UUID
  timestamp: string;               // ISO 8601
  originalPath: string;            // Path before migration
  newPath: string;                 // Path after migration
  paraCategory: 'project' | 'area' | 'resource' | 'archive';
  hfoPort: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 'cross' | null;
  reason: string;                  // Why this classification
  fileType: 'file' | 'directory';
}
```

### Classification Rules

```typescript
const classificationRules = {
  projects: {
    patterns: [
      /gen89/i,
      /w3c.*gesture/i,
      /silver.*baton/i,
      /HANDOFF.*CONSOLIDATED/i,
    ],
    recencyDays: 7,
  },
  areas: {
    patterns: [
      /^P[0-7]_.*LEDGER/i,
      /^P[0-7]_.*KINETIC/i,
      /contracts\//i,
      /adapters\//i,
      /scripts\//i,
      /infra\//i,
      /tests\//i,
    ],
  },
  resources: {
    patterns: [
      /STRATEGY/i,
      /REPORT/i,
      /MATRIX/i,
      /TEMPLATE/i,
      /exemplars\//i,
      /one.*euro/i,
      /sensor.*fusion/i,
    ],
  },
  archive: {
    patterns: [
      /archive/i,
      /quarantine/i,
      /demoted/i,
      /vertical.*spike.*summary.*v[1-4]/i,
    ],
  },
};
```

## Data Models

### File Classification Map

| Current Location | PARA Category | New Location | Port |
|------------------|---------------|--------------|------|
| `SILVER_BATON_GEN89.md` | project | `1_projects/gen89_phoenix/` | 7 |
| `W3C_GESTURE_PIPELINE_HANDOFF.md` | project | `1_projects/w3c_gesture_pipeline/` | 0 |
| `HANDOFF_ANALYSIS_CONSOLIDATED/` | project | `1_projects/gen89_phoenix/handoff/` | 7 |
| `kiro_gen89_vertical_spike_summary/` | project | `1_projects/gen89_phoenix/spikes/` | 7 |
| `P0_LIDLESS_LEGION_LEDGER.md` | area | `2_areas/hfo_ports/P0/` | 0 |
| `P4_RED_REGNANT_LEDGER.md` | area | `2_areas/hfo_ports/P4/` | 4 |
| `contracts/` | area | `2_areas/contracts/` | 5 |
| `adapters/` | area | `2_areas/infrastructure/adapters/` | 2 |
| `scripts/` | area | `2_areas/infrastructure/scripts/` | cross |
| `TOTAL_TOOL_VIRTUALIZATION_STRATEGY.md` | resource | `3_resources/strategy/` | 7 |
| `TRL_APEX_ASSIMILATION_REPORT.md` | resource | `3_resources/analysis/` | 7 |
| `LEDGER_TEMPLATE.md` | resource | `3_resources/templates/` | cross |
| `archive_2026_1_6/` | archive | `4_archive/gen88_2026_01_06/` | cross |
| `archive_jan_5/` | archive | `4_archive/gen88_jan_5/` | cross |
| `quarantine/` | archive | `4_archive/quarantine/` | 4 |
| `demoted_silver/` | archive | `4_archive/demoted/` | cross |

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system.*

### Property 1: File Count Preservation

*For any* migration execution, the total count of files before migration SHALL equal the total count after migration.

**Validates: Requirements 2.3**

### Property 2: Manifest Completeness

*For any* file in the bronze directory, there SHALL exist exactly one entry in the migration manifest.

**Validates: Requirements 2.1, 2.2**

### Property 3: PARA Category Exclusivity

*For any* file, it SHALL be assigned to exactly one PARA category (project, area, resource, or archive).

**Validates: Requirements 3.1, 4.1, 5.1, 6.1**

### Property 4: Path Validity

*For any* migration entry, the newPath SHALL be a valid path under one of the four PARA folders.

**Validates: Requirements 1.1**

## Error Handling

| Error | Handling |
|-------|----------|
| File already exists at target | Append timestamp suffix |
| Permission denied | Log to manifest, skip file |
| Circular symlink | Log warning, treat as file |
| Unknown file type | Place in `4_archive/_uncategorized/` |

## Testing Strategy

### Unit Tests
- Classification rule matching
- Manifest entry generation
- Path construction
- OBSIDIAN event creation

### Property Tests
- File count preservation (fast-check)
- Manifest completeness (fast-check)
- PARA category exclusivity (fast-check)
- OBSIDIAN port-verb consistency (fast-check)
- OBSIDIAN round-trip serialization (fast-check)

### Integration Tests
- Full migration dry-run
- Manifest validation
- Port index generation
- Stigmergy event emission

## OBSIDIAN Stigmergy Integration

The migration system emits events to `obsidianblackboard.jsonl` using the OBSIDIAN stigmergy format.

### Event Flow

```
File Discovery (Port 0: OBSERVE)
    ↓
Classification (Port 2: SHAPE)
    ↓
Relationship Extraction (Port 6: ASSIMILATE)
    ↓
Migration Decision (Port 7: NAVIGATE)
    ↓
File Move (Port 3: INJECT)
```

### Event Schema Reference

See `hot_obsidian_sandbox/silver/contracts/obsidian-stigmergy.ts` for the full Zod schema.

### Example Migration Events

```jsonl
{"specversion":"1.0","id":"...","source":"hfo://gen88/bronze/port/0","type":"obsidian.observe.file.sensed","obsidianport":0,"obsidianverb":"OBSERVE","obsidianphase":"H","given":"file at bronze/W3C_GESTURE_PIPELINE_HANDOFF.md","when":"migration scan started","then":"file metadata extracted","data":{"path":"bronze/W3C_GESTURE_PIPELINE_HANDOFF.md","size":1234}}
{"specversion":"1.0","id":"...","source":"hfo://gen88/bronze/port/2","type":"obsidian.shape.data.transformed","obsidianport":2,"obsidianverb":"SHAPE","obsidianphase":"V","given":"file metadata available","when":"classification rules applied","then":"PARA category assigned: project","data":{"para":"project","port":0}}
{"specversion":"1.0","id":"...","source":"hfo://gen88/bronze/port/3","type":"obsidian.inject.artifact.promoted","obsidianport":3,"obsidianverb":"INJECT","obsidianphase":"E","given":"classification complete","when":"migration executed","then":"file moved to 1_projects/w3c_gesture_pipeline/","data":{"from":"bronze/W3C_GESTURE_PIPELINE_HANDOFF.md","to":"bronze/1_projects/w3c_gesture_pipeline/W3C_GESTURE_PIPELINE_HANDOFF.md"}}
```

## Rich Stigmergy File Headers

Each markdown file receives a YAML frontmatter header with HFO stigmergy metadata.

### Header Schema

```yaml
---
hfo:
  # Deterministic fields (script-generated)
  port: 0                                    # HFO port (0-7 or null)
  verb: OBSERVE                              # OBSIDIAN verb
  phase: H                                   # HIVE phase (H/I/V/E)
  layer: bronze                              # Medallion layer
  gen: 88                                    # Generation number
  para: project                              # PARA category
  subfolder: w3c_gesture_pipeline            # PARA subfolder
  migrated: 2026-01-06T12:00:00Z             # Migration timestamp
  original: W3C_GESTURE_PIPELINE_HANDOFF.md  # Original path
  
  # Semantic fields (LLM-generated)
  purpose: "Handoff document for W3C Pointer Events gesture pipeline"
  given: "Gen 88 W3C gesture work exists"
  when: "Gen 89 agent reads this file"
  then: "Agent understands pipeline architecture"
  relationships:
    - 2_areas/hfo_ports/P0/P0_LIDLESS_LEGION_LEDGER.md
    - 1_projects/w3c_gesture_pipeline/P0_GESTURE_MONOLITH/
  tags: [w3c, pointer-events, gesture, pipeline, handoff]
---
```

### LLM Provider Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Stigmergy Header Generator                │
├─────────────────────────────────────────────────────────────┤
│  1. Try Ollama (local, free)                                │
│     - qwen2.5:3b (2GB VRAM, fast)                           │
│     - mistral:7b (5GB VRAM, better quality)                 │
│     - llama3.1:8b (6GB VRAM, best quality)                  │
│                                                             │
│  2. Fallback to OpenRouter (if Ollama unavailable)          │
│     - claude-3-haiku (~$0.001/file)                         │
│     - llama-3.1-8b (~$0.0003/file)                          │
└─────────────────────────────────────────────────────────────┘
```

### Batch Processing

- Batch size: 10 files
- Progress: Logged to console and blackboard
- Errors: Logged, file skipped, continue with next
- Retry: Failed files queued for manual review

## PARA Structure Enforcement

### Pre-commit Hook

```bash
#!/bin/bash
# .husky/pre-commit

# Validate PARA structure
npx tsx hot_obsidian_sandbox/bronze/scripts/validate-para.ts

# Check frontmatter on new .md files
git diff --cached --name-only --diff-filter=A | grep '\.md$' | while read file; do
  if ! head -1 "$file" | grep -q '^---$'; then
    echo "ERROR: $file missing frontmatter"
    exit 1
  fi
done
```

### GitHub Actions Workflow

```yaml
# .github/workflows/para-enforcement.yml
name: PARA Enforcement
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx tsx hot_obsidian_sandbox/bronze/scripts/validate-para.ts
      - run: npx tsx hot_obsidian_sandbox/bronze/scripts/validate-frontmatter.ts
```

### Scheduled Audit

```yaml
# .github/workflows/para-audit.yml
name: Weekly PARA Audit
on:
  schedule:
    - cron: '0 0 * * 0'  # Every Sunday at midnight
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx tsx hot_obsidian_sandbox/bronze/scripts/para-audit.ts
      # Violations logged to Blood Book of Grudges
```
