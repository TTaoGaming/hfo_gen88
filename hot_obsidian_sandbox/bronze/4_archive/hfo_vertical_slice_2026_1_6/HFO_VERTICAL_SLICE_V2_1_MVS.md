# 🟢 HFO Vertical Slice v2.1: The Minimum Viable Symbiote (MVS)

## 🎯 The "AI-Ease" Philosophy
The complex infrastructure (Temporal, NATS, Vite-WASM) creates "Integration Friction" where the AI spends more energy fighting the build tool than solving the logic. V2.1 strips this back to **High-Maturity Native Standards**.

---

## 📍 Step 1: The W3C Pointer "Sandbox" (MediaPipe)
**Objective**: Proof of Physics.
- **Simplest Implementation**: A single `index.html` file using standard `<script type="module">`.
- **Exemplar**: Use **esm.sh** to import MediaPipe Tasks Vision and OneEuroFilter directly.
- **Infrastructure**: Zero. Use any live server (Vite, Five Server, python -m http.server).
- **Core Logic**:
  ```javascript
  import { GestureRecognizer } from "https://esm.sh/@mediapipe/tasks-vision";
  import { OneEuroFilter } from "https://esm.sh/one-euro-filter";
  
  // (1) Get Frame -> (2) Get Landmarks -> (3) Filter -> (4) Emit PointerEvent
  ```
- **Benefit**: No WASM pathing issues, no Vite config headaches. It just runs in any browser.

---

## 📍 Step 2: HFO Statefulness "The Blackboard Checkpoint"
**Objective**: Break AI statelessness without heavy DevOps.
- **Simplest Implementation**: Use the existing `obsidianblackboard.jsonl` as a **Durable Stack**.
- **AI Protocol**:
  1. **READ**: AI must read the last 5 Blackboard entries at the start of every turn.
  2. **PUSH**: AI must append a `CHECKPOINT` event before making any file changes.
  3. **STRUCTURE**:
     ```jsonl
     {"ts": "...", "type": "CHECKPOINT", "state": "IMPLEMENTING_ONE_EURO", "next": "VALIDATE_POINTER_DOWN"}
     ```
- **Benefit**: Mimics the "Event Sourcing" of Temporal but uses the text context we already share. It makes the AI "remember" its trajectory.

---

## 📍 Step 3: The UI Substrate (GoldenLayout Lite)
- **Simplest Implementation**: Use **GoldenLayout via CDN** or a simple **CSS Grid**.
- **Requirement**: Just two panels:
  1. `[Camera Preview]`: Show landmark overlays.
  2. `[Drawing Surface]`: Standard `<canvas>` that reacts to `pointermove` and `pointerdown`.
- **Benefit**: Visual feedback is the only way to catch "Physics Jitter" which unit tests miss.

---

## 🚀 The AI "Easy-Build" Sequence
1.  **Create** `hot_obsidian_sandbox/bronze/mvs_sandbox.html`.
2.  **CDN-Import** MediaPipe & OneEuro.
3.  **Implement** the "PointerBridge" (Landmark -> Native Pointer Event).
4.  **Log** every success/failure to the Blackboard.

---

## 🏆 Selection Logic
Choose **v2.1 MVS** if you want a working vertical slice **today**. 
The AI can write this entire 1-file solution in a single turn without hallucinating config paths. Once this "Signal" is proven, we "Canalize" it into the Silver/Gold infrastructure.

*Status: SIMPLIFIED_FOR_AI_TRAJECTORY*
*Commander: Spider Sovereign (Port 7)*
