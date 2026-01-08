/**
 * 🎯 GESTURE POINTER MONOLITH
 * 
 * W3C Pointer Level 3 gesture input pipeline.
 * Webcam → MediaPipe → OneEuro → Rapier2D → FSM → W3C Pointer
 * 
 * @provenance .kiro/specs/gesture-pointer-monolith/
 */

// Contracts
export * from './contracts/index.js';

// Physics Stage
export {
  OneEuroFilter,
  PhysicsCursor,
  PhysicsStage,
  RAPIER,
} from './stages/physics/index.js';
export type {
  OneEuroFilterConfig,
  OneEuroFilterResult,
  PhysicsCursorConfig,
  PhysicsCursorState,
} from './stages/physics/index.js';

// FSM Stage
export {
  GestureFSM,
  createGestureMachine,
  calculatePalmAngle,
  isInCone,
  validatePalmCone,
  FSMStage,
} from './stages/fsm/index.js';
export type {
  GestureFSMContext,
  GestureFSMEvent,
  GestureFSMOutput,
} from './stages/fsm/index.js';

// Emitter Stage
export {
  PointerEventFactory,
  mapActionToEventType,
  scaleToViewport,
  createPointerEventData,
  toNativePointerEvent,
  EmitterStage,
} from './stages/emitter/index.js';

// Sensor Stage
export {
  WebcamCapture,
  MediaPipeWrapper,
  MockMediaPipeWrapper,
  SensorStage,
} from './stages/sensor/index.js';
export type {
  WebcamCaptureConfig,
  MediaPipeWrapperConfig,
} from './stages/sensor/index.js';

// Testing utilities
export {
  SyntheticLandmarkGenerator,
  generateLandmarksAtPosition,
  generateMovementSequence,
} from './testing/index.js';
