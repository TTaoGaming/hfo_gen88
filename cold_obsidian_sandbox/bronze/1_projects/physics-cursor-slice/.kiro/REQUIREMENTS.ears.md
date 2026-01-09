# 📋 Physics Cursor: EARS Requirements (V10)
## Namespace: HFO_GEN88_SLICE_PC

This document follows the **Amazon EARS (Easy Approach to Requirements Syntax)** patterns.

---

### 1. Ubiquitous Requirements
- **R-UB-01**: The System SHALL anchor the virtual cursor to the index fingertip landmark (ID 8) received from the MediaPipeline.
- **R-UB-02**: The System SHALL validate all inter-port data transfers using Zod 6.0 schema strict-validation.
- **R-UB-03**: The System SHALL maintain a local DuckDB analytical ledger of all 1000Hz state changes.

### 2. Event-Driven Requirements
- **R-EV-01**: **WHEN** a new coordinate packet arrives from the Python MediaPipeline **THEN** the System SHALL transform the raw signal into a Zod-validated `SensorFrame`.
- **R-EV-02**: **WHEN** the "Arming" gesture is detected (Index Tip fixed) **THEN** the System SHALL transition the FSM to `ACQUIRING` state.
- **R-EV-03**: **WHEN** the "Pointer Up" gesture occurs WHILE in `ACQUIRING` state **THEN** the System SHALL dispatch a W3C `pointerup` event to the substrate.
- **R-EV-04**: **WHEN** the Palm Cone Angle deviates > 30° from the camera normal **THEN** the System SHALL immediately transition to `IDLE` and cancel active gestures.

### 3. Unwanted Behavior Requirements (Error Handling)
- **R-UN-01**: **IF** MediaPipe tracking confidence drops below 0.8 **THEN** the System SHALL enter `COASTING` mode using Rapier-based linear prediction.
- **R-UN-02**: **IF** coordinate jitter exceeding 5px is detected **THEN** the System SHALL apply a One-Euro noise suppression filter.
- **R-UN-03**: **IF** the OS native mouse attempts to capture focus **THEN** the System SHALL suppress the native hardware-interrupt signal.

### 4. State-Driven Requirements
- **R-ST-01**: **WHILE** in the `ACQUIRING` state, the System SHALL apply a Rapier snap-lock force vector toward the nearest interactive ID.
- **R-ST-02**: **WHILE** the cursor is in motion, the System SHALL apply spring-damped inertia calculated via the Rapier2D engine.
- **R-ST-03**: **WHILE** the substrate depth is indeterminate, the System SHALL default the cursor Z-index to the primary interaction plane.
