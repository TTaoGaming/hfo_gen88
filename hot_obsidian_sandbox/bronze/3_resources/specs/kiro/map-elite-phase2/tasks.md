# Implementation Plan: MAP-ELITE Phase 2 - Durable Workflow Orchestration

## Overview

Phase 2 implements durable workflow orchestration for AI swarm testing. All code goes in `hot_obsidian_sandbox/bronze/map-elite/`. Focus on cost-effective bulk testing using ultra-cheap and budget model tiers.

## Tasks

- [ ] 1. Define HarnessRunner Interface
  - Create `runner/harness-runner.interface.ts`
  - Define `HarnessRunner` interface with `run()` and `runBatch()` methods
  - Define `HarnessRunnerOptions` for timeout/retry config
  - Export types for external implementations
  - _Requirements: 1.1, 1.2, 1.5_

- [ ] 2. Implement LocalHarnessRunner
  - Create `runner/local-runner.ts`
  - Implement HarnessRunner using existing OpenRouter/Ollama clients
  - Add timeout handling with AbortController
  - Add retry logic with exponential backoff
  - _Requirements: 1.3, 1.4_

- [ ] 3. Checkpoint - LocalRunner tests pass
  - Write unit tests for LocalHarnessRunner
  - Test timeout and retry behavior
  - Ensure all tests pass before proceeding

- [ ] 4. Implement SwarmExecutor
  - [ ] 4.1 Create `swarm/pattern-parser.ts`
    - Parse pattern codes (:10, :01, :1010)
    - Convert to topology arrays
    - _Requirements: 2.2, 2.3, 2.4_

  - [ ] 4.2 Create `swarm/swarm-executor.ts`
    - Implement SwarmExecutor class
    - Execute patterns using HarnessRunner
    - Respect concurrency limits via Semaphore
    - Log each stage to ledger
    - _Requirements: 2.1, 2.5, 2.6_

- [ ] 5. Implement Cost Estimator
  - Create `swarm/cost-estimator.ts`
  - Calculate cost based on tier and pattern
  - Warn if estimated cost > $0.50
  - _Requirements: 3.6_

- [ ] 6. Checkpoint - SwarmExecutor tests pass
  - Write unit tests for pattern parsing
  - Write integration tests for swarm execution
  - Ensure all tests pass before proceeding

- [ ] 7. Implement Model Profiler
  - [ ] 7.1 Create `profiler/model-profiler.ts`
    - Aggregate ledger entries by model
    - Compute latest/avg fitness, per-harness scores
    - Calculate score/price ratio
    - _Requirements: 6.1, 6.2, 6.4, 6.5_

  - [ ] 7.2 Create `profiler/profile-exporter.ts`
    - Export profiles as JSON
    - Export profiles as Markdown table
    - _Requirements: 6.3_

- [ ] 8. Extend CLI Commands
  - Add `swarm <pattern> --tier <tier>` command
  - Add `batch <tier> --harness <id>` command
  - Add `profile <model>` command
  - Add `cost-estimate <pattern> --tier <tier>` command
  - Add `--runner <local|temporal|nats>` flag
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 9. Checkpoint - CLI tests pass
  - Test all new CLI commands
  - Ensure help text is accurate
  - Ensure all tests pass before proceeding

- [ ] 10. Implement TemporalHarnessRunner (Optional)
  - Create `runner/temporal-runner.ts`
  - Define Temporal workflow and activities
  - Implement HarnessRunner interface
  - Add workflow timeout and retry config
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 11. Implement NATSHarnessRunner (Optional)
  - Create `runner/nats-runner.ts`
  - Implement JetStream publish/subscribe
  - Implement HarnessRunner interface
  - Add consumer group support
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 12. Enhance Semaphore (if needed)
  - Add per-provider limits
  - Add queue depth logging
  - _Requirements: 8.4, 8.5_

- [ ] 13. Final Checkpoint - All Phase 2 tests pass
  - Run full test suite
  - Verify cost estimates are accurate
  - Ensure all requirements are met

## Notes

- Tasks 10-11 (Temporal/NATS) are optional - LocalRunner is sufficient for MVP
- All code in `hot_obsidian_sandbox/bronze/map-elite/`
- Use existing Semaphore from `silver/concurrency/semaphore.ts`
- Focus on TIER1 and TIER2 models for bulk testing (cost-effective)
- Powers of 8 for concurrency: 8, 64, 512

## Cost Budget

- TIER1 (512 runs): ~$0.015
- TIER2 (512 runs): ~$0.050
- BEST_8 (512 runs): ~$0.050
- Stay under $0.50 per batch session

