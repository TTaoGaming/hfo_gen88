/**
 * 🎯 GESTURE FSM (XState)
 * 
 * State machine for gesture intent with anti-Midas safeguards.
 * States: IDLE → ARMED → ENGAGED
 * 
 * @provenance .kiro/specs/gesture-pointer-monolith/design.md
 * 
 * Property 6: Gesture vocabulary constraint
 * Property 7: Dwell time gates state transitions
 * Property 8: Hysteresis prevents oscillation
 * Property 10: State transitions emit correct pointer events
 * 
 * Validates: Requirements 3.1-3.12
 */

import { createMachine, createActor, assign } from 'xstate';
import type {
  FSMState,
  FSMAction,
  GestureName,
  FSMStageConfig,
  Point2D,
} from '../../contracts/schemas.js';
import { FSMStageConfigSchema } from '../../contracts/schemas.js';

// Valid gestures for state transitions
const VALID_GESTURES = new Set<GestureName>(['Open_Palm', 'Pointing_Up']);

export interface GestureFSMContext {
  position: Point2D;
  gesture: GestureName;
  confidence: number;
  palmAngle: number;
  dwellStartTime: number | null;
  lastActiveTime: number;
  config: FSMStageConfig;
}

export type GestureFSMEvent =
  | { type: 'GESTURE_UPDATE'; gesture: GestureName; confidence: number; palmAngle: number; position: Point2D; timestamp: number }
  | { type: 'NO_HAND'; timestamp: number }
  | { type: 'TICK'; timestamp: number };

export interface GestureFSMOutput {
  state: FSMState;
  action: FSMAction;
  position: Point2D;
}

/**
 * Check if gesture is in valid vocabulary
 */
function isValidGesture(gesture: GestureName): boolean {
  return VALID_GESTURES.has(gesture);
}

/**
 * Check if palm is within cone angle
 */
function isInCone(palmAngle: number, coneAngle: number): boolean {
  return Math.abs(palmAngle) <= coneAngle / 2;
}

/**
 * Check if confidence meets threshold (with hysteresis)
 */
function meetsThreshold(
  confidence: number,
  enterThreshold: number,
  exitThreshold: number,
  isEntering: boolean
): boolean {
  return isEntering ? confidence >= enterThreshold : confidence >= exitThreshold;
}

/**
 * Check if dwell time has elapsed
 */
function dwellElapsed(
  dwellStartTime: number | null,
  currentTime: number,
  dwellTime: number
): boolean {
  if (dwellStartTime === null) return false;
  return (currentTime - dwellStartTime) >= dwellTime;
}

/**
 * Create the gesture FSM machine
 */
export function createGestureMachine(config: Partial<FSMStageConfig> = {}) {
  const validatedConfig = FSMStageConfigSchema.parse(config);

  return createMachine({
    id: 'gestureFSM',
    initial: 'IDLE',
    context: {
      position: { x: 0.5, y: 0.5 },
      gesture: 'None' as GestureName,
      confidence: 0,
      palmAngle: 0,
      dwellStartTime: null,
      lastActiveTime: Date.now(),
      config: validatedConfig,
    } satisfies GestureFSMContext,
    states: {
      IDLE: {
        entry: assign({ dwellStartTime: null }),
        on: {
          GESTURE_UPDATE: [
            {
              // Transition to ARMED if Open_Palm in cone with confidence
              guard: ({ event, context }) =>
                event.gesture === 'Open_Palm' &&
                isInCone(event.palmAngle, context.config.coneAngle) &&
                meetsThreshold(event.confidence, context.config.enterThreshold, context.config.exitThreshold, true),
              target: 'ARMED_DWELL',
              actions: assign({
                position: ({ event }) => event.position,
                gesture: ({ event }) => event.gesture,
                confidence: ({ event }) => event.confidence,
                palmAngle: ({ event }) => event.palmAngle,
                dwellStartTime: ({ event }) => event.timestamp,
                lastActiveTime: ({ event }) => event.timestamp,
              }),
            },
            {
              // Stay in IDLE, update context
              actions: assign({
                position: ({ event }) => event.position,
                gesture: ({ event }) => event.gesture,
                confidence: ({ event }) => event.confidence,
                palmAngle: ({ event }) => event.palmAngle,
                lastActiveTime: ({ event }) => event.timestamp,
              }),
            },
          ],
          NO_HAND: {
            // Stay in IDLE
          },
        },
      },
      ARMED_DWELL: {
        // Waiting for dwell time before transitioning to ARMED
        on: {
          GESTURE_UPDATE: [
            {
              // Dwell complete, transition to ARMED
              guard: ({ event, context }) =>
                event.gesture === 'Open_Palm' &&
                isInCone(event.palmAngle, context.config.coneAngle) &&
                meetsThreshold(event.confidence, context.config.enterThreshold, context.config.exitThreshold, false) &&
                dwellElapsed(context.dwellStartTime, event.timestamp, context.config.dwellTime),
              target: 'ARMED',
              actions: assign({
                position: ({ event }) => event.position,
                gesture: ({ event }) => event.gesture,
                confidence: ({ event }) => event.confidence,
                palmAngle: ({ event }) => event.palmAngle,
                lastActiveTime: ({ event }) => event.timestamp,
                dwellStartTime: null,
              }),
            },
            {
              // Still dwelling, update context
              guard: ({ event, context }) =>
                event.gesture === 'Open_Palm' &&
                isInCone(event.palmAngle, context.config.coneAngle) &&
                meetsThreshold(event.confidence, context.config.enterThreshold, context.config.exitThreshold, false),
              actions: assign({
                position: ({ event }) => event.position,
                gesture: ({ event }) => event.gesture,
                confidence: ({ event }) => event.confidence,
                palmAngle: ({ event }) => event.palmAngle,
                lastActiveTime: ({ event }) => event.timestamp,
              }),
            },
            {
              // Gesture changed or left cone, back to IDLE
              target: 'IDLE',
              actions: assign({
                dwellStartTime: null,
              }),
            },
          ],
          NO_HAND: {
            target: 'IDLE',
            actions: assign({ dwellStartTime: null }),
          },
        },
      },
      ARMED: {
        // Tracking mode - emit pointermove
        entry: assign({ dwellStartTime: null }),
        on: {
          GESTURE_UPDATE: [
            {
              // Pointing_Up detected, start dwell for ENGAGED
              guard: ({ event, context }) =>
                event.gesture === 'Pointing_Up' &&
                isInCone(event.palmAngle, context.config.coneAngle) &&
                meetsThreshold(event.confidence, context.config.enterThreshold, context.config.exitThreshold, true),
              target: 'ENGAGED_DWELL',
              actions: assign({
                position: ({ event }) => event.position,
                gesture: ({ event }) => event.gesture,
                confidence: ({ event }) => event.confidence,
                palmAngle: ({ event }) => event.palmAngle,
                dwellStartTime: ({ event }) => event.timestamp,
                lastActiveTime: ({ event }) => event.timestamp,
              }),
            },
            {
              // Still Open_Palm in cone, stay ARMED
              guard: ({ event, context }) =>
                event.gesture === 'Open_Palm' &&
                isInCone(event.palmAngle, context.config.coneAngle) &&
                meetsThreshold(event.confidence, context.config.enterThreshold, context.config.exitThreshold, false),
              actions: assign({
                position: ({ event }) => event.position,
                gesture: ({ event }) => event.gesture,
                confidence: ({ event }) => event.confidence,
                palmAngle: ({ event }) => event.palmAngle,
                lastActiveTime: ({ event }) => event.timestamp,
              }),
            },
            {
              // Palm left cone or invalid gesture, back to IDLE
              target: 'IDLE',
            },
          ],
          NO_HAND: [
            {
              // Check timeout
              guard: ({ event, context }) =>
                (event.timestamp - context.lastActiveTime) > context.config.timeout,
              target: 'IDLE',
            },
            {
              // Within timeout, stay ARMED
            },
          ],
        },
      },
      ENGAGED_DWELL: {
        // Waiting for dwell time before transitioning to ENGAGED
        on: {
          GESTURE_UPDATE: [
            {
              // Dwell complete, transition to ENGAGED (pointerdown)
              guard: ({ event, context }) =>
                event.gesture === 'Pointing_Up' &&
                isInCone(event.palmAngle, context.config.coneAngle) &&
                meetsThreshold(event.confidence, context.config.enterThreshold, context.config.exitThreshold, false) &&
                dwellElapsed(context.dwellStartTime, event.timestamp, context.config.dwellTime),
              target: 'ENGAGED',
              actions: assign({
                position: ({ event }) => event.position,
                gesture: ({ event }) => event.gesture,
                confidence: ({ event }) => event.confidence,
                palmAngle: ({ event }) => event.palmAngle,
                lastActiveTime: ({ event }) => event.timestamp,
                dwellStartTime: null,
              }),
            },
            {
              // Still dwelling
              guard: ({ event, context }) =>
                event.gesture === 'Pointing_Up' &&
                isInCone(event.palmAngle, context.config.coneAngle) &&
                meetsThreshold(event.confidence, context.config.enterThreshold, context.config.exitThreshold, false),
              actions: assign({
                position: ({ event }) => event.position,
                gesture: ({ event }) => event.gesture,
                confidence: ({ event }) => event.confidence,
                palmAngle: ({ event }) => event.palmAngle,
                lastActiveTime: ({ event }) => event.timestamp,
              }),
            },
            {
              // Gesture changed, back to ARMED
              guard: ({ event, context }) =>
                event.gesture === 'Open_Palm' &&
                isInCone(event.palmAngle, context.config.coneAngle),
              target: 'ARMED',
              actions: assign({ dwellStartTime: null }),
            },
            {
              // Invalid, back to IDLE
              target: 'IDLE',
              actions: assign({ dwellStartTime: null }),
            },
          ],
          NO_HAND: {
            target: 'ARMED',
            actions: assign({ dwellStartTime: null }),
          },
        },
      },
      ENGAGED: {
        // Click/drag mode - emit pointermove (drag)
        entry: assign({ dwellStartTime: null }),
        on: {
          GESTURE_UPDATE: [
            {
              // Open_Palm detected, transition to ARMED (pointerup)
              guard: ({ event, context }) =>
                event.gesture === 'Open_Palm' &&
                isInCone(event.palmAngle, context.config.coneAngle) &&
                meetsThreshold(event.confidence, context.config.enterThreshold, context.config.exitThreshold, false),
              target: 'ARMED',
              actions: assign({
                position: ({ event }) => event.position,
                gesture: ({ event }) => event.gesture,
                confidence: ({ event }) => event.confidence,
                palmAngle: ({ event }) => event.palmAngle,
                lastActiveTime: ({ event }) => event.timestamp,
              }),
            },
            {
              // Still Pointing_Up, stay ENGAGED
              guard: ({ event, context }) =>
                event.gesture === 'Pointing_Up' &&
                isInCone(event.palmAngle, context.config.coneAngle) &&
                meetsThreshold(event.confidence, context.config.enterThreshold, context.config.exitThreshold, false),
              actions: assign({
                position: ({ event }) => event.position,
                gesture: ({ event }) => event.gesture,
                confidence: ({ event }) => event.confidence,
                palmAngle: ({ event }) => event.palmAngle,
                lastActiveTime: ({ event }) => event.timestamp,
              }),
            },
            {
              // Palm left cone, back to IDLE (pointercancel)
              target: 'IDLE',
            },
          ],
          NO_HAND: [
            {
              // Timeout, back to IDLE (pointercancel)
              guard: ({ event, context }) =>
                (event.timestamp - context.lastActiveTime) > context.config.timeout,
              target: 'IDLE',
            },
            {
              // Within timeout, stay ENGAGED
            },
          ],
        },
      },
    },
  });
}

/**
 * GestureFSM wrapper class for easier usage
 */
export class GestureFSM {
  private machine;
  private actor;
  private previousState: FSMState = 'IDLE';
  private config: FSMStageConfig;

  constructor(config: Partial<FSMStageConfig> = {}) {
    this.config = FSMStageConfigSchema.parse(config);
    this.machine = createGestureMachine(this.config);
    this.actor = createActor(this.machine);
    this.actor.start();
  }

  /**
   * Process gesture update and return FSM output
   */
  update(
    gesture: GestureName,
    confidence: number,
    palmAngle: number,
    position: Point2D,
    timestamp: number
  ): GestureFSMOutput {
    const prevState = this.getState();
    
    this.actor.send({
      type: 'GESTURE_UPDATE',
      gesture,
      confidence,
      palmAngle,
      position,
      timestamp,
    });

    const newState = this.getState();
    const action = this.determineAction(prevState, newState);
    
    this.previousState = newState;

    return {
      state: newState,
      action,
      position: this.actor.getSnapshot().context.position,
    };
  }

  /**
   * Process no_hand event
   */
  noHand(timestamp: number): GestureFSMOutput {
    const prevState = this.getState();
    
    this.actor.send({ type: 'NO_HAND', timestamp });

    const newState = this.getState();
    const action = this.determineAction(prevState, newState);
    
    this.previousState = newState;

    return {
      state: newState,
      action,
      position: this.actor.getSnapshot().context.position,
    };
  }

  /**
   * Determine action based on state transition
   */
  private determineAction(prevState: FSMState, newState: FSMState): FSMAction {
    // Map internal states to external states
    const mapState = (s: string): FSMState => {
      if (s === 'ARMED_DWELL') return 'IDLE';
      if (s === 'ENGAGED_DWELL') return 'ARMED';
      return s as FSMState;
    };

    const prev = mapState(prevState);
    const next = mapState(newState);

    // State transition actions
    if (prev === 'ARMED' && next === 'ENGAGED') return 'DOWN';
    if (prev === 'ENGAGED' && next === 'ARMED') return 'UP';
    if ((prev === 'ARMED' || prev === 'ENGAGED') && next === 'IDLE') return 'CANCEL';
    
    // Movement actions
    if (next === 'ARMED' || next === 'ENGAGED') return 'MOVE';
    
    return 'NONE';
  }

  /**
   * Get current state
   */
  getState(): FSMState {
    const snapshot = this.actor.getSnapshot();
    const value = snapshot.value as string;
    
    // Map internal states to external states
    if (value === 'ARMED_DWELL') return 'IDLE';
    if (value === 'ENGAGED_DWELL') return 'ARMED';
    return value as FSMState;
  }

  /**
   * Get raw internal state (for debugging)
   */
  getInternalState(): string {
    return this.actor.getSnapshot().value as string;
  }

  /**
   * Get context
   */
  getContext(): GestureFSMContext {
    return this.actor.getSnapshot().context;
  }

  /**
   * Reset FSM to IDLE
   */
  reset(): void {
    this.actor.stop();
    this.actor = createActor(this.machine);
    this.actor.start();
    this.previousState = 'IDLE';
  }

  /**
   * Update configuration (requires reset)
   */
  configure(config: Partial<FSMStageConfig>): void {
    this.config = FSMStageConfigSchema.parse({ ...this.config, ...config });
    this.machine = createGestureMachine(this.config);
    this.reset();
  }
}
