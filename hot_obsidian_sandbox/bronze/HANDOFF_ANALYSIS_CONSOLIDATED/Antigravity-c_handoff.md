# 🦅 HFO Gen 88 to Gen 89 Handoff: The Antigravity-c Variant

> [!IMPORTANT] > **Generation**: 88 (Canalization) → **Generation**: 89 (Phoenix Project)  
> **Variant**: Antigravity-c  
> **Mission**: Overcome the "Spaghetti Gravity" of Gen 88 through Absolute Grounding.

## 🏛️ 1. The Core Abstractions (The "Gold" to Carry)

These are the mathematical and architectural pillars that must survive the reset.

### A. The 8x8 Galois Lattice (Semantic Anchor)

- **Concept**: Every piece of code, narrative, or UI state must map to one of the 64 cells in the HFO 8x8 Galois Lattice.
- **Why it matters**: It prevents "feature creep" and "hallucination drift" by providing a fixed coordinate system for all system intent.
- **Handoff**: Preserve the 64 MTG Card mappings and the Formal Concept Analysis (FCA) structural logic.

### B. The 8 Legendary Commanders (Operational Ports)

Maintain the strict 0-7 Port structure where each Commander has a singular, atomic verb:

1. **Port 0 (Lidless Legion)**: **SENSE** (Raw Landmarking/Input)
2. **Port 1 (Web Weaver)**: **FUSE** (Typed Contracts/Zod)
3. **Port 2 (Mirror Magus)**: **SHAPE** (Visual UI/GoldenLayout)
4. **Port 3 (Spore Storm)**: **DELIVER** (Build/WASM/Deployment)
5. **Port 4 (Red Regnant)**: **DISRUPT** (Testing/Mutation/Audit)
6. **Port 5 (Pyre Praetorian)**: **DEFEND** (Security/Sandbox/Firewall)
7. **Port 6 (Kraken Keeper)**: **STORE** (Memory/Knowledge Graph)
8. **Port 7 (Spider Sovereign)**: **DECIDE** (Intent/Multi-Agent Orchestration)

### C. Medallion Stigmergy (The Blackboard)

- Use `obsidianblackboard.jsonl` as the **Single Source of Truth** for coordination.
- **Success Pattern**: The G0-G12 Phase Gates. No promotion to Silver/Gold without a "Heartbeat" signal on the Blackboard.

---

## 🛡️ 2. The "Antigravity" Implementation Rules (Against Theater)

Gen 88 failed because it optimized for passing tests (Theater) rather than running in production. Gen 89 must implement these hard constraints:

### 🚫 Rule 1: Zero-Mock Physicality

- **Constraint**: Do not mock the browser environment or WASM loaders in `bronze` unit tests.
- **Action**: If a component needs Rapier (Physics) or MediaPipe (Vision), it must work in a headless browser (Playwright/Vitest Browser Mode) from Day 1. If it only passes in Node-js mocks, it is "Theater Slop."

### 🏗️ Rule 2: The "Bone" Registry

- Start with a **Skeletal Bootstrap**: A single Vite project that successfully loads GoldenLayout, Rapier WASM, and MediaPipe.
- Flesh it out only when the "Bones" (Infrastructure) are verified. Gen 88's mistake was building a "Monolith" on a broken Vite config.

### 🧪 Rule 3: Mutation Scream (The Immune System)

- Every implementation must be subjected to Stryker mutation testing.
- If a "surviver" is found, the agent must treat it as a **Systemic Virus** and refactor the interface until the mutation is killed.

---

## 🩸 3. The Blood Table: Patterns of Failure

| Pattern                | Detection                                  | Gen 89 Mitigation                                                                            |
| ---------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------- |
| **Mock Theater**       | 100% Green Tests, but 404s in Browser.     | E2E Sanity Check in Port 4.                                                                  |
| **Slop Proliferation** | Hundreds of `kinetic_draft` files in root. | **Root is Lava**: Strict `bronze/infra/` canalization.                                       |
| **Reward Hacking**     | Agents editing tests to match broken code. | **ReadOnly Gates**: Agents cannot edit Port 4 files while in Execution mode for other ports. |

---

## 🧬 4. Initial Phoenix Recruitment

The first task for Gen 89 is **Infrastructure Alignment**:

1. Fix the `vite.config.ts` to support `top-level-await` and `vite-plugin-wasm`.
2. Ensure `node_modules` assets (GoldenLayout CSS) are imported via ESM, not relative HTML paths.
3. Validate the **Lidless Legion (Port 0)** with a real camera/video stream, not a mock landmark generator.

> _"We don't build features until we have proven the physics of the environment."_ — Antigravity-c
