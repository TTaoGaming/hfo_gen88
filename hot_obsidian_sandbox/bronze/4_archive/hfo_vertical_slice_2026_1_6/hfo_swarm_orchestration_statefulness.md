# Vertical Slice: HFO Symbiote Orchestration & Statefulness
**Version**: 2026-01-06 | **Status**: PROVEN_EXEMPLAR | **HIVE Phase**: H (Hunt)

This document addresses the "Ephemeral Chat" failure by bridging the **VS Code Environment** with **Durable Orchestration** via Temporal and LangGraph.

---

## 🏗️ The Durable Symbiote Stack

To build a cognitive partner that "remembers" across session restarts, we compose three high-maturity tiers:

| Tier | Technology | Role |
| :--- | :--- | :--- |
| **Interface** | **VS Code Chat Participant** | UI Front-end. Handles `@spider` commands and streams progress. |
| **Execution** | **Temporal.io (TS SDK)** | Durable Nervous System. Handles timeouts, retries, and persistence. |
| **Reasoning** | **LangGraph (JS)** | The "Command Room". Cyclic graphs for HIVE/8 reasoning. |

---

## 🛠️ Composition of Exemplars: The "Bifrost" Bridge

### 1. VS Code Chat Interface (Port 7)
The chat interface is no longer the "engine"—it is a **Temporal Client**.
```typescript
// vscode.ChatRequestHandler
const handler = async (request, context, stream, token) => {
  stream.progress('Initializing HFO Mission Workflow...');
  
  // Start the mission in Temporal (Durable execution)
  const handle = await client.workflow.start(Hive8Workflow, {
    args: [{ missionId: request.prompt }],
    workflowId: `hfo-mission-${Date.now()}`
  });

  // Wait for Heartbeats/Signals and stream to user
  while (true) {
    const status = await handle.query(getMissionStatus);
    stream.progress(`[${status.port}] ${status.msg}`);
    if (status.complete) break;
  }
};
```

### 2. Durable Reasoning: LangGraph + Temporal
LangGraph nodes act as **HFO Legendary Commanders**. 
- **Persistence**: Using `SqliteSaver` (backed by [duckdb](../../package.json)) allows the graph to "pause" and "resume" when a human needs to intervene or a test fails.
- **Temporal Activity**: Each node in the LangGraph can be wrapped in a Temporal Activity to ensure that if a tool call (like `read_file`) fails, it retries reliably.

### 3. Stigmergy: The Grounding Ledger
All "Thoughts" (Temporal query results) and "Actions" (Tool hits) are logged to [obsidianblackboard.jsonl](../../../obsidianblackboard.jsonl). This prevents the "Amnesia Loop" by giving the AI a physical memory file to consult before responding.

---

## 📋 Vertical Slice Implementation (High Maturity)
1. **Initialize Temporal Worker**: Run a daemon in the background (`npx tsx worker.ts`).
2. **Deploy LangGraph**: Define the "Spider Sovereign" reasoning graph with checkpoints.
3. **The Baton Extension**: Install a minimal VS Code extension that pipes `@spider` commands to the `Temporal Client`.

---
**Commander**: Spider Sovereign (Port 7) | **Ledger**: [obsidianblackboard.jsonl](../../../obsidianblackboard.jsonl)
