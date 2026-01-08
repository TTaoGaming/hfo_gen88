# Requirements Document

## Introduction

Migrate the hot_obsidian_sandbox/bronze directory from its current unstructured state to PARA (Projects, Areas, Resources, Archive) format. This migration must be non-destructive, preserving all existing files while reorganizing them into the PARA hierarchy with proper cross-references.

## Glossary

- **PARA**: Tiago Forte's organizational system - Projects, Areas, Resources, Archive
- **Project**: Active work with a deadline or clear completion criteria
- **Area**: Ongoing responsibility with no end date
- **Resource**: Reference material for future use
- **Archive**: Completed or inactive items
- **Migration_Manifest**: JSONL file tracking all file movements
- **Cross_Reference**: Symlink or markdown link preserving original path access
- **OBSIDIAN**: HFO 8-port verb system - Observe, Bridge, Shape, Inject, Disrupt, Immunize, Assimilate, Navigate
- **Stigmergy**: Indirect coordination through environment modification (JSONL event log)
- **CloudEvents**: CNCF standard for event envelope format
- **W3C_Trace_Context**: Distributed tracing standard with traceparent/tracestate headers
- **HIVE_Phase**: Workflow phase - Hunt (H), Interlock (I), Validate (V), Evolve (E)

## Requirements

### Requirement 1: PARA Folder Structure

**User Story:** As a developer, I want the bronze layer organized into PARA folders, so that I can quickly find active work vs reference material.

#### Acceptance Criteria

1. THE Migration_System SHALL create four top-level folders: `1_projects/`, `2_areas/`, `3_resources/`, `4_archive/`
2. WHEN a folder is created, THE Migration_System SHALL include a README.md explaining the PARA category purpose
3. THE Migration_System SHALL preserve the existing folder structure within each PARA category

### Requirement 2: Non-Destructive Migration

**User Story:** As a developer, I want all original files preserved with their paths tracked, so that I can recover or reference original locations.

#### Acceptance Criteria

1. THE Migration_System SHALL create a `_migration_manifest.jsonl` tracking every file move
2. WHEN a file is moved, THE Migration_System SHALL log the original path, new path, timestamp, and category assignment
3. THE Migration_System SHALL NOT delete any files during migration
4. IF a file cannot be categorized, THEN THE Migration_System SHALL place it in `4_archive/_uncategorized/`

### Requirement 3: Project Classification

**User Story:** As a developer, I want active work items in Projects, so that I know what needs immediate attention.

#### Acceptance Criteria

1. WHEN classifying files, THE Migration_System SHALL identify active projects by recency (modified in last 7 days) or explicit project markers
2. THE Migration_System SHALL move Gen 89 bootstrap materials to `1_projects/gen89_phoenix/`
3. THE Migration_System SHALL move W3C gesture pipeline work to `1_projects/w3c_gesture_pipeline/`
4. THE Migration_System SHALL move Silver Baton Quine spec work to `1_projects/silver_baton_quine/`

### Requirement 4: Area Classification

**User Story:** As a developer, I want ongoing responsibilities in Areas, so that I can maintain them over time.

#### Acceptance Criteria

1. THE Migration_System SHALL move 8-port ledgers (P0-P7) to `2_areas/hfo_ports/`
2. THE Migration_System SHALL move infrastructure code to `2_areas/infrastructure/`
3. THE Migration_System SHALL move contracts/schemas to `2_areas/contracts/`
4. THE Migration_System SHALL move enforcement scripts to `2_areas/enforcement/`

### Requirement 5: Resource Classification

**User Story:** As a developer, I want reference materials in Resources, so that I can find them when needed.

#### Acceptance Criteria

1. THE Migration_System SHALL move strategy documents to `3_resources/strategy/`
2. THE Migration_System SHALL move trade studies and reports to `3_resources/analysis/`
3. THE Migration_System SHALL move templates and exemplars to `3_resources/templates/`
4. THE Migration_System SHALL move algorithm implementations (One Euro, etc.) to `3_resources/algorithms/`

### Requirement 6: Archive Classification

**User Story:** As a developer, I want completed or inactive items in Archive, so that they don't clutter active work.

#### Acceptance Criteria

1. THE Migration_System SHALL move all `archive_*` folders to `4_archive/`
2. THE Migration_System SHALL move quarantine folder to `4_archive/quarantine/`
3. THE Migration_System SHALL move demoted_silver to `4_archive/demoted/`
4. THE Migration_System SHALL move historical vertical spike summaries (v1-v4) to `4_archive/vertical_spikes/`
5. THE Migration_System SHALL preserve date-based naming in archive subfolders

### Requirement 7: HFO Port Tagging

**User Story:** As a developer, I want files tagged with their HFO port assignment, so that I can filter by architectural concern.

#### Acceptance Criteria

1. WHEN a file is moved, THE Migration_System SHALL add frontmatter with `port:` tag if applicable
2. THE Migration_System SHALL support port values 0-7 or `cross` for multi-port files
3. THE Migration_System SHALL create `_port_index.md` listing all files by port assignment

### Requirement 8: Migration Validation

**User Story:** As a developer, I want to verify the migration completed correctly, so that I can trust the new structure.

#### Acceptance Criteria

1. THE Migration_System SHALL count files before and after migration
2. WHEN migration completes, THE Migration_System SHALL verify file counts match
3. THE Migration_System SHALL generate a migration report with statistics
4. IF file counts don't match, THEN THE Migration_System SHALL list missing files

### Requirement 9: OBSIDIAN Stigmergy Events

**User Story:** As an AI agent, I want migration events logged in OBSIDIAN stigmergy format, so that I can query and correlate agent actions across the 8-port architecture.

#### Acceptance Criteria

1. THE Migration_System SHALL emit OBSIDIAN stigmergy events to `obsidianblackboard.jsonl`
2. WHEN a file is observed, THE Migration_System SHALL emit an `obsidian.observe.file.sensed` event (Port 0)
3. WHEN a file is classified, THE Migration_System SHALL emit an `obsidian.shape.data.transformed` event (Port 2)
4. WHEN a file is moved, THE Migration_System SHALL emit an `obsidian.inject.artifact.promoted` event (Port 3)
5. WHEN a relationship is discovered, THE Migration_System SHALL emit an `obsidian.assimilate.relationship.linked` event (Port 6)
6. WHEN a migration decision is made, THE Migration_System SHALL emit an `obsidian.navigate.decision.made` event (Port 7)
7. THE Migration_System SHALL include W3C traceparent for distributed tracing
8. THE Migration_System SHALL include BDD context (given/when/then) in each event

### Requirement 10: Rich Stigmergy File Headers

**User Story:** As an AI agent, I want each markdown file to have a rich YAML frontmatter header with HFO stigmergy metadata, so that I can parse and understand file context without reading the full content.

#### Acceptance Criteria

1. THE Migration_System SHALL add YAML frontmatter to all `.md` files during migration
2. THE frontmatter SHALL include deterministic fields: port, verb, phase, layer, gen, para, migrated timestamp, original path
3. THE frontmatter SHALL include semantic fields generated by local LLM: purpose, given/when/then, relationships, tags
4. THE Migration_System SHALL use Ollama with a lightweight model (qwen2.5:3b, llama3.2:3b, or mistral:7b) for semantic field generation
5. THE Migration_System SHALL process files in batches of 10 to manage memory
6. THE Migration_System SHALL validate generated frontmatter against OBSIDIAN schema
7. IF Ollama is unavailable, THEN THE Migration_System SHALL fall back to OpenRouter API

### Requirement 11: PARA Structure Enforcement

**User Story:** As a developer, I want automated guards to enforce the PARA structure, so that the organization doesn't degrade over time.

#### Acceptance Criteria

1. THE Migration_System SHALL create a pre-commit hook that validates PARA structure
2. WHEN a file is added outside PARA folders, THE pre-commit hook SHALL reject the commit with guidance
3. THE Migration_System SHALL create a GitHub Actions workflow for CI/CD validation
4. THE CI/CD workflow SHALL run on every PR and push to main
5. THE CI/CD workflow SHALL validate: PARA folder structure, frontmatter presence, frontmatter schema compliance
6. THE Migration_System SHALL create a scheduled weekly job to audit PARA compliance
7. IF violations are found, THEN THE audit job SHALL log to Blood Book of Grudges
