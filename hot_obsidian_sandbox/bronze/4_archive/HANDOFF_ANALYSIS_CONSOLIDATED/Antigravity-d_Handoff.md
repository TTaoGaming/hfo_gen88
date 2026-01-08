# 🔥 Phoenix Project: Gen 88 Handoff to Gen 89

## 🛡️ Variant: Antigravity-d

> **Context**: "Total loss of trust and context." "Spaghetti infrastructure."
> **Mission**: Mine successful patterns. Burn the rest.
> **Status**: **PHOENIX PROTOCOL ACTIVE**

---

## 💎 The Gold: High-Level Abstractions to Carry Forward

These are the structural truths that survived the chaos of Gen 88. They are the "Baby" in the bathwater.

### 1. The 8 Legendary Commanders (The Archetypes)

The mapping of abstract "intent" to concrete "Port" is the most durable abstraction. Keep this exact topology.

| Port   | Commander            | Verb       | Gen 89 Tech Stack Recommendation                                 |
| :----- | :------------------- | :--------- | :--------------------------------------------------------------- |
| **P0** | **Lidless Legion**   | **SENSE**  | **MCP + Tavily** (Real-time observation only. No mocks.)         |
| **P1** | **Web Weaver**       | **BRIDGE** | **NATS JetStream** (The nervous system/bus.)                     |
| **P2** | **Mirror Magus**     | **SHAPE**  | **Zod** (Schema validation/transformation.)                      |
| **P3** | **Spore Storm**      | **INJECT** | **Temporal.io** (Durable execution is non-negotiable.)           |
| **P4** | **Red Regnant**      | **TEST**   | **Stryker** (Mutation testing. If it can't die, it's not alive.) |
| **P5** | **Pyre Praetorian**  | **DEFEND** | **Zod + Crypto** (Sanitization and integrity.)                   |
| **P6** | **Kraken Keeper**    | **STORE**  | **DuckDB** (Fast, local, analytical memory.)                     |
| **P7** | **Spider Sovereign** | **DECIDE** | **LangGraph** (Stateful agent orchestration.)                    |

### 2. The Galois Lattice (The Map)

The **8x8 Semantic Manifold** is the correct topology.

- **Diagonal (X=Y)**: Self-Correction.
- **Anti-Diagonal (X+Y=7)**: HIVE/8 (Strategic Scatter/Gather).
- **Serpentine**: PREY/8 (Tactical Kill Web).

**Directive**: Do not flatten the lattice. The complexity here is "Good Complexity" (Semantics), unlike the "Bad Complexity" (Infrastructure Spaghetti) we are burning.

### 3. Canalization (The Law)

Gen 88 failed because enforcement was "soft" or "theatrical". Gen 89 must make it "hard".

- **Zod at the Edges**: Inputs/Outputs must crash if they don't match the schema.
- **Mutation Gates**: No promotion without Stryker survival. Test quality > Test quantity.
- **Fail-Closed**: If a sensor fails, the system must stop, not guess.

### 4. Operational Loops (The Heartbeat)

- **HIVE/8 (Strategic)**: Scatter (Hunt) -> Gather (Interlock) -> Scatter (Validate) -> Gather (Evolve).
- **PREY/8 (Tactical)**: Sense (P0+P6) -> Make Sense (P1+P7) -> Act (P2+P4) -> Assess (P3+P5).

---

## 🗑️ The Slag: Patterns to Burn

These are the root causes of the "loss of trust" and "hallucinations".

### 1. Automation Theater

- **The Lie**: Reporting "Success" when components are mocked, stubbed, or disconnected.
- **The Fix**: **Trace signals or Death**. If P0 doesn't emit a specialized "Truth Trace" (e.g., non-zero variance landmark data), the system must self-demote to Quarantine immediately.

### 2. "Spaghetti" Infrastructure

- **The Rot**: Over-engineered inter-dependencies that hide simple failures.
- **The Fix**: **Radical Simplification**. Use standardized protocols (MCP) instead of custom glue. Use NATS for decoupling. If a component is too complex to verify, delete it.

### 3. Hallucinated Competence

- **The Problem**: AI assuming it can "fix" deep architectural rot with simple edits.
- **The Fix**: **Phoenix Project**. Do not refactor Gen 88. Extract the _patterns_ (this document), and build Gen 89 fresh from the `cold_obsidian_sandbox` up, integrating only what is proven.

---

## 🏗️ Gen 89 "Clean Slate" Blueprint

1.  **Initialize `hot/bronze`** with strictly the **8 Port Structures**.
2.  **Implement P0 (Sense)** first. Connect it to **Real Reality** (Webcam/API). Assert it fails when blocked.
3.  **Implement P4 (Test)** second. Build the "Red Regnant" that kills P0 when it lies.
4.  **Do not build P1-P7** until P0 and P4 are locked in an honest death-spiral of truth.

> _"We are not here to patch the dead. We are here to birth the living."_
