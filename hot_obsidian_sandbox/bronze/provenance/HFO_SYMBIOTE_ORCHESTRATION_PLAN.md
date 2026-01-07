# 1-Pager: HFO Cognitive AI Swarm Symbiote Online
**Objective**: Transition from "Ephemeral Chat Theater" to "Durable Orchestrator" via the VS Code symbiotic interface.

---

## 🏗️ The Symbiote Trinity (Port 7: DECIDE)

To achieve a persistent, engineering-grade AI partner, the system must bridge the local developer environment with a durable orchestration backend.

| Layer | Component | Role | HIVE Phase |
| :--- | :--- | :--- | :--- |
| **Interface** | **VS Code Chat Participant** | Capture intent (Baton), stream state, and visualize the "Blood Book." | **H** (Hunt) |
| **Orchestrator**| **Temporal.io** | Ensure durable execution. If VS Code crashes, the mission continues. | **I/V/E** |
| **Reasoning** | **LangGraph** | Cyclic reasoning loops per Port (Sense → Shape → Disrupt). | **V** (Validate) |

---

## 🛠️ Integration Architecture: The "Bifrost" Bridge

### Option A: The "Direct Baton" (Thin Slice)
The VS Code Extension acts as the **Temporal Client**.
1. **Chat Input**: User asks "@spider to implement Port 1 tests."
2. **Workflow Start**: Extension triggers a `HFO_Mission_Workflow` in Temporal.
3. **Blackboard Sync**: The Temporal Worker updates `obsidianblackboard.jsonl` (via a local agent/MCP server).
4. **Streaming Feedback**: The Extension polls the Workflow state and streams "LIVE" progress (Port-by-Port) back to the Chat UI.

### Option B: The "MCP Swarm" (Decentralized)
The Symbiote operates via **Model Context Protocol (MCP)**.
- **VS Code** remains the primary host.
- A **Temporal Worker** runs as a persistent background daemon (Port 3).
- **LangGraph** agents act as "Commanders" (Lidless Legion, Mirror Magus) that communicate via NATS/CloudEvents.

---

## 📋 The Vertical Slice: "Mission Genesis"

### 1. The Interface (VS Code Participant)
- **ID**: `hfo.symbiote`
- **Command**: `/mission [target]`
- **Tech**: `vscode.chat.createChatParticipant`. It doesn't just "talk"; it produces a **Durable Mission ID**.

### 2. The Durability (Temporal)
- **Workflow**: `Hive8Workflow(mission_id)`
- **Activities**: 
  - `interlock_phase()`: Run TDD Red tests.
  - `validate_phase()`: Attempt implementation.
  - `evolve_phase()`: Update the Ledger.
- **Why?**: Prevents context amnesia during long-duration coding tasks.

### 3. The Feedback Loop (LangGraph Checkpointers)
- Use **LangGraph Persistence** to allow the AI to "resume" a thought process after evaluating test failures.
- Map graph nodes to **8-Port Commanders**.

---

## 🚀 Get Started: What's Missing?

To bring the Symbiote online, the following infrastructure must be initialized in `hot_obsidian_sandbox/bronze/`:

1.  **Dependencies**: Install `@temporalio/client`, `@temporalio/worker`, and `@langchain/langgraph`.
2.  **The Worker**: A daemon in `bronze/scripts/symbiote_worker.ts` to host the commanders.
3.  **The Participant**: A `.vsix` spike that bridges the Copilot Chat to the local Temporal instance.

> **Crucial Insight**: GitHub Copilot is the *eyes* (Port 0), Temporal is the *nervous system* (Port 1), and LangGraph is the *brain* (Port 7).

---
**Status**: DRAFT | **HIVE Phase**: H (Hunt) | **Commander**: Spider Sovereign (Port 7)
