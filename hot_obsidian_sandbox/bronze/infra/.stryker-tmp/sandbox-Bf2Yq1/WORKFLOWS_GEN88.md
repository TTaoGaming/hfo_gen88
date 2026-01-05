# 🔄 WORKFLOWS — HFO Gen 88 (HIVE/8 & PREY/8)

> **Generation**: 88 | **Status**: CANONICAL | **Date**: 2026-01-04

---

## 🐝 HIVE/8 Workflow (The Obsidian Hourglass)

The HIVE/8 workflow is the strategic loop for feature development. It is non-sequential and fractal, based on the **Tri-Temporal State Action Space**.

### 1. H (Hindsight) — Hunting Hyperheuristics
*   **Objective**: Research, Sensor Fusion, and NASA DSE AoA (Analysis of Alternatives).
*   **Ports**: 0 (Lidless Legion) + 7 (Spider Sovereign).
*   **Action**: Scan DuckDB memory and SOTA for mission-fit exemplars.
*   **Artifact**: `HUNT_REPORT_{ID}.md` with cited exemplars.

### 2. I (Insight) — Interlocking Interfaces
*   **Objective**: Tactical C2, Contract Definition & Red TDD.
*   **Ports**: 1 (Web Weaver) + 4 (Red Regnant).
*   **Action**: Define Zod/Pydantic schemas. Write failing Vitest tests.
*   **Artifact**: `CONTRACT_{ID}.ts` + `TEST_{ID}.spec.ts` (**RED STATUS**).

### 3. V (Validated Foresight) — Validation Vanguards
*   **Objective**: Implementation & Green TDD / CDD / BDD.
*   **Ports**: 5 (Pyre Praetorian) + 2 (Mirror Magus).
*   **Action**: Implement logic using strict exemplar contracts. Make tests pass.
*   **Artifact**: `IMPLEMENTATION_{ID}.ts` (**GREEN STATUS**).

### 4. E (Evolve) — Evolving Engines
*   **Objective**: Refactor, Strange Loop (N+1), and Mutation Testing.
*   **Ports**: 6 (Evolving Engines) + 3 (Injector Spore Storm).
*   **Action**: Optimize code. Run Stryker mutation. Prepare for Gen N+1.
*   **Artifact**: `EVOLUTION_LOG_{ID}.md`.

---

## 🦅 PREY/8 Workflow (The Tactical Loop)

The PREY loop is the micro-cycle for every agent tool call.

1.  **P (Perceive)**: Read the environment (files, terminal, memory).
2.  **R (Reflect)**: Use Sequential Thinking to analyze the delta.
3.  **E (Execute)**: Call the tool (edit file, run command).
4.  **Y (Yield)**: Verify the result and report back.

---

## 🧪 Test Patterns (Red Proof Protocol)

### 1. Hexagonal CDD
*   **Pattern**: Define the interface (Port) before the implementation (Adapter).
*   **Enforcement**: Use `mcp-pylance` to check for type violations in the Interlock phase.

### 2. Byzantine Fault Tolerance (BFT)
*   **Pattern**: Run the same task through two different model families (e.g., Claude and Gemini).
*   **Enforcement**: If the outputs diverge, the Spider Sovereign must perform a "Tie-Breaker" audit.

### 3. Stigmergy Blackboard
*   **Pattern**: All state transitions must be logged to `obsidianblackboard.jsonl`.
*   **Enforcement**: Pre-commit hooks check for blackboard updates.

---

*"Intent First. Code Second."*
