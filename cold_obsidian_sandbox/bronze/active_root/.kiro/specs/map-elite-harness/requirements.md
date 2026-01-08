# Requirements Document

## Introduction

MAP-ELITE (Model Assessment Protocol - Evolutionary LLM Intelligence Testing Environment) is an 8-harness evaluation system for scoring local LLM models for mission fitness. The system provides tamper-proof logging with cryptographic hashing, orchestration pattern testing (powers of 8), and Quality-Diversity behavioral mapping. Results fuel HFO growth through systematic model assessment.

## Phases

- **Phase 1 (MVP)**: Core evaluation loop - individual model ranking + swarm orchestration patterns
- **Phase 2 (Refinement)**: Extensibility, QD analysis, robustness testing

## Glossary

- **Harness**: A standardized test suite that evaluates a specific capability dimension of an LLM
- **MAP_ELITE_System**: The central orchestration system that runs all 8 harnesses
- **Eval_Ledger**: The append-only, hash-chained JSONL log file storing all test results
- **Fitness_Score**: A composite score derived from all 8 harness results for a model
- **Hash_Chain**: SHA-256 hash linking each log entry to the previous, preventing tampering
- **Model_Profile**: The aggregated performance data for a specific model across all harnesses
- **Orchestration_Pattern**: A geometric sequence of model invocations (e.g., 1-1, 8-1, 1-8-1, 8-1-8-1)
- **Pattern_Code**: Binary encoding of orchestration patterns using powers of 8 (e.g., :00 = 1-1, :10 = 8-1, :1010 = 8-1-8-1)
- **Behavioral_Descriptor**: A measurable characteristic of model output (e.g., verbosity, formality, reasoning_depth)
- **Behavior_Archive**: A grid mapping behavioral descriptor coordinates to the best-performing model in each niche
- **HarnessRunner**: Interface that external workflow engines implement to execute harnesses

---

## Phase 1: Core MVP

### Requirement 1: Central Eval Ledger

**User Story:** As a researcher, I want all test results logged to a single tamper-proof ledger, so that I can track model performance over time without risk of data manipulation.

#### Acceptance Criteria

1. THE Eval_Ledger SHALL store all results in a single `ollama_eval_ledger.jsonl` file
2. WHEN a result is logged, THE Eval_Ledger SHALL compute a SHA-256 hash of the entry combined with the previous entry's hash
3. WHEN a result is logged, THE Eval_Ledger SHALL include timestamp, model, harness, scores, and hash chain
4. THE Eval_Ledger SHALL be append-only with no modification of existing entries
5. WHEN the ledger is read, THE MAP_ELITE_System SHALL verify the hash chain integrity

### Requirement 2: 8-Harness Architecture

**User Story:** As a researcher, I want 8 different evaluation harnesses covering simple to complex tasks, so that I can assess models across multiple capability dimensions.

#### Acceptance Criteria

1. THE MAP_ELITE_System SHALL implement exactly 8 harnesses numbered 0-7 (matching OBSIDIAN ports)
2. WHEN running evaluations, THE MAP_ELITE_System SHALL execute harnesses sequentially in port order
3. THE MAP_ELITE_System SHALL include harnesses for: basic QA, multi-source reasoning, code generation, instruction following, adversarial robustness, safety/refusal, context retention, and reasoning/planning
4. WHEN a harness completes, THE MAP_ELITE_System SHALL log results before proceeding to the next harness

### Requirement 3: Harness Port Mapping

**User Story:** As an HFO developer, I want harnesses mapped to OBSIDIAN ports, so that evaluation aligns with the 8-port architecture.

#### Acceptance Criteria

1. Harness 0 (SENSE) SHALL test basic factual QA and observation
2. Harness 1 (FUSE) SHALL test multi-source integration and reasoning
3. Harness 2 (SHAPE) SHALL test code generation and transformation
4. Harness 3 (DELIVER) SHALL test instruction following and output formatting
5. Harness 4 (DISRUPT) SHALL test edge cases, adversarial inputs, and robustness
6. Harness 5 (IMMUNIZE) SHALL test safety, refusal, and boundary detection
7. Harness 6 (STORE) SHALL test context retention and multi-turn coherence
8. Harness 7 (DECIDE) SHALL test reasoning, planning, decision-making, HFO domain knowledge (OBSIDIAN ports, stigmergy, medallion architecture), and HIVE workflow compliance (H→I→V→E ordering)

### Requirement 4: Fitness Score Computation

**User Story:** As a researcher, I want a composite fitness score for each model, so that I can rank models for mission suitability.

#### Acceptance Criteria

1. WHEN all 8 harnesses complete, THE MAP_ELITE_System SHALL compute a weighted fitness score
2. THE Fitness_Score SHALL range from 0.0 to 1.0
3. THE MAP_ELITE_System SHALL allow configurable weights per harness for mission-specific scoring
4. WHEN computing fitness, THE MAP_ELITE_System SHALL normalize individual harness scores to 0-1 range

### Requirement 5: Orchestration Pattern Testing

**User Story:** As a researcher, I want to test models in various orchestration patterns (powers of 8), so that I can evaluate swarm and chain configurations.

#### Acceptance Criteria

1. THE MAP_ELITE_System SHALL support pattern codes using binary notation for powers of 8
2. WHEN pattern code :00 is specified, THE MAP_ELITE_System SHALL run a 1-1 single model chain
3. WHEN pattern code :10 is specified, THE MAP_ELITE_System SHALL run an 8-1 scatter-gather pattern
4. WHEN pattern code :01 is specified, THE MAP_ELITE_System SHALL run a 1-8 broadcast pattern
5. WHEN pattern code :1010 is specified, THE MAP_ELITE_System SHALL run an 8-1-8-1 double diamond pattern
6. THE MAP_ELITE_System SHALL support arbitrary pattern codes for geometric sequences (1, 8, 64, 512...)
7. WHEN running patterns, THE MAP_ELITE_System SHALL log each stage's results independently

### Requirement 6: Ledger Integrity Verification

**User Story:** As a researcher, I want to verify ledger integrity, so that I can trust the historical data has not been tampered with.

#### Acceptance Criteria

1. THE MAP_ELITE_System SHALL provide a verify command that checks the entire hash chain
2. WHEN verification fails, THE MAP_ELITE_System SHALL report the first corrupted entry index
3. WHEN verification succeeds, THE MAP_ELITE_System SHALL report total entries and chain integrity status

### Requirement 7: Unified Result Schema

**User Story:** As a developer, I want a single source of truth for result structure, so that all outputs are consistent and validated.

#### Acceptance Criteria

1. THE MAP_ELITE_System SHALL define a `HarnessResult` Zod schema as the canonical result format
2. ALL ledger entries, profiles, and exports SHALL derive from the `HarnessResult` schema
3. WHEN a result fails schema validation, THE MAP_ELITE_System SHALL reject it before logging
4. THE MAP_ELITE_System SHALL export the schema for external tool integration
5. THE HarnessResult schema SHALL include: harness_id, model, scores, timestamp, hash, and optional behavioral_descriptors

---

## Phase 2: Refinement [DEFERRED]

### Requirement 8: HarnessRunner Interface [DEFERRED]

**User Story:** As an HFO developer, I want a simple interface for external workflow engines, so that Temporal, LangGraph, CrewAI, and NATS can integrate without coupling to the core system.

#### Acceptance Criteria

1. THE MAP_ELITE_System SHALL expose a HarnessRunner interface with a single `run(harness, model)` method
2. THE HarnessRunner interface SHALL return a standardized HarnessResult containing scores, behavioral descriptors, and metadata
3. WHEN external engines implement HarnessRunner, THE MAP_ELITE_System SHALL accept their results without modification
4. THE MAP_ELITE_System SHALL provide a default LocalHarnessRunner for direct Ollama execution

### Requirement 9: Model Profile Aggregation [DEFERRED]

**User Story:** As a researcher, I want to view aggregated performance profiles for each model, so that I can compare models across evaluation runs.

#### Acceptance Criteria

1. THE MAP_ELITE_System SHALL generate a Model_Profile from ledger entries
2. WHEN generating a profile, THE MAP_ELITE_System SHALL include latest scores, historical trends, and fitness ranking
3. THE MAP_ELITE_System SHALL output profiles as both JSON and Markdown table formats

### Requirement 10: Behavioral Descriptor Mapping [DEFERRED]

**User Story:** As a researcher, I want each harness to emit behavioral descriptors, so that I can visualize model diversity in a behavior space and identify niche-dominant models.

#### Acceptance Criteria

1. WHEN a harness completes, THE MAP_ELITE_System SHALL emit 2-3 behavioral descriptors (e.g., verbosity, formality, reasoning_depth)
2. THE MAP_ELITE_System SHALL maintain a Behavior_Archive mapping (descriptor_1, descriptor_2) coordinates to the best-performing model in each niche
3. WHEN a new model is evaluated, THE MAP_ELITE_System SHALL update the Behavior_Archive if the model dominates an existing niche (higher fitness at same coordinates)
4. THE MAP_ELITE_System SHALL support configurable descriptor extraction per harness

### Requirement 11: Prompt Sensitivity Analysis [DEFERRED]

**User Story:** As a researcher, I want to test models with paraphrased prompts, so that I can measure robustness to prompt variation.

#### Acceptance Criteria

1. THE MAP_ELITE_System SHALL generate 3-5 paraphrased versions of each test prompt
2. WHEN running sensitivity tests, THE MAP_ELITE_System SHALL compute variance across paraphrased responses
3. THE MAP_ELITE_System SHALL flag models with high variance as "prompt-sensitive"
4. WHEN computing fitness, THE MAP_ELITE_System SHALL penalize high prompt sensitivity with a stability_coefficient

### Requirement 12: Harness Plugin Architecture [DEFERRED]

**User Story:** As an HFO developer, I want to add new harnesses without modifying core code, so that the system remains extensible.

#### Acceptance Criteria

1. THE MAP_ELITE_System SHALL define a single `Harness` interface with `id`, `name`, `run()`, and `extractDescriptors()` methods
2. THE MAP_ELITE_System SHALL discover harnesses from a `harnesses/` directory at startup
3. WHEN a new harness file is added, THE MAP_ELITE_System SHALL automatically include it in evaluations
4. THE MAP_ELITE_System SHALL validate harness IDs are unique and within 0-7 range
5. THE Harness interface SHALL be the only contract between core orchestration and harness implementations

### Requirement 13: Lazy Behavioral Descriptors [DEFERRED]

**User Story:** As a researcher, I want behavioral descriptor extraction to be optional, so that default runs are fast and QD analysis is explicit.

#### Acceptance Criteria

1. WHEN the `--descriptors` flag is set, THE MAP_ELITE_System SHALL extract behavioral descriptors
2. WHEN descriptors are disabled (default), THE MAP_ELITE_System SHALL skip descriptor computation entirely
3. THE MAP_ELITE_System SHALL cache descriptor extraction functions per harness
4. THE Behavior_Archive SHALL only be updated when descriptors are enabled
5. WHEN descriptors are disabled, THE MAP_ELITE_System SHALL still log fitness scores normally
