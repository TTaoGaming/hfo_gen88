# Implementation Plan: Gesture Pointer Monolith

## Overview

Implement a modular monolith for W3C Pointer Level 3 gesture input. Build in bronze/, test thoroughly, promote to silver/ when verified.

## Tasks

- [x] 1. Set up project structure and dependencies
  - Create `hot_obsidian_sandbox/bronze/P0_GESTURE_MONOLITH/` directory
  - Install XState, lil-gui dependencies
  - Set up TypeScript config for browser + Node compatibility
  - Create shared types and Zod schemas
  - _Requirements: 1.1-1.6, 2.1-2.9, 3.1-3.12, 4.1-4.4_

- [x] 2. Implement Physics Stage (core smoothing engine)
  - [x] 2.1 Implement OneEuroFilter class with configurable params
    - Port existing implementation from `bronze/adapters/one-euro-adapter.ts`
    - Add reset() method for tracking resumption
    - _Requirements: 2.1_
  - [x] 2.2 Write property test for OneEuro smoothing bounds
    - **Property 3: OneEuro smoothing bounds**
    - **Validates: Requirements 2.1**
  - [x] 2.3 Implement PhysicsCursor class with Rapier2D
    - Spring-damped cursor body
    - Coast on inertia when no target updates
    - Snap-lock when tracking resumes
    - _Requirements: 2.2, 2.6, 2.7, 2.8_
  - [x] 2.4 Write property test for physics coasting
    - **Property 4: Physics coasting during tracking loss**
    - **Validates: Requirements 2.6**
  - [x] 2.5 Write property test for snap-lock convergence
    - **Property 5: Snap-lock on tracking resumption**
    - **Validates: Requirements 2.7**
  - [x] 2.6 Implement PhysicsStage class with CustomEvent dispatch
    - Combine OneEuro + PhysicsCursor
    - Dispatch cursor events with raw/physics/predictive positions
    - _Requirements: 2.3, 2.5_

- [x] 3. Checkpoint - Physics Stage tests pass
  - Ensure all physics tests pass, ask the user if questions arise.

- [x] 4. Implement FSM Stage (gesture intent)
  - [x] 4.1 Define XState machine with IDLE, ARMED, ENGAGED states
    - Configure guards for confidence thresholds
    - Configure delays for dwell time
    - _Requirements: 3.1, 3.4, 3.6_
  - [x] 4.2 Write property test for gesture vocabulary constraint
    - **Property 6: Gesture vocabulary constraint**
    - **Validates: Requirements 3.2**
  - [x] 4.3 Write property test for dwell time gating
    - **Property 7: Dwell time gates state transitions**
    - **Validates: Requirements 3.4, 3.6**
  - [x] 4.4 Write property test for hysteresis
    - **Property 8: Hysteresis prevents oscillation**
    - **Validates: Requirements 3.7**
  - [x] 4.5 Implement palm cone angle validation
    - Calculate palm angle from landmarks
    - Filter gestures outside cone
    - _Requirements: 3.3_
  - [x] 4.6 Write property test for palm cone filtering
    - **Property 2: Palm cone filtering**
    - **Validates: Requirements 1.5, 3.3**
  - [x] 4.7 Implement FSMStage class with CustomEvent dispatch
    - Subscribe to cursor events
    - Dispatch FSM events with state and action
    - _Requirements: 3.5, 3.8, 3.9, 3.10, 3.11_
  - [x] 4.8 Write property test for state transition events
    - **Property 10: State transitions emit correct pointer events**
    - **Validates: Requirements 3.6, 3.9, 3.10, 3.11**

- [x] 5. Checkpoint - FSM Stage tests pass
  - Ensure all FSM tests pass, ask the user if questions arise.

- [x] 6. Implement Emitter Stage (W3C Pointer Events)
  - [x] 6.1 Implement PointerEventFactory
    - Map FSM actions to pointer event types
    - Scale coordinates to viewport
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [x] 6.2 Write property test for action-to-event mapping
    - **Property 11: FSM action to pointer event mapping**
    - **Validates: Requirements 4.1, 4.2, 4.3**
  - [x] 6.3 Write property test for coordinate scaling
    - **Property 12: Pointer event coordinate scaling**
    - **Validates: Requirements 4.1, 4.2, 4.3**
  - [x] 6.4 Implement EmitterStage class
    - Subscribe to FSM events
    - Dispatch native PointerEvents to DOM
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 7. Implement Sensor Stage (MediaPipe integration)
  - [x] 7.1 Implement WebcamCapture class
    - getUserMedia with configurable resolution
    - Frame extraction for MediaPipe
    - _Requirements: 1.1, 1.2_
  - [x] 7.2 Implement MediaPipeWrapper class
    - Load GestureRecognizer model
    - Process frames and extract landmarks/gestures
    - _Requirements: 1.2, 1.3_
  - [ ] 7.3 Write property test for landmark event structure
    - **Property 1: Landmark events contain valid structure**
    - **Validates: Requirements 1.2, 1.3**
  - [x] 7.4 Implement SensorStage class with CustomEvent dispatch
    - Combine WebcamCapture + MediaPipeWrapper
    - Dispatch landmark events or no_hand events
    - _Requirements: 1.3, 1.4, 1.5_

- [x] 8. Checkpoint - All stages integrated
  - Ensure all stage tests pass, ask the user if questions arise.

- [x] 9. Implement UI Shell (GoldenLayout)
  - [x] 9.1 Set up GoldenLayout with default panel configuration
    - Webcam Preview, Target Canvas, Settings, Debug Console
    - _Requirements: 5.1, 5.6_
  - [x] 9.2 Implement WebcamPreview panel
    - Display video feed with landmark overlay
    - _Requirements: 5.6_
  - [x] 9.3 Implement TargetCanvas panel with triple cursor
    - Raw cursor (red), Physics cursor (green), Predictive cursor (blue)
    - Toggle visibility for each
    - Respond to pointer events
    - _Requirements: 5.9, 5.10, 5.11_
  - [x] 9.4 Implement Settings panel with lil-gui
    - All stage configurations
    - Preset buttons (debug, minimal, presentation)
    - _Requirements: 1.6, 2.9, 3.12, 5.8_
  - [x] 9.5 Implement DebugConsole panel
    - Event log with timestamps
    - FSM state indicator
    - Cursor positions table
    - _Requirements: 5.12_
  - [x] 9.6 Implement layout persistence
    - Save to localStorage
    - Load on startup
    - _Requirements: 5.7_

- [x] 10. Implement synthetic data testing infrastructure
  - [x] 10.1 Create SyntheticLandmarkGenerator
    - Generate realistic hand movement sequences
    - Simulate tracking loss (frame drops)
    - Simulate gesture transitions
    - _Requirements: 6.4_
  - [x] 10.2 Write integration tests with synthetic data
    - Frame drop → coast → snap-lock sequence
    - Gesture transition with confidence gaps
    - _Requirements: 6.5, 6.6, 6.7_

- [x] 11. Checkpoint - Full pipeline integration test
  - Ensure end-to-end tests pass, ask the user if questions arise.

- [ ] 12. Mutation testing and final verification
  - [ ] 12.1 Configure Stryker for gesture-monolith
    - Target all stage implementations
    - _Requirements: 6.2_
  - [ ] 12.2 Run mutation testing, achieve 80% score
    - Fix surviving mutants
    - _Requirements: 6.3_
  - [ ] 12.3 Log results to obsidianblackboard.jsonl
    - _Requirements: 6.15_

- [ ] 13. Final checkpoint - Ready for silver promotion
  - All tests pass, mutation score ≥ 80%, ask user for review.

## Notes

- All property-based tests are required (comprehensive testing approach)
- Each property test references its design document property number
- Checkpoints ensure incremental validation
- Code starts in bronze/, promotes to silver/ after verification
