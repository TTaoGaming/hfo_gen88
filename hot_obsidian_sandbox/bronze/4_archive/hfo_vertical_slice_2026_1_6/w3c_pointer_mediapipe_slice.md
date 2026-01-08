# Vertical Slice: W3C Pointer via MediaPipe
**Version**: 2026-01-06 | **Status**: PROVEN_EXEMPLAR | **HIVE Phase**: V (Validate)

This document outlines the high-maturity pipeline for converting noisy MediaPipe hand landmarks into a stable, universal **W3C Pointer Control Plane**.

---

## 🏗️ The 4-Stage Hardware-in-the-Loop Pipeline

| Stage | Component | Technology (Maturity) | Purpose |
| :--- | :--- | :--- | :--- |
| **0: SENSE** | **MediaPipe Tasks-Vision** | Google Stable (v0.10+) | High-speed landmark acquisition (21 hand points). |
| **1: FUSE** | **1€ Filter + Kalman** | Academic Standard | Denoising raw jitter while maintaining sub-millisecond responsiveness. |
| **2: SHAPE** | **Rapier-JS (WASM)** | Industry Standard | Physics-based smoothing. The "Ghost Pen" has mass and momentum. |
| **3: EMIT** | **PointerEvent API** | W3C Standard | Universal output. Any web UI reacts to `@spider` input. |

---

## 🛠️ Composition of Exemplars (The "Teeth")

### 1. Denoising: The 1€ Filter (Port 1)
Raw hand landmarks jitter. We must stabilize the "Baton" before it hits the physics engine.
```typescript
// Implement in hot_obsidian_sandbox/bronze/adapters/one-euro-adapter.ts
import { OneEuroFilter } from './filters/OneEuroFilter';

const xFilter = new OneEuroFilter(60, 1.0, 0.007, 1.0);
const stabilizedX = xFilter.filter(rawLandmark.x);
```

### 2. Physics: The "Ghost Pen" Rigid Body (Port 2)
Instead of teleporting the cursor to the hand, the cursor is a **Rigid Body** connected to the hand by a **Virtual Spring**.
- **Rapier Physics**: Resolves "Anti-Midas Touch" by requiring a specific velocity/pressure threshold to trigger `pointerdown`.
- **Vertical Slice**: Use the `TtvSensorFusion` class [ttv-sensor-fusion.ts](../ttv-sensor-fusion.ts) to calculate proximity to UI elements.

### 3. Effector: Standardized W3C Output (Port 0)
Inject interaction into any browser context.
```typescript
const event = new PointerEvent('pointermove', {
  bubbles: true,
  cancelable: true,
  pointerId: 7, // HFO Spider ID
  pointerType: 'pen',
  clientX: stabilizedX,
  clientY: stabilizedY,
  pressure: pinchStrength, 
});
document.elementFromPoint(x, y)?.dispatchEvent(event);
```

---

## 🚀 Execution Roadmap: The "Ghost Pen" Spike
1. **[ ] Sensor Check**: Verify MediaPipe output (landmarks > 0).
2. **[ ] Filter Check**: Log `raw_x` vs `filtered_x` to [obsidianblackboard.jsonl](../../../obsidianblackboard.jsonl).
3. **[ ] W3C Injection**: Verify that a standard HTML button's `:hover` state triggers when the hand "hovers" near it.

---
**Commander**: Lidless Legion (Port 0) | **Validator**: [baton-validator.ts](../baton-validator.ts)
