# 🧪 TTV Prototype HIVE Plan
**Mission**: Consolidate TTV vision into a testable vertical slice.

## 1. Goal: "The Magic Marker"
- **Hardware**: Webcam + Physical Marker (Passive Prop).
- **Function**: Tracking the marker transforms it into a "W3C Pointer" that can draw on a Three.js canvas.
- **Form**: The marker is overlaid with a 3D "Laser" or "Surgical Tool" model.

## 2. HIVE Phases

### H (Hunt) - COMPLETED
- Research performed on Mediapipe, GenUI, and W3C L3.
- Architecture mapped to Port 0 (Observe), Port 2 (Shape), Port 3 (Inject).

### I (Interlock) - IN PROGRESS
- [ ] Create `ttv-sensor-fusion.test.ts` (RED).
- [ ] Logic: If a hand landmark is near a "detected object" landmark, the object becomes the "Active Tool".
- [ ] Logic: Distinguish between "Pointer" and "Gripped Tool".

### V (Validate)
- [ ] Implement `TtvSensorFusion` class to pass tests.
- [ ] Hook into `MediaPipeAdapter`.

### E (Evolve)
- [x] Core Sensor Fusion (Hand + Prop) logic implemented and tested.
- [ ] **Prompt-to-Tool Bridge**:
    - Add a `ToolLibrary` class that maps tool names to 3D models and Pointer Event schemas.
    - Integration point: `TtvSensorFusion` returns the tool *metadata*, which triggers a Three.js model swap.
- [ ] **HFO Effectors**:
    - Connect virtual tool actions (swaps/moves) to a NATS bridge for IoT/Robotic control (Port 3).

## 4. Vision: The Strange Loop
The system is built as a **Strange Loop** where the child's voice creates the tool, the tool trains the child, and the child's training refines the tool's AI generation through a feedback loop (HFO Immune System).

