# 🕸️ Port 0: Universal Gesture Control Plane
**Mission Thread**: Total Tool Virtualization (TTV)
**Status**: BRONZE (Interlock)
**Provenance**: hot_obsidian_sandbox/bronze/P0_UNIVERSAL_GESTURE_PLANE/README.md

## 🎯 Goal
Transform raw, noisy hand landmarks from MediaPipe into robust, predictive W3C Pointer Events via a physics-based Finite State Machine (FSM).

## 🏗️ Architecture
1. **Sensor**: MediaPipe `GestureRecognizer` (Landmark 8 Tracking).
2. **Filter**: `OneEuroFilter` (Velocity-adaptive smoothing).
3. **Physics**: `Rapier2D` spring-damper.
   - **Coasting**: Continues on inertia when tracking is lost.
   - **Snap-lock**: Rapidly converges when tracking resumes.
4. **FSM**: XState machine for gesture intent (Hover, Click, Drag).
5. **Emitter**: W3C `PointerEvent` Level 3 dispatcher.

## 🧪 Verification (TDD)
- [ ] Requirements Traceability.
- [ ] Red Tests (Failing).
- [ ] Green Tests (Passing).
- [ ] Mutation Score >= 80%.
