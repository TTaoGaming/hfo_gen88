# 🟢 W3C Vertical Slice Spike: The Ghost Pointer Protocol

## 🚀 Context & Condensation
Current documentation (`W3C_GESTURE_PIPELINE_HANDOFF.md`, `TTV_VERTICAL_SLICE_SPEC.md`) describes a high-fidelity pipeline (MediaPipe -> Rapier -> XState -> UI). However, the `REAL_APP_STATUS_REPORT.md` reveals a **Runtime Integrity Gap**: the system is too complex to boot due to Vite/WASM/Asset errors.

### The "Anti-Overengineering" Rule
> "If you cannot click a button with your index finger in 5 minutes of dev, the architecture is a liability."

---

## 🛠️ The 3 Paths to Victory

### 1. 🛡️ Path Alpha: The Hacker Spike (Lo-Fi)
**Goal**: Zero infrastructure. Prove injection works.
- **Setup**: Single HTML file with MediaPipe CDN.
- **Architecture**: No Ports, No Adapters. Just a `requestAnimationFrame` loop.
- **Logic**: 
  - `(land_marks) => { window.dispatchEvent(new PointerEvent('pointermove', { clientX, clientY })) }`
  - `(pinch) => { window.dispatchEvent(new PointerEvent('pointerdown', { ... })) }`
- **Success Criteria**: A standard `<button onclick="alert('HIT')">` triggers when "pinched" in the air.
- **Why**: Eliminates Vite, GoldenLayout, and Rapier as failure points.

### 2. 🏗️ Path Beta: The Structural Pilot (Mid-Fi) - **RECOMMENDED**
**Goal**: Fix the Monolith's boot sequence and establish a stable baseline.
- **Setup**: Fix `P0_GESTURE_MONOLITH/vite.config.ts` (Add `vite-plugin-wasm`, `topLevelAwait`).
- **Architecture**: Use the existing `MediaPipeAdapter`, but bypass Rapier and XState.
- **Logic**: 
  - Wire `SmoothedPosition` (OneEuro) directly to a `PointerEmitter`.
  - Use GoldenLayout to show "Webcam" vs "Canvas Target".
- **Success Criteria**: The app boots in a real browser. GoldenLayout panels are visible. You can draw dots on a canvas.
- **Why**: Reclaims the existing investment while removing "Theater" (broken mocks).

### 3. ☄️ Path Gamma: The TTV Protocol (Apex)
**Goal**: High-fidelity "Total Tool Virtualization".
- **Setup**: Full pipeline with **Zod Contract Law** between stages.
- **Architecture**: The 5-stage pipeline (Sensor -> Physics -> FSM -> Emitter -> UI).
- **Logic**:
  - `Rapier2D`: Provides "Friction" and "Snap" so the cursor doesn't jitter.
  - `XState`: Manages states (IDLE -> HOVER -> PINCH_DOWN -> DRAGGING).
  - `W3C Emitter`: Sends full 6DOF-lite data (pressure, tilt via hand orientation).
- **Success Criteria**: A virtual "Pen" can drag a GoldenLayout window or operate a `lil-gui` slider seamlessly.
- **Why**: This is the final vision. Only attempt once Path Beta is stable.

---

## 🛑 Critical Infrastructure Fixes (Immediate)
Regardless of the chosen path, these "Red Regnant" violations must be cleared:
1. **Vite WASM**: Install `vite-plugin-wasm` and add to `vite.config.ts`.
2. **CSS Resolution**: Remove `<link>` tags pointing to `node_modules` in `index.html`. Import them in `main.ts` or a central `.css` file.
3. **E2E Sanity**: Add a single Playwright test file `tests/boot.test.ts` to ensure the app actually renders.

---

## 🎯 Next Step: Selection
Choose a Path:
- **ALPHA** if you are frustrated with the build tool and just want to see it work.
- **BETA** if you want to keep the current repo but want it to "just work".
- **GAMMA** if you have fixed the build and are ready for professional feel.

*Drafted by GitHub Copilot (Gemini 3 Flash (Preview))*
