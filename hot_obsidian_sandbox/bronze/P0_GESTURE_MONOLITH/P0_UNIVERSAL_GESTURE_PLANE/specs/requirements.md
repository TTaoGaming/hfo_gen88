# Requirements: Universal Gesture Control Plane

## REQ-001: Smoothing
The system SHALL apply a OneEuroFilter to raw MediaPipe landmarks to reduce jitter.

## REQ-002: Physics-based Persistence
The system SHALL use a Rapier2D rigid body with spring-damping to track the smoothed landmark.

## REQ-003: Coasting
WHEN tracking is lost, THE physics cursor SHALL continue with its last velocity (inertia).

## REQ-004: Predictive Cursor
The system SHALL calculate a predictive position based on the current physics velocity and a lookahead time (default 50ms).

## REQ-005: FSM Gesture Logic
The system SHALL use a finite state machine to distinguish between HOVER, CLICK (pinch), and DRAG.

## REQ-006: W3C Pointer Events
The system SHALL emit W3C Pointer Events (pointermove, pointerdown, pointerup) that comply with the Level 3 specification.
