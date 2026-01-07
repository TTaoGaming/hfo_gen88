# 🎯 1-Pager: W3C Pointer Vertical Slice (The "Ghost Pen")

> **Status**: PROPOSAL (HIVE HUNT Phase)
> **Goal**: Achieve a functional, non-theater "thin slice" of Total Tool Virtualization (TTV).
> **Constraint**: No NATS, no Orchestration, no Boilerplate. Just the math and the events.

## 🏗️ Simplified Pipeline (Port-Lite)
Break away from the 8-Port Commander theater. Use a clean, functional pipeline:

1. **SENSE**: MediaPipe `GestureRecognizer` (Lite) extracts Index Tip (Landmark 8).
2. **SMOOTH**: `OneEuroFilter` (β=0.01, dcf=1.0) eliminates jitter.
3. **FUSE**: `PinchFSM` detects "Arming" (Palm Open) vs "Drawing" (Index/Thumb Pinch).
4. **EMIT**: Native `PointerEvent` dispatching to the DOM.

---

## 🛠️ Option 1: The "Minimalist" (Recommended Spike)
**Target**: A single `<canvas>` element in the center of the screen.
- **Visuals**: A red dot follows your finger. When you "pinch", it turns blue and draws a line.
- **Logic**: 
  - `MediaPipe -> 1€ Filter -> PointerMove (dot follows)`.
  - `Pinch Detected -> PointerDown`.
  - `Pinch Released -> PointerUp`.
- **Why**: Proves the entire math chain without UI framework complexity.

## 🛠️ Option 2: The "Tool-Aware" (Structured)
**Target**: A simple 3rd-party library (e.g., [Excalidraw](https://excalidraw.com/) or a button grid).
- **Goal**: Interact with "real" UI elements using nothing but virtual pointer events.
- **Logic**: 
  - Translate MediaPipe 0-1 coordinates to `window.innerWidth/Height`.
  - Dispatch `PointerDown`, `PointerMove`, `PointerUp` to `document.elementFromPoint(x, y)`.
- **Why**: Validates that our virtual events are indistinguishable from real mouse/touch events.

---

## 🚀 The Execution Plan (BRONZE MODE)

1. **[HUNT]**: Verify `mediapipe-wrapper.ts` can run in isolation.
2. **[INTERLOCK]**: Create `W3C_SPIKE_PIPELINE.ts` in `hot_obsidian_sandbox/bronze/`. 
   - Combine stages: `Sensor -> Smoother -> FSM -> Emitter`.
3. **[VALIDATE]**: Run a local Vite dev server. Open the webcam.
   - **RED**: No tracking.
   - **GREEN**: Mouse moves with hand and hovers over buttons.
4. **[EVOLVE]**: Once the "Mouse" works, add "Physics" (inertia) or "Gesture Recognition" (Palm Cone Gate).

---

## 🚫 Stop Overengineering Now
- **NO** NATS (use local event emitters).
- **NO** Temporal (use local state).
- **NO** Command-Port boilerplate (use simple functional composition).
- **NO** Theater (if it doesn't move a real pixel, it doesn't count).

---

## 🚩 Grounding & Stigmergy
- **MEMORY_GROUNDING**: Referenced Gen 88 Canalization Rules and TTV Vision.
- **SEARCH_GROUNDING**: Verified W3C Pointer Events Level 3 behavior (MDN).
- **THINKING_GROUNDING**: Sequential reduction from 8 ports to 4 stages.

**Log events to `obsidianblackboard.jsonl` upon review.**
