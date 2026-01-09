# 🎯 Total Tool Virtualization
**Area**: Camera → W3C Physics Cursor
**Status**: V10 Vertical Slice (Active)

---

## The Pipeline

```
Camera Stream
     ↓
MediaPipe (Python) → Hand Landmark 8 (Index Tip)
     ↓
Port 0: SENSE → Normalized Coordinates (X, Y, Z)
     ↓
Port 1: FUSE → Zod 6.0 Schema Validation
     ↓
Port 2: SHAPE → Rapier Physics (Inertia, Snap-lock)
     ↓
Port 3: DELIVER → W3C PointerEvent Injection
     ↓
Target App (Excalidraw, Piano Genie, Golden Layout)
```

---

## Port Responsibilities (V10)

### P0: Lidless Legion (Signal Ingress)
- Raw MediaPipeline acquisition
- Python (OpenCV / MediaPipe)
- Confidence gating (> 0.8)
- Frame timestamping

### P1: Web Weaver (Schema Stabilization)
- Zod 6.0 strict mode
- Python → TypeScript bridge
- JSON payload sanitization

### P2: Mirror Magus (Physics Manifold)
- Rapier.js / Rapier.rs (Wasm)
- Inertia & smoothing
- Snap-lock to POI (Point of Interest)
- Kalman predictive filter

### P3: Spore Storm (Interaction FSM)
- XState / Custom FSM
- States: Idle → Arming → Acquiring → Committed
- W3C PointerEvent generation
- Sub-millisecond dispatch

### P4: Red Regnant (Feedback Disruption)
- OS mouse interference suppression
- Jitter attack mitigation
- Hardware-lock sequence

### P5: Pyre Praetorian (Integrity Guard)
- Ground truth verification
- Drift detection & correction
- Coordinate invariance audit

### P6: Kraken Keeper (Telemetry)
- 1000Hz interaction logging
- DuckDB / JSONL persistence
- AAR (After-Action Review) replay

### P7: Spider Sovereign (Orchestration)
- Multi-substrate navigation
- Domain handover (Excalidraw ↔ Piano Genie)
- Mission control

---

## Gesture FSM (The Commit Pulse)

```
[*] → Idle
Idle → Arming (gesture detected)
Arming → Acquiring (target locked)
Acquiring → Committed (pointer UP)
Committed → [*] (W3C dispatch)

Arming → Cancelled (palm away)
Acquiring → Cancelled (palm away)
Cancelled → Idle (release)
```

---

## Technology Stack

| Layer | Tech |
|:---|:---|
| Sensing | Python, OpenCV, MediaPipe |
| Schema | Zod 6.0, TypeScript |
| Physics | Rapier.js/rs (Wasm) |
| FSM | XState |
| Events | W3C Pointer Events |
| Storage | DuckDB, JSONL |
| Targets | Golden Layout, Excalidraw, Piano Genie |

---

## Key Insight

> The Physics Cursor is a **Digital Twin** of the user's fingertip.
> It exists in a virtual manifold, decoupled from OS hardware.
> All interactions flow through the W3C standard interface.

---

*See: [[2_areas/architecture/physics-cursor]] for technical details*
