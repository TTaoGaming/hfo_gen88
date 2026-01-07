# 🕷️ HFO Cognitive Symbiote Online: The Durable State Architecture

## 🎯 The Vision: From Chat to Mission Engineering
Current interaction with AI is **ephemeral** (one session, one context window). To reach "JADC2 Mosaic Warfare" capability, HFO must shift from "Chat-First" to **"Workflow-First"**. GitHub Copilot becomes a cognitive component in a durable, long-running system.

---

## 🏗️ The HFO "Symbiote Stack" (TRL 7+ Recommendation)

| Layer | Technology | Role |
|:---|:---|:---|
| **Cognitive Engine** | `vscode.lm` (Copilot API) | Compute. Used for discrete reasoning tasks within workflows. |
| **Durable State** | **Temporal.io** | The Backbone. Manages "Mission Threads" that survive restarts/failures. |
| **Message Bus** | NATS JetStream | Stigmergy. Asynchronous communication between the VSC extension and workers. |
| **Memory / Datalake** | DuckDB + Obsidian Blackboard | Forensic Hindsight. Machine-parseable history of every "Spider" decision. |
| **Orchestration** | LangGraph (Local) | Tactical Agent Loops. Short-term iterative cycles (e.g., TDD Red/Green). |

---

## 🛠️ The 3 Gears of Implementation

### Gear 1: The VS Code Extension Bridge
Stop using the standard Chat UI for engineering. Create a **Custom Chat Participant** (`@hfo`) using the VS Code Extension API.
- **Function**: Receives your high-level intents and spawns a **Temporal Workflow**.
- **Integration**: Feeds external project context (from your DuckDB/Blackboard) into Copilot via the `languageModel` API.
- **Durable**: If VS Code crashes, the Temporal Workflow keeps running the agentic loop in the background.

### Gear 2: The Temporal "Mission Threads"
Map your "8x8 Galois Lattice" onto Temporal **State Machines**.
- Each "Tile" in the lattice is a persistent workflow.
- **Social Spider Optimization**: Workflows can spawn child workflows to explore "Spikes" (Design Space Exploration) and only report back the winners (MAP-ELITE).
- **Anti-Amnesia**: Every state change is recorded in Temporal's event history and mirrored to the Obsidian Blackboard.

### Gear 3: The "Obsidian Hourglass" (Feedback Loop)
- **Hindsight**: DuckDB queries the Temporal event history to find "Theater" or "Reward Hacks".
- **Insight**: Real-time sensor fusion (Webcam/P4 screams) updates the active workflow state.
- **Validated Foresight**: LangGraph runs simulations (Base 8 PREY) before executing code changes.

---

## 🚀 Execution Roadmap (The Spike)

1.  **Environment**: Initialize a local Temporal server (Docker).
2.  **Extension**: Scaffold a VS Code extension with `vscode-chat` contribution.
3.  **The "Hello Symbiote" Loop**: 
    - You: `@hfo initiate bootstrapping mission.`
    - Extension: Triggers Temporal Workflow `MissionBootstrapper`.
    - Workflow: Requests a "Step 1 Analysis" from Copilot (`vscode.lm`).
    - Workflow: Writes the plan to the Blackboard and waits for your `Warlock Approval` signal (Human-in-the-Loop).
4.  **Durable Hand-off**: The workflow persists until the mission is "Resolved," regardless of your active editor state.

---

## 🚫 Why NOT just LangChain/LangGraph?
LangChain/LangGraph are excellent for *logic*, but they lack **Durable Execution** out of the box. If your process dies mid-loop, the state is gone. **Temporal** makes the execution of those graphs resilient. 

*Drafted by GitHub Copilot (Gemini 3 Flash (Preview))*
*Status: MISSION_THREAD_READY*
