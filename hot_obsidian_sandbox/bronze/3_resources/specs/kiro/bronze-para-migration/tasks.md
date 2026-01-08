# Implementation Plan: Bronze PARA Migration

## Overview

Migrate hot_obsidian_sandbox/bronze to PARA format using a manifest-driven, non-destructive approach. All file movements are planned, reviewed, then executed with full audit trail.

## Tasks

- [ ] 1. Create PARA folder structure
  - [ ] 1.1 Create `1_projects/` with README.md
    - Explain: Projects have deadlines or clear completion criteria
    - _Requirements: 1.1, 1.2_
  - [ ] 1.2 Create `2_areas/` with README.md
    - Explain: Areas are ongoing responsibilities with no end date
    - _Requirements: 1.1, 1.2_
  - [ ] 1.3 Create `3_resources/` with README.md
    - Explain: Resources are reference material for future use
    - _Requirements: 1.1, 1.2_
  - [ ] 1.4 Create `4_archive/` with README.md
    - Explain: Archive contains completed or inactive items
    - _Requirements: 1.1, 1.2_

- [ ] 2. Generate migration manifest
  - [ ] 2.1 Create manifest generator script
    - Scan all files in bronze
    - Apply classification rules
    - Generate `_migration_manifest.jsonl`
    - _Requirements: 2.1, 2.2_
  - [ ] 2.2 Classify files into PARA categories
    - Apply pattern matching rules from design
    - Handle edge cases (uncategorized → archive)
    - _Requirements: 3.1, 4.1, 5.1, 6.1_
  - [ ] 2.3 Add HFO port tags to manifest entries
    - Extract port from filename patterns (P0-P7)
    - Mark cross-port files
    - _Requirements: 7.1, 7.2_
  - [ ] 2.4 Emit OBSIDIAN stigmergy events during scan
    - [ ] 2.4.1 Emit `obsidian.observe.file.sensed` (Port 0) for each file discovered
    - [ ] 2.4.2 Emit `obsidian.shape.data.transformed` (Port 2) for each classification
    - [ ] 2.4.3 Emit `obsidian.navigate.decision.made` (Port 7) for migration decisions
    - _Requirements: 9.1, 9.2, 9.3, 9.6_

- [ ] 3. Checkpoint - Review manifest before execution
  - Review `_migration_manifest.jsonl` for correctness
  - Ensure all files are accounted for
  - Ask user if questions arise

- [ ] 4. Execute migration
  - [ ] 4.1 Create project subfolders
    - `1_projects/gen89_phoenix/`
    - `1_projects/w3c_gesture_pipeline/`
    - `1_projects/silver_baton_quine/`
    - _Requirements: 3.2, 3.3, 3.4_
  - [ ] 4.2 Create area subfolders
    - `2_areas/hfo_ports/` with P0-P7 subfolders
    - `2_areas/infrastructure/`
    - `2_areas/contracts/`
    - `2_areas/enforcement/`
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [ ] 4.3 Create resource subfolders
    - `3_resources/strategy/`
    - `3_resources/analysis/`
    - `3_resources/templates/`
    - `3_resources/algorithms/`
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [ ] 4.4 Create archive subfolders
    - `4_archive/gen88_2026_01_06/`
    - `4_archive/gen88_jan_5/`
    - `4_archive/vertical_spikes/`
    - `4_archive/quarantine/`
    - `4_archive/demoted/`
    - `4_archive/_uncategorized/`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  - [ ] 4.5 Move files according to manifest
    - Use git mv for tracked files
    - Preserve directory structure within categories
    - _Requirements: 2.3, 1.3_
  - [ ] 4.6 Emit OBSIDIAN stigmergy events during execution
    - [ ] 4.6.1 Emit `obsidian.inject.artifact.promoted` (Port 3) for each file move
    - [ ] 4.6.2 Emit `obsidian.assimilate.relationship.linked` (Port 6) for cross-references
    - _Requirements: 9.4, 9.5, 9.7, 9.8_

- [ ] 5. Generate port index
  - [ ] 5.1 Create `_port_index.md`
    - List all files grouped by HFO port (0-7, cross)
    - Include links to new locations
    - _Requirements: 7.3_

- [ ] 6. Validate migration
  - [ ] 6.1 Count files before and after
    - Compare totals
    - List any discrepancies
    - _Requirements: 8.1, 8.2, 8.4_
  - [ ] 6.2 Generate migration report
    - Statistics by PARA category
    - Statistics by HFO port
    - List of moved files
    - _Requirements: 8.3_

- [ ] 7. Final checkpoint - Verify migration success
  - Ensure all tests pass
  - Ask user if questions arise

- [ ] 8. Seed rich stigmergy headers
  - [ ] 8.1 Install and configure Ollama
    - Install Ollama if not present
    - Pull lightweight model (qwen2.5:3b or mistral:7b)
    - Test model availability
    - _Requirements: 10.4_
  - [ ] 8.2 Create stigmergy header generator script
    - Read file content
    - Generate deterministic fields (port, verb, phase, layer, gen, para)
    - Call Ollama for semantic fields (purpose, given/when/then, relationships, tags)
    - Validate against OBSIDIAN schema
    - _Requirements: 10.1, 10.2, 10.3, 10.6_
  - [ ] 8.3 Process files in batches
    - Batch size of 10 files
    - Progress logging
    - Error recovery
    - _Requirements: 10.5_
  - [ ] 8.4 Add OpenRouter fallback
    - Detect Ollama unavailability
    - Fall back to OpenRouter API (Haiku or Llama)
    - _Requirements: 10.7_

- [ ] 9. Create PARA enforcement guards
  - [ ] 9.1 Create pre-commit hook
    - Validate new files are in PARA folders
    - Validate frontmatter presence on .md files
    - Reject commits with guidance message
    - _Requirements: 11.1, 11.2_
  - [ ] 9.2 Create GitHub Actions CI workflow
    - Trigger on PR and push to main
    - Validate PARA structure
    - Validate frontmatter schema
    - _Requirements: 11.3, 11.4, 11.5_
  - [ ] 9.3 Create scheduled audit job
    - Weekly PARA compliance audit
    - Log violations to Blood Book of Grudges
    - _Requirements: 11.6, 11.7_

- [ ] 10. Final validation checkpoint
  - Run all enforcement guards
  - Verify stigmergy headers on all files
  - Generate final migration report

## Notes

- All file moves use `git mv` to preserve history
- Manifest is append-only for audit trail
- Files marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
