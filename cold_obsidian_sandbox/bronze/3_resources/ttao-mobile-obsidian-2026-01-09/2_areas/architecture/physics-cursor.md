# 🎯 Physics Cursor Architecture
**Reference**: V10 Vertical Slice
**Layer**: 2_areas (Infrastructure)

---

## The Vision

> Total Tool Virtualization: Camera → W3C Pointer
> A physics-enabled cursor that exists in a virtual manifold,
> decoupled from OS hardware, flowing through W3C standards.

---

## Pipeline Overview

```
┌─────────────────────────────────────────────────────────┐
│                    CAMERA STREAM                        │
└─────────────────────┬───────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  P0: LIDLESS LEGION (SENSE)                             │
│  MediaPipe → Hand Landmark 8 → Normalized (X,Y,Z)       │
│  Technology: Python, OpenCV, MediaPipe                  │
└─────────────────────┬───────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  P1: WEB WEAVER (FUSE)                                  │
│  Zod 6.0 Schema Validation → TypeScript Contract        │
│  Technology: Zod, TypeScript, NATS/IPC                  │
└─────────────────────┬───────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  P2: MIRROR MAGUS (SHAPE)                               │
│  Rapier Physics → Inertia, Snap-lock, Smoothing         │
│  Technology: Rapier.js/rs (Wasm), Kalman Filter         │
└─────────────────────┬───────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  P3: SPORE STORM (DELIVER)                              │
│  FSM → W3C PointerEvent → Target App                    │
│  Technology: XState, W3C Pointer Events                 │
└─────────────────────┬───────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  TARGET APPLICATIONS                                    │
│  Golden Layout | Excalidraw | Piano Genie               │
└─────────────────────────────────────────────────────────┘
```

---

## Support Ports

### P4: Red Regnant (DISRUPT)
- Suppress OS mouse interference
- Mitigate jitter attacks
- Maintain virtual chain dominance

### P5: Pyre Praetorian (DEFEND)
- Verify ground truth coordinates
- Detect and correct drift
- Enforce coordinate invariance

### P6: Kraken Keeper (STORE)
- Log 1000Hz telemetry
- Persist to DuckDB/JSONL
- Enable AAR replay

### P7: Spider Sovereign (NAVIGATE)
- Orchestrate domain handover
- Route across tool boundaries
- Mission control

---

## Gesture FSM (The Commit Pulse)

```
         ┌──────────────────────────────────────┐
         │                                      │
         ↓                                      │
      [IDLE]                                    │
         │                                      │
         │ Arming Gesture Detected              │
         ↓                                      │
     [ARMING] ──── Palm Away ────→ [CANCELLED] ─┘
         │                              ↑
         │ Target Acquired              │
         ↓                              │
   [ACQUIRING] ── Palm Away ────────────┘
         │
         │ Pointer UP (Commit)
         ↓
   [COMMITTED]
         │
         │ Dispatch W3C Success
         ↓
       [END]
```

---

## Key Technologies

| Component | Technology | Purpose |
|:---|:---|:---|
| Hand Tracking | MediaPipe | Landmark detection |
| Schema | Zod 6.0 | Contract validation |
| Physics | Rapier.js/rs | Inertia, collision |
| Prediction | Kalman Filter | Smoothing |
| FSM | XState | State management |
| Events | W3C Pointer | Standard interface |
| Storage | DuckDB | Analytical queries |
| Logging | JSONL | Streaming persistence |

---

## Target Substrates

1. **Golden Layout**: Window management
2. **Excalidraw**: Drawing/whiteboard
3. **Piano Genie**: Musical interaction

---

## Core Insight

> The Physics Cursor is a **Digital Twin** of the user's fingertip.
> It exists independently of the OS cursor.
> All interactions flow through W3C PointerEvent standard.

---

*See: [[../commanders/p2-mirror-magus]] for physics details*
