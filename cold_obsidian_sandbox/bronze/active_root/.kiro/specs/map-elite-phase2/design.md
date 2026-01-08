# Design Document: MAP-ELITE Phase 2 - Durable Workflow Orchestration

## Overview

Phase 2 adds durable workflow orchestration to MAP-ELITE, enabling AI swarm testing through external workflow engines. The design prioritizes cost-effective bulk testing using tiered model selection and powers-of-8 concurrency patterns.

**Core Flow**:
1. Select model tier (TIER1/2/3/BEST8) based on budget
2. Choose swarm pattern (:10, :01, :1010)
3. Execute via HarnessRunner (Local, Temporal, or NATS)
4. Aggregate results to Model Profiles
5. Log all results to hash-chained ledger

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MAP_ELITE Phase 2 System                         │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────────┐  ┌─────────────────────────┐ │
│  │   CLI       │  │ SwarmExecutor   │  │   Model Profiler        │ │
│  │  (entry)    │→ │  (patterns)     │→ │  (aggregation)          │ │
│  └─────────────┘  └─────────────────┘  └─────────────────────────┘ │
│         │                │                         │               │
│         ↓                ↓                         ↓               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    HarnessRunner Interface                   │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │   │
│  │  │ LocalRunner  │ │TemporalRunner│ │   NATSRunner         │ │   │
│  │  │ (OpenRouter) │ │ (Workflows)  │ │   (JetStream)        │ │   │
│  │  └──────────────┘ └──────────────┘ └──────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                          │                                          │
│         ┌────────────────┼────────────────┐                        │
│         ↓                ↓                ↓                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │  Semaphore  │  │ Eval_Ledger │  │ Model Tiers │                │
│  │ (rate limit)│  │ (hash-chain)│  │ (cost mgmt) │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. HarnessRunner Interface

```typescript
interface HarnessRunnerOptions {
  timeout_ms?: number;      // Default: 300000 (5 min)
  retries?: number;         // Default: 3
  retry_delay_ms?: number;  // Default: 1000 (exponential backoff)
}

interface HarnessRunner {
  run(
    harness_id: number,
    model: string,
    options?: HarnessRunnerOptions
  ): Promise<HarnessResult>;
  
  runBatch(
    harness_id: number,
    models: string[],
    options?: HarnessRunnerOptions
  ): Promise<HarnessResult[]>;
}
```

### 2. SwarmExecutor

```typescript
interface SwarmConfig {
  pattern: string;           // :10, :01, :1010
  tier: 'tier1' | 'tier2' | 'tier3' | 'best8';
  concurrency?: number;      // Default: 8, max: 64
  runner?: 'local' | 'temporal' | 'nats';
}

interface SwarmResult {
  pattern: string;
  stages: StageResult[];
  total_duration_ms: number;
  total_cost_estimate: number;
  fitness_scores: Record<string, number>;
}

interface StageResult {
  stage_index: number;
  topology: number;          // 1, 8, 64
  results: HarnessResult[];
  duration_ms: number;
}

class SwarmExecutor {
  constructor(runner: HarnessRunner, semaphore: Semaphore);
  
  execute(config: SwarmConfig): Promise<SwarmResult>;
  estimateCost(config: SwarmConfig): CostEstimate;
}
```

### 3. Model Tier Selection

```typescript
// From model-client.ts (already implemented)
const MODEL_TIERS = {
  tier1: MAP_ELITE_TIER1,    // $0.01-0.05/M - 9 models
  tier2: MAP_ELITE_TIER2,    // $0.06-0.15/M - 7 models
  tier3: MAP_ELITE_TIER3,    // $0.20-0.50/M - 5 models
  best8: MAP_ELITE_BEST_8,   // Curated - 8 models
};

interface CostEstimate {
  tier: string;
  model_count: number;
  pattern: string;
  total_calls: number;
  avg_price_per_m: number;
  estimated_tokens: number;
  estimated_cost: number;
  warning?: string;          // If cost > $0.50
}
```

### 4. Semaphore (Rate Limiting)

```typescript
// Already implemented in silver/concurrency/semaphore.ts
interface SemaphoreConfig {
  max_concurrent: number;    // Default: 8
  per_provider?: Record<ModelProvider, number>;
}

class Semaphore {
  constructor(config: SemaphoreConfig);
  
  acquire(): Promise<void>;
  release(): void;
  
  get queue_depth(): number;
  get active_count(): number;
}
```

### 5. Model Profile

```typescript
interface ModelProfile {
  model: string;
  provider: ModelProvider;
  
  // Scores
  latest_fitness: number;
  avg_fitness: number;
  harness_scores: Record<number, number>;  // harness_id → avg score
  
  // Cost metrics
  price_per_m: number;
  score_per_price: number;
  
  // History
  evaluation_count: number;
  first_evaluated: string;
  last_evaluated: string;
  trend: 'improving' | 'stable' | 'declining';
}

class ModelProfiler {
  constructor(ledger: EvalLedger);
  
  getProfile(model: string): Promise<ModelProfile>;
  getAllProfiles(): Promise<ModelProfile[]>;
  exportMarkdown(): Promise<string>;
  exportJSON(): Promise<string>;
}
```

### 6. Temporal Integration

```typescript
// Temporal workflow definition
interface HarnessWorkflowInput {
  harness_id: number;
  model: string;
  options: HarnessRunnerOptions;
}

// Activity definition
async function runHarnessActivity(input: HarnessWorkflowInput): Promise<HarnessResult>;

class TemporalHarnessRunner implements HarnessRunner {
  constructor(client: TemporalClient, taskQueue: string);
  
  async run(harness_id: number, model: string, options?: HarnessRunnerOptions): Promise<HarnessResult> {
    const handle = await this.client.workflow.start(harnessWorkflow, {
      taskQueue: this.taskQueue,
      workflowId: `harness-${harness_id}-${model}-${Date.now()}`,
      args: [{ harness_id, model, options }],
    });
    return handle.result();
  }
}
```

### 7. NATS Integration

```typescript
interface NATSHarnessRequest {
  harness_id: number;
  model: string;
  request_id: string;
  options: HarnessRunnerOptions;
}

class NATSHarnessRunner implements HarnessRunner {
  constructor(nc: NatsConnection, js: JetStreamClient);
  
  async run(harness_id: number, model: string, options?: HarnessRunnerOptions): Promise<HarnessResult> {
    const request_id = crypto.randomUUID();
    const subject = `hfo.harness.${harness_id}`;
    const reply_subject = `hfo.harness.${harness_id}.result.${request_id}`;
    
    // Publish request
    await this.js.publish(subject, JSON.stringify({ harness_id, model, request_id, options }));
    
    // Wait for result
    const sub = this.nc.subscribe(reply_subject, { max: 1 });
    for await (const msg of sub) {
      return JSON.parse(msg.data.toString());
    }
  }
}
```

## Swarm Pattern Execution

### Pattern :10 (8-1 Scatter-Gather)

```
Stage 0: [M1, M2, M3, M4, M5, M6, M7, M8] → 8 parallel
Stage 1: [Aggregator] → 1 sequential
```

### Pattern :01 (1-8 Broadcast)

```
Stage 0: [Source] → 1 sequential
Stage 1: [C1, C2, C3, C4, C5, C6, C7, C8] → 8 parallel
```

### Pattern :1010 (8-1-8-1 Double Diamond)

```
Stage 0: [M1...M8] → 8 parallel
Stage 1: [Agg1] → 1 sequential
Stage 2: [C1...C8] → 8 parallel
Stage 3: [Agg2] → 1 sequential
```

## Cost Estimation

```typescript
// Cost per 512 runs (powers of 8)
const COST_ESTIMATES = {
  tier1: { avg_price: 0.03, tokens_per_run: 1000, cost_512: 0.015 },
  tier2: { avg_price: 0.10, tokens_per_run: 1000, cost_512: 0.050 },
  tier3: { avg_price: 0.30, tokens_per_run: 1000, cost_512: 0.150 },
  best8: { avg_price: 0.10, tokens_per_run: 1000, cost_512: 0.050 },
};
```

## Error Handling

| Error | Handling |
|-------|----------|
| API rate limit | Semaphore queues, exponential backoff |
| Workflow timeout | Temporal auto-retry (max 3) |
| NATS delivery failure | JetStream at-least-once retry |
| Cost threshold exceeded | Warn user, require confirmation |
| Model unavailable | Skip model, log to ledger, continue batch |

## Testing Strategy

### Unit Tests
- HarnessRunner interface compliance
- SwarmExecutor pattern parsing
- Cost estimation accuracy
- Model tier selection

### Integration Tests
- LocalHarnessRunner with mock API
- SwarmExecutor with all patterns
- Model Profiler aggregation

### Property-Based Tests
- Semaphore never exceeds max concurrency
- Cost estimates within 20% of actual
- Pattern execution order preserved

## File Structure

```
hot_obsidian_sandbox/bronze/map-elite/
├── runner/
│   ├── harness-runner.interface.ts   # HarnessRunner interface
│   ├── local-runner.ts               # LocalHarnessRunner
│   ├── temporal-runner.ts            # TemporalHarnessRunner
│   └── nats-runner.ts                # NATSHarnessRunner
├── swarm/
│   ├── swarm-executor.ts             # SwarmExecutor
│   ├── pattern-parser.ts             # Pattern code parsing
│   └── cost-estimator.ts             # Cost estimation
├── profiler/
│   ├── model-profiler.ts             # ModelProfiler
│   └── profile-exporter.ts           # JSON/Markdown export
└── cli/
    └── index.ts                      # Extended CLI commands
```

