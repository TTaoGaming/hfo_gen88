# 📝 HFO Gen 88: Physics Cursor Requirements (EARS Syntax)
## Project: Vertical Slice V10

This document defines the system requirements for the **HFO Physics Cursor** using the **Amazon EARS (Easy Approach to Requirements Syntax)** standard.

---

### 1. Ubiquitous Requirements (System-Wide)
- **R-UB-01**: The System shall anchor the virtual cursor to the user's index fingertip (Landmark 8) provided by the MediaPipeline.
- **R-UB-02**: The System shall validate all cross-port messages using Zod 6.0 schema boundaries.
- **R-UB-03**: The System shall maintain a 1000Hz internal telemetry log for After-Action Review (AAR).

### 2. Event-Driven Requirements (Triggers)
- **R-EV-01**: WHEN the MediaPipeline detects an index fingertip coord change THEN the System shall apply a Rapier physics impulse to the virtual cursor twin.
- **R-EV-02**: WHEN the Arming gesture is detected THEN the System shall transition the FSM to the "Target Acquisition" state.
- **R-EV-03**: WHEN the Pointer Up gesture is detected WHILE in the "Acquiring" state THEN the System shall dispatch a W3C Pointer Commit event.
- **R-EV-04**: WHEN the Palm Cone Angle exceeds the "Away" threshold THEN the System shall instantly cancel the active gesture and transition to "Idle".

### 3. State-Driven Requirements (Persistent States)
- **R-ST-01**: WHILE in the "Target Acquisition" state, the System shall calculate and apply snap-lock forces toward the nearest viable interaction target ID.
- **R-ST-02**: WHILE moving the cursor, the System shall apply Rapier-based inertia and smoothing to the virtual transform.
- **R-ST-03**: WHILE the palm is open, the System shall remain in the "Released" state and ignore unintentional pointer triggers.

### 4. Unwanted Behavior Requirements (Error Handling)
- **R-UB-01**: IF the MediaPipeline confidence score drops below 0.8 THEN the System shall interpolate the cursor position using the last known-good state and Rapier predictive inertia.
- **R-UB-02**: IF a native OS mouse event conflicts with the virtual manifold THEN the System shall suppress the native hardware interrupt.
- **R-UB-03**: IF the virtual cursor coordinates drift more than 5mm from the MediaPipeline raw ground truth THEN the System shall trigger a state-alignment pulse.

### 5. Optional / Feature Requirements
- **R-OP-01**: WHERE the Golden Layout substrate is active, the System shall map W3C events to the appropriate layout tile boundaries.
- **R-OP-02**: WHERE the Excalidraw tool is selected, the System shall enable "Drawing Mode" state transitions within the FSM.

---
*Signed,*
**The Swarm Lord of Webs (Navigator)**
*Port 7 Sovereignty*
