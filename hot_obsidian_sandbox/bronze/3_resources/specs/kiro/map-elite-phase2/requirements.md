# Requirements Document: MAP-ELITE Phase 2 - Durable Workflow Orchestration

## Introduction

Phase 2 extends MAP-ELITE with durable workflow orchestration for AI swarm testing. The system enables running evaluation harnesses through external workflow engines (Temporal, NATS, LangGraph) using powers-of-8 concurrency patterns. Focus is on cost-effective bulk testing using ultra-cheap and budget model tiers.

## Glossary

- **HarnessRunner**: Interface that external workflow engines implement to execute harnesses
- **Swarm Pattern**: Geometric sequence of model invocations (8-1, 1-8, 8-1-8-1)
- **Model Tier**: Cost-based grouping (TIER1: $0.01-0.05/M, TIER2: $0.06-0.15/M, TIER3: $0.20-0.50/M)
- **Scatter-Gather**: Pattern where 8 models run in parallel, results aggregated by 1
- **Broadcast**: Pattern where 1 model fans out to 8 parallel consumers
- **Double Diamond**: 8-1-8-1 pattern combining scatter-gather and broadcast

---

## Phase 2 Requirements

### Requirement 1: HarnessRunner Interface

**User Story:** As an HFO developer, I want a simple interface for external workflow engines, so that Temporal, NATS, and LangGraph can integrate without coupling to the core system.

#### Acceptance Criteria

1. THE MAP_ELITE_System SHALL expose a HarnessRunner interface with `run(harness_id, model, options)` method
2. THE HarnessRunner interface SHALL return a standardized HarnessResult containing scores, metadata, and timing
3. WHEN external engines implement HarnessRunner, THE MAP_ELITE_System SHALL accept their results without modification
4. THE MAP_ELITE_System SHALL provide a LocalHarnessRunner for direct OpenRouter/Ollama execution
5. THE HarnessRunner interface SHALL support timeout and retry configuration

### Requirement 2: Swarm Pattern Executor

**User Story:** As a researcher, I want to execute swarm patterns with configurable concurrency, so that I can test model coordination at scale.

#### Acceptance Criteria

1. THE MAP_ELITE_System SHALL implement a SwarmExecutor that runs patterns using HarnessRunner
2. WHEN pattern :10 (8-1) is executed, THE SwarmExecutor SHALL run 8 models in parallel, then aggregate
3. WHEN pattern :01 (1-8) is executed, THE SwarmExecutor SHALL broadcast to 8 parallel consumers
4. WHEN pattern :1010 (8-1-8-1) is executed, THE SwarmExecutor SHALL chain scatter-gather and broadcast
5. THE SwarmExecutor SHALL respect concurrency limits (default: 8, max: 64)
6. THE SwarmExecutor SHALL log each stage's results independently to the ledger

### Requirement 3: Model Tier Selection

**User Story:** As a researcher, I want to select models by cost tier, so that I can run bulk tests without exceeding budget.

#### Acceptance Criteria

1. THE MAP_ELITE_System SHALL support tier selection: `tier1`, `tier2`, `tier3`, `best8`
2. WHEN tier1 is selected, THE MAP_ELITE_System SHALL use models under $0.05/M input
3. WHEN tier2 is selected, THE MAP_ELITE_System SHALL use models between $0.06-0.15/M input
4. WHEN tier3 is selected, THE MAP_ELITE_System SHALL use models between $0.20-0.50/M input
5. WHEN best8 is selected, THE MAP_ELITE_System SHALL use the curated MAP_ELITE_BEST_8 list
6. THE MAP_ELITE_System SHALL estimate cost before execution and warn if >$0.50

### Requirement 4: Temporal Workflow Integration

**User Story:** As an HFO developer, I want to run harnesses as Temporal workflows, so that I get durable execution with automatic retries.

#### Acceptance Criteria

1. THE MAP_ELITE_System SHALL provide a TemporalHarnessRunner implementing HarnessRunner
2. THE TemporalHarnessRunner SHALL execute each harness as a Temporal activity
3. WHEN a harness fails, THE TemporalHarnessRunner SHALL retry with exponential backoff (max 3 retries)
4. THE TemporalHarnessRunner SHALL support workflow timeouts (default: 5 minutes per harness)
5. THE TemporalHarnessRunner SHALL log workflow execution IDs to the ledger metadata

### Requirement 5: NATS JetStream Integration

**User Story:** As an HFO developer, I want to run harnesses via NATS JetStream, so that I can leverage existing HFO infrastructure.

#### Acceptance Criteria

1. THE MAP_ELITE_System SHALL provide a NATSHarnessRunner implementing HarnessRunner
2. THE NATSHarnessRunner SHALL publish harness requests to `hfo.harness.{harness_id}` subjects
3. THE NATSHarnessRunner SHALL consume results from `hfo.harness.{harness_id}.result` subjects
4. WHEN using JetStream, THE NATSHarnessRunner SHALL ensure at-least-once delivery
5. THE NATSHarnessRunner SHALL support consumer groups for parallel execution

### Requirement 6: Model Profile Aggregation

**User Story:** As a researcher, I want to view aggregated performance profiles for each model, so that I can compare models across evaluation runs.

#### Acceptance Criteria

1. THE MAP_ELITE_System SHALL generate a Model_Profile from ledger entries
2. WHEN generating a profile, THE MAP_ELITE_System SHALL include latest scores, historical trends, and fitness ranking
3. THE MAP_ELITE_System SHALL output profiles as both JSON and Markdown table formats
4. THE Model_Profile SHALL include per-harness breakdown and overall fitness
5. THE Model_Profile SHALL include cost metrics (price/M, score/price ratio)

### Requirement 7: Batch Evaluation CLI

**User Story:** As a researcher, I want CLI commands for batch evaluation, so that I can run swarm tests efficiently.

#### Acceptance Criteria

1. THE CLI SHALL support `swarm <pattern> --tier <tier>` command
2. THE CLI SHALL support `batch <tier> --harness <id>` for single-harness bulk testing
3. THE CLI SHALL support `profile <model>` to show aggregated model profile
4. THE CLI SHALL support `cost-estimate <pattern> --tier <tier>` to preview costs
5. THE CLI SHALL support `--runner <local|temporal|nats>` to select execution backend

### Requirement 8: Semaphore-Based Rate Limiting

**User Story:** As a researcher, I want rate limiting for API calls, so that I don't exceed provider limits.

#### Acceptance Criteria

1. THE MAP_ELITE_System SHALL implement a Semaphore for concurrent request limiting
2. THE Semaphore SHALL support configurable max concurrency (default: 8)
3. WHEN max concurrency is reached, THE Semaphore SHALL queue additional requests
4. THE Semaphore SHALL support per-provider limits (e.g., OpenRouter: 8, Ollama: 4)
5. THE Semaphore SHALL log queue depth and wait times to metadata

