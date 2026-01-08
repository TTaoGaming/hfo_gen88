# Requirements Document

## Introduction

A modular monolith for W3C Pointer Level 3 gesture input. Leverages high-TRL (Technology Readiness Level) solutions: browser APIs, MediaPipe, Rapier2D, XState, lil-gui. Stages communicate via browser CustomEvents.

## Glossary

- **Pipeline**: Webcam → MediaPipe → Physics → FSM → W3C Pointer
- **CustomEvent**: Browser-native event system for inter-stage communication
- **MediaPipe**: Google's hand landmark detection (21 landmarks per hand)
- **Rapier2D**: WASM physics engine for spring-damped cursor
- **OneEuroFilter**: Velocity-adaptive smoothing filter
- **XState**: Battle-tested FSM library with devtools
- **lil-gui**: Lightweight settings panel (successor to dat.GUI)
- **GoldenLayout**: Docking window manager
- **Index_Tip**: Landmark 8 - the tracked cursor point

## Requirements

### Requirement 1: Sensor Stage (Webcam + MediaPipe)

**User Story:** As a user, I want my hand tracked in real-time from webcam.

#### Acceptance Criteria

1. WHEN the application starts, THE Sensor_Stage SHALL request webcam via getUserMedia
2. THE Sensor_Stage SHALL run MediaPipe GestureRecognizer on video frames
3. WHEN a hand is detected, THE Sensor_Stage SHALL dispatch CustomEvent with landmarks and gesture
4. IF no hand detected, THEN THE Sensor_Stage SHALL dispatch "no_hand" event
5. THE Sensor_Stage SHALL constrain valid gestures to palm-facing-camera cone
6. THE Sensor_Stage settings (lil-gui) SHALL allow resolution and model complexity selection

### Requirement 2: Physics Stage (Rapier2D + OneEuro + Inertia System)

**User Story:** As a user, I want smooth cursor movement with physics inertia, coasting, and snap-lock.

#### Acceptance Criteria

1. WHEN landmark event received, THE Physics_Stage SHALL apply OneEuroFilter to index fingertip
2. THE Physics_Stage SHALL maintain Rapier2D world with spring-damped cursor body
3. THE Physics_Stage SHALL dispatch CustomEvent with smoothed position and velocity
4. THE Physics_Stage SHALL target 30fps with configurable option (15-60fps)
5. THE Physics_Stage SHALL use Rapier velocity for predictive cursor feel
6. WHEN no landmark received (tracking loss), THE Physics_Stage SHALL coast on inertia (Rapier built-in)
7. WHEN landmark resumes after tracking loss, THE Physics_Stage SHALL snap-lock to new position
8. THE Physics_Stage SHALL maintain cursor persistence during brief tracking gaps
9. THE Physics_Stage settings (lil-gui) SHALL allow stiffness, damping, OneEuro params, fps, snap-lock threshold

### Requirement 3: FSM Stage (XState)

**User Story:** As a user, I want gestures to translate into W3C pointer actions with anti-Midas-touch safeguards.

#### Acceptance Criteria

1. THE FSM_Stage SHALL use XState with states: IDLE, ARMED, ENGAGED
2. THE FSM_Stage SHALL constrain gesture vocabulary to: Open_Palm (ready), Pointing_Up (commit)
3. THE FSM_Stage SHALL require palm-facing-camera cone (configurable, default 45°)
4. WHEN Open_Palm detected in cone, THE FSM_Stage SHALL transition to ARMED after dwell time (anti-Midas)
5. WHILE ARMED, THE FSM_Stage SHALL emit pointermove (hover/tracking)
6. WHEN Pointing_Up detected while ARMED, THE FSM_Stage SHALL transition to ENGAGED after dwell time and emit pointerdown
7. THE FSM_Stage SHALL use hysteresis for state transitions (different thresholds for enter vs exit)
8. WHILE ENGAGED, THE FSM_Stage SHALL emit pointermove (drag) - index finger position unchanged during commit
9. WHEN Open_Palm detected while ENGAGED, THE FSM_Stage SHALL transition to ARMED and emit pointerup
10. WHEN palm cone leaves camera-facing angle, THE FSM_Stage SHALL transition to IDLE and emit pointercancel
11. WHEN no hand detected for extended timeout, THE FSM_Stage SHALL transition to IDLE and emit pointercancel
12. THE FSM_Stage settings (lil-gui) SHALL allow: dwell time, hysteresis thresholds, cone angle, timeout

### Requirement 4: Emitter Stage (W3C Pointer)

**User Story:** As a developer, I want standard W3C Pointer Events.

#### Acceptance Criteria

1. WHEN FSM dispatches MOVE, THE Emitter_Stage SHALL dispatch pointermove
2. WHEN FSM dispatches DOWN, THE Emitter_Stage SHALL dispatch pointerdown
3. WHEN FSM dispatches UP, THE Emitter_Stage SHALL dispatch pointerup
4. THE Emitter_Stage SHALL use pointerType="touch" (hand not supported)

### Requirement 5: UI Shell (GoldenLayout)

**User Story:** As a user, I want an OS-like dockable UI with draggable panels.

#### Acceptance Criteria

1. THE Shell SHALL use GoldenLayout for OS-like window management
2. THE Shell SHALL support drag-and-drop panel rearrangement
3. THE Shell SHALL support panel stacking into tabs
4. THE Shell SHALL support panel splitting (horizontal/vertical)
5. THE Shell SHALL support panel maximize/restore
6. THE Shell SHALL have panels: Webcam Preview, Target Canvas, Settings (lil-gui), Debug Console
7. THE Shell SHALL persist layout to localStorage
8. THE Shell SHALL provide preset layouts (debug, minimal, presentation)
9. THE Target_Canvas SHALL display THREE cursors simultaneously:
   - Raw Cursor: MediaPipe index tip position (noisy, no processing)
   - Physics Cursor: OneEuro + Rapier smoothed position with FSM state color
   - Predictive Cursor: Physics velocity extrapolated position (snappy, ahead of physics)
10. THE Target_Canvas SHALL allow toggling visibility of each cursor type
11. THE Target_Canvas SHALL respond to pointer events from Physics Cursor
12. THE Debug_Console SHALL show event log and FSM state


### Requirement 6: Testing Infrastructure (Red Regnant)

**User Story:** As a developer, I want mutation testing and property-based testing with synthetic data, so that I have confidence in code correctness.

#### Acceptance Criteria

1. THE Pipeline SHALL have property-based tests using fast-check
2. THE Pipeline SHALL have mutation testing using Stryker
3. THE Pipeline SHALL achieve minimum 80% mutation score
4. THE Testing infrastructure SHALL support synthetic landmark data injection
5. THE Tests SHALL verify: when frames drop, Raw Cursor drops but Physics/Predictive cursors coast
6. THE Tests SHALL verify: when tracking resumes, Physics cursor snap-locks to new position
7. THE Tests SHALL verify: during coast, Physics cursor maintains inertia from last velocity
8. THE OneEuroFilter SHALL have property tests for smoothing bounds
9. THE Physics_Stage SHALL have property tests for position/velocity consistency
10. THE Physics_Stage SHALL have property tests for coast behavior during frame drops
11. THE FSM_Stage SHALL have property tests for state transition validity
12. THE FSM_Stage SHALL have property tests for hysteresis behavior
13. THE Emitter_Stage SHALL have property tests for event coordinate scaling
14. THE Testing infrastructure SHALL follow Red Regnant patterns from P4_RED_REGNANT
15. THE Pipeline SHALL log test failures to Blood Book of Grudges (obsidianblackboard.jsonl)
