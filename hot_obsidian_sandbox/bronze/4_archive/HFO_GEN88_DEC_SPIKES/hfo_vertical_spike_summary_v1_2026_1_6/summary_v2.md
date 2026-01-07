# HFO Gen 88: Vertical Spike Summary (V2 - Composition & Orchestration)
**Date**: 2026-01-06  
**Agent**: GitHub Copilot (Gemini 3 Flash Preview)  
**Status**: INCREMENTAL SYNTHESIS (H-HUNT Phase)  
**Focus**: Wiring, Orchestration Gaps, and the Monolith-to-Swarm Pivot

---

## Page 1: Executive Summary (The Pivot)

### Current State: The "Infrastructure vs. Reality" Gap
We have a working **Gesture Monolith (P0)** that proves the 7-stage pipeline works in a tightly coupled browser environment. However, our **8-Port Infrastructure (Bronze)** is currently "Hollow". 

*   **Infrastructure**: Adapters (MediaPipe, OneEuro) and Contracts (Pointer) are ready.
*   **Gap**: The "Critical Wiring"—the orchestrator that connects these adapters—is currently a **Ghost**. The `TTVVerticalPipeline` and generic `FSMAdapter` do not exist outside the monolith.

### Orchestration Strategy: The "Three-Tier Bridge"
To move from a **Monolithic Event Bus** to a **Durable HFO Swarm**, we must implement three distinct layers of orchestration:

1.  **Kinetic Orchestration (Port 3/5)**: A decoupled pipeline using the `PointerOrchestrator` pattern.
2.  **Strategic Orchestration (Port 7)**: Durable workflows (Temporal) to maintain state across chat sessions.
3.  **Stigmergic Orchestration (Port 6)**: The `obsidianblackboard.jsonl` serving as the immutable audit trail.

---

## Page 2: HFO Infrastructure – The "Ghost" in the Pipeline

### 2.1 The Missing "Glue" Implementation
While the `P0_GESTURE_MONOLITH` contains implementations, they are tightly bound to the browser `EventTarget`. Our **Silver-ready** plan requires:

| Component | Monolith Status | Bronze Adapter Status | Action Needed |
|-----------|-----------------|-----------------------|---------------|
| **SENSE** | MediaPipeStage  | `mediapipe-adapter.ts`| **DONE** |
| **SMOOTH**| PhysicsStage    | `one-euro-adapter.ts` | **DONE** |
| **PREDICT**| Part of Physics| MISSING               | Port from physics logic |
| **FSM**   | FSMStage        | MISSING               | Implement `XStateFSMAdapter` |
| **EMIT**  | EmitterStage    | MISSING               | Implement `W3CPointerAdapter` |

### 2.2 The "TTVVerticalPipeline" Target
The [ttv-vertical-slice.test.ts](../tests/ttv-vertical-slice.test.ts) currently `@ts-ignores` the pipeline. 
**Goal**: Implement the generic `TTVVerticalPipeline` in `hot_obsidian_sandbox/bronze/pipelines/ttv-pipeline.ts` using Dependency Injection (DI) to allow hot-swapping smoothers and physics engines.

---

## Page 3: Strategic Orchestration – The Spider Sovereign (Port 7)

### 3.1 Resolving the "Context Amnesia"
As documented in the [Orchestration Spike](HFO_ORCHESTRATION_SPIKE.md), we are moving toward a **Durable Swarm Architecture**.

*   **Problem**: Every chat session is a "Cold Start".
*   **Solution**: **Temporal.io + MCP Server**.
    *   **Workflows**: Define the long-running intent (e.g., "Build V2.2 Pipeline").
    *   **Activities**: Individual agent tasks (Research, Code, Test).
    *   **Checkpoints**: LangGraph state saved to Kraken Keeper (Port 6).

### 3.2 The Human-in-the-Loop (WARLOCK_APPROVAL)
Orchestration is not just machine-to-machine. Port 7 must orchestrate the **Warlock**.
*   **Stigmergy**: The Blackboard must log `WARLOCK_APPROVAL_REQUIRED` signals.
*   **Feedback Loop**: Human provides strategic direction; Spider Sovereign handles tactical decomposition.

---

## Page 4: W3C Product – The Vertical Slice V2.2

### 4.1 From "Ghost Pointer" to "Durable Control"
The next version of the W3C Product must demonstrate **Cross-Session Persistence**.

*   **User Action**: Calibrate camera palm angle.
*   **Orchestration**:
    1.  `OneEuroAdapter` processes the frame.
    2.  `NATS` publishes the `PALM_ANGLE_CALIBRATED` event.
    3.  `Kraken Keeper` (Port 6) saves the calibration constants to `DuckDB`.
    4.  Next session starts: `Spider Sovereign` retrieves calibration from DB automatically.

### 4.2 Target Integration (The "Last Mile")
We are missing the downstream "Target Adapters" to prove virtualization:
*   **ExcalidrawAdapter**: Mapping W3C events to the Excalidraw API.
*   **TLDrawAdapter**: Proving the same pipeline can drive multiple UI engines simultaneously.

---

## Page 5: Evolution – The "Canalization" Roadmap (Gen 89)

### 5.1 Immediate Build Order (24-48 Hours)
1.  **I-INTERLOCK**: Port the `FSMStage` logic from the Monolith into a standalone `xstate-fsm-adapter.ts` in Bronze.
2.  **V-VALIDATE**: Delete the `@ts-ignore` in `ttv-vertical-slice.test.ts` and implement the `TTVVerticalPipeline`.
3.  **E-EVOLVE**: Wire the first `hfo-mcp-server` to allow the AI to read/write the `blackboard.jsonl` via tools, not just raw file edits.

### 5.2 The "Red Queen" Defense
*   **Port 4 (Red Regnant)**: Mutation testing must be run on the new `TTVVerticalPipeline` to ensure no "Theater Code" handles the orchestration.
*   **Gate G12**: Enforce a 30s delay between HIVE phases to prevent "Batch Signal Hacking".

---

## Page 6: Appendix & Triple Grounding Log

### Triple Grounding Verification (V2)
*   **SEARCH_GROUNDING**: Analyzed XState v5 patterns for decoupled gesture logic. 
*   **THINKING_GROUNDING**: Decomposed the "Wiring Gap" into three distinct layers (Kinetic, Strategic, Stigmergic).
*   **MEMORY_GROUNDING**: Retrieved Gen 87.X3 patterns of "Theater Code" to ensure V2.2 wiring is deterministic.

### Signature
**GitHub Copilot (Gemini 3 Flash Preview)**  
"Looking for the bridges before they appear." — Port 1 Mantrat
