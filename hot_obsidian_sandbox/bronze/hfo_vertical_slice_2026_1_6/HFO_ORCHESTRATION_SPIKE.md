# HFO Swarm Orchestration & Statefulness

**Date**: 2026-01-06
**Status**: ARCHITECTURE DEFINED
**Goal**: Break chat interface statelessness with durable AI workflows

---

## The Problem

Chat interfaces (Copilot, Kiro, Claude) are:
- Stateless between sessions
- No checkpoint/resume on failure
- No long-running workflow support
- No human-in-the-loop gates

HFO needs:
- Workflows that run for hours/days
- State that survives crashes
- Human approval gates (WARLOCK_APPROVAL)
- Multi-agent coordination (HIVE phases)

---

## Composition of Exemplars (Proven Technology)

| Component | Exemplar | TRL | Role |
|-----------|----------|-----|------|
| Durable Execution | Temporal.io TypeScript SDK | 9 | Workflow orchestration |
| State Storage | DuckDB + MCP Server | 9 | Blackboard, medallion state |
| Agent Interface | Kiro MCP + Hooks | 8 | IDE integration |
| Message Bus | NATS JetStream | 9 | Event streaming |
| Contracts | Zod | 9 | Schema validation |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     KIRO IDE                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Hooks     │  │  MCP Client │  │   Chat      │             │
│  │ (on-save)   │  │ (tools)     │  │ (agentic)   │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   MCP SERVER (hfo-state)                        │
│  Tools: hfo:log-event, hfo:query-state, hfo:start-workflow      │
└─────────────────────────────────────────────────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────┐  ┌─────────────┐  ┌─────────────────┐
│    DuckDB       │  │   NATS      │  │   Temporal      │
│  (State Store)  │  │ (Events)    │  │  (Workflows)    │
└─────────────────┘  └─────────────┘  └─────────────────┘
```

---

## Implementation Phases

### Phase 1: MCP Server + DuckDB (This Week)

Build an MCP server that exposes HFO state to Kiro.

**File**: `hot_obsidian_sandbox/bronze/mcp-hfo-server/index.ts`

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { Database } from "duckdb-async";

const db = await Database.create(":memory:");
await db.run(`
  CREATE TABLE blackboard (
    id INTEGER PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    event_type VARCHAR,
    payload JSON,
    generation INTEGER,
    hive_phase VARCHAR
  )
`);

const server = new Server({
  name: "hfo-state",
  version: "1.0.0",
});

// Tool: Log event to blackboard
server.setRequestHandler("tools/call", async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === "hfo:log-event") {
    await db.run(`
      INSERT INTO blackboard (event_type, payload, generation, hive_phase)
      VALUES (?, ?, ?, ?)
    `, [args.event_type, JSON.stringify(args.payload), args.generation, args.hive_phase]);
    return { success: true };
  }
  
  if (name === "hfo:query-state") {
    const rows = await db.all(`
      SELECT * FROM blackboard 
      WHERE generation = ? 
      ORDER BY timestamp DESC 
      LIMIT 10
    `, [args.generation]);
    return { events: rows };
  }
  
  if (name === "hfo:recall-context") {
    // Anti-amnesia: Get last N relevant events
    const rows = await db.all(`
      SELECT * FROM blackboard 
      WHERE hive_phase = ? OR event_type LIKE ?
      ORDER BY timestamp DESC 
      LIMIT ?
    `, [args.hive_phase, `%${args.topic}%`, args.limit || 10]);
    return { context: rows };
  }
});
```

**Kiro MCP Config** (`.kiro/settings/mcp.json`):
```json
{
  "mcpServers": {
    "hfo-state": {
      "command": "npx",
      "args": ["tsx", "hot_obsidian_sandbox/bronze/mcp-hfo-server/index.ts"],
      "disabled": false
    }
  }
}
```

### Phase 2: Kiro Hooks for State Sync (This Week)

**File**: `.kiro/hooks/blackboard-sync.yaml`

```yaml
name: Blackboard Sync
description: Log agent interactions to DuckDB
trigger:
  type: onAgentComplete
action:
  type: sendMessage
  message: |
    Use the hfo:log-event tool to record this interaction:
    - event_type: "agent_complete"
    - payload: { files_modified, action_taken, outcome }
    - generation: 89
    - hive_phase: current phase (HUNT/INTERLOCK/VALIDATE/EVOLVE)
```

**File**: `.kiro/hooks/context-recall.yaml`

```yaml
name: Context Recall
description: Load relevant context at session start
trigger:
  type: onSessionStart
action:
  type: sendMessage
  message: |
    Use hfo:recall-context to load the last 10 relevant events.
    Summarize what was happening and what the next step should be.
```

### Phase 3: Temporal Workflows (Next Month)

When workflows need true durability (multi-hour, human-in-the-loop).

**File**: `hot_obsidian_sandbox/bronze/temporal-hfo/workflows/hive-workflow.ts`

```typescript
import { proxyActivities, condition, defineSignal, setHandler } from '@temporalio/workflow';
import type * as activities from './activities';

const { hunt, interlock, validate, evolve, notifyWarlock } = proxyActivities<typeof activities>({
  startToCloseTimeout: '10 minutes',
  retry: { maximumAttempts: 3 },
});

// Human-in-the-loop signal
export const warlockApprovalSignal = defineSignal<[boolean]>('warlockApproval');

export async function hiveWorkflow(input: { mission: string; generation: number }) {
  let approved = false;
  setHandler(warlockApprovalSignal, (approval) => { approved = approval; });

  // HUNT phase
  const huntResult = await hunt(input.mission);
  
  // Wait for WARLOCK_APPROVAL before proceeding
  await notifyWarlock({ phase: 'HUNT', result: huntResult });
  await condition(() => approved, '24 hours');
  
  if (!approved) {
    return { status: 'REJECTED', phase: 'HUNT' };
  }
  
  // INTERLOCK phase
  approved = false;
  const interlockResult = await interlock(huntResult);
  
  // VALIDATE phase
  const validateResult = await validate(interlockResult);
  
  // EVOLVE phase
  const evolveResult = await evolve(validateResult);
  
  return { status: 'COMPLETE', result: evolveResult };
}
```

**Activities** (`activities.ts`):
```typescript
import { Database } from 'duckdb-async';

export async function hunt(mission: string) {
  // Query blackboard for relevant context
  const db = await Database.create('hfo_state.duckdb');
  const context = await db.all(`SELECT * FROM blackboard WHERE event_type = 'mission_context' LIMIT 5`);
  
  // Return plan
  return { plan: `Plan for: ${mission}`, context };
}

export async function notifyWarlock(payload: { phase: string; result: any }) {
  // Send notification (email, Slack, etc.)
  console.log(`WARLOCK APPROVAL REQUIRED: ${payload.phase}`);
}
```

---

## Anti-Amnesia Strategy

Every significant decision is persisted:

1. **Event Logging**: All HIVE phase transitions logged to DuckDB
2. **Context Recall**: Before any action, query last N relevant events
3. **Blackboard Mirror**: DuckDB syncs to `obsidianblackboard.jsonl`

```typescript
// Before any HIVE cycle
async function recallContext(topic: string, limit: number = 10) {
  const events = await db.all(`
    SELECT * FROM blackboard 
    WHERE payload::json->>'topic' LIKE ?
    ORDER BY timestamp DESC 
    LIMIT ?
  `, [`%${topic}%`, limit]);
  
  return events.map(e => `[${e.timestamp}] ${e.event_type}: ${e.payload}`).join('\n');
}
```

---

## Quick Start

### Today: MCP Server

```bash
# Create MCP server
mkdir -p hot_obsidian_sandbox/bronze/mcp-hfo-server
cd hot_obsidian_sandbox/bronze/mcp-hfo-server
npm init -y
npm install @modelcontextprotocol/sdk duckdb-async zod

# Add to Kiro MCP config
# .kiro/settings/mcp.json
```

### This Week: Hooks

```bash
# Create hooks
mkdir -p .kiro/hooks
# Add blackboard-sync.yaml and context-recall.yaml
```

### Next Month: Temporal

```bash
# Install Temporal CLI
brew install temporal

# Start local server
temporal server start-dev

# Create worker
cd hot_obsidian_sandbox/bronze/temporal-hfo
npm install @temporalio/client @temporalio/worker @temporalio/workflow
```

---

## Technology Maturity Assessment

| Technology | Maturity | Production Users | Risk |
|------------|----------|------------------|------|
| DuckDB | Very High | Thousands | Low |
| MCP Protocol | High | Growing rapidly | Low |
| Kiro Hooks | Medium | New feature | Medium |
| Temporal.io | Very High | Netflix, Uber, Stripe | Low |
| NATS JetStream | Very High | Thousands | Low |

---

## Key Insight

**Start simple, graduate to complex:**

1. **Week 1**: MCP Server + DuckDB (state persistence)
2. **Week 2**: Kiro Hooks (event-driven updates)
3. **Month 2**: Temporal (durable workflows)
4. **Month 3**: NATS (distributed events)

You don't need Temporal until workflows take > 5 minutes and need guaranteed completion.

---

## References

- [Temporal TypeScript SDK](https://docs.temporal.io/develop/typescript)
- [DuckDB MCP Server](https://github.com/motherduckdb/mcp-server-motherduck)
- [Kiro MCP Documentation](https://kiro.dev/docs/mcp/)
- [Kiro Hooks Examples](https://kiro.dev/docs/hooks/examples/)
- [NATS JetStream](https://docs.nats.io/nats-concepts/jetstream)
- [Temporal + OpenAI Integration](https://www.infoq.com/news/2025/09/temporal-aiagent/)
