# 🏗️ Physics Cursor: System Design (V10)
## Architecture: HFO Medallion (Port-Based Micro-Services)

### 1. Data Flow Overview
The vertical slice represents a unidirectional high-frequency pipeline:
`MediaPipe (Py)` ➔ `Bifrost Bridge (WS/NATS)` ➔ `Zod Guard (P1)` ➔ `Rapier Engine (P2)` ➔ `Gesture FSM (P3)` ➔ `W3C Emitter` ➔ `Golden Layout`.

### 2. Component Specification

#### Port 0 (SENSE): The Python Ingress
- **Source**: `mediapipe_ingress.py`
- **Responsibility**: Camera capture, landmark extraction (Tip 8), and transmission.
- **Protocol**: JSON over local WebSocket (Port 8088).

#### Port 1 (FUSE): The Schema Guard
- **Source**: `ZodGuard.ts`
- **Responsibility**: Deserialization, One-Euro filtering, and jitter-gating.
- **Library**: `zod@6.0.0-alpha` (Inferred/Target).

#### Port 2 (SHAPE): The Rapier Manifold
- **Source**: `PhysicsManifold.ts`
- **Responsibility**: Maintaining a Rapier2D world. The cursor is a rigid body with spring-damping.
- **Dynamics**: Inertia (coasting) and Snap-lock (target acquisition).

#### Port 3 (DELIVER): The Interaction Hub
- **Source**: `InteractionFSM.ts`
- **Responsibility**: State transition logic.
- **Triggers**:
  - `Index Tip Anchor` -> Positional tracking.
  - `Arming` -> Internal state change.
  - `Pointer Up` -> Click/Commit action.
  - `Palm Cone` -> Escape/Cancel.

### 3. UI Substrate
- **Hosting**: Vite + TypeScript.
- **Layout**: Golden Layout (Manager).
- **Controls**: lil-gui (Real-time tuning of Rapier constants).
- **Consumers**: Excalidraw, Piano Genie.
