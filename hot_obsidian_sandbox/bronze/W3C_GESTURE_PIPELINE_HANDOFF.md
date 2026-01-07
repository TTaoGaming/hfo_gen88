---
generation: 89
topic: W3C Gesture Control Pipeline
status: HANDOFF
created: 2026-01-06
---

# W3C Gesture Control Pipeline Handoff

> **Goal**: Webcam → MediaPipe → Physics Smoothing → FSM (Anti-Midas) → W3C Pointer Events

---

## §0 PIPELINE OVERVIEW

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   WEBCAM    │───▶│  MEDIAPIPE  │───▶│   PHYSICS   │───▶│     FSM     │───▶│   EMITTER   │
│   (Video)   │    │ (Landmarks) │    │ (Smoothing) │    │ (Anti-Midas)│    │ (W3C Ptr)   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
     Port 0             Port 0            Port 2             Port 7            Port 3
     OBSERVE            OBSERVE           SHAPE              NAVIGATE          INJECT
```

### The 5 Stages

| Stage | Input | Output | Key Tech |
|:------|:------|:-------|:---------|
| **Sensor** | Video frame | 21 landmarks + gesture | MediaPipe GestureRecognizer |
| **Physics** | Raw landmarks | Smoothed position + velocity | One Euro + Rapier2D |
| **FSM** | Smoothed + gesture | State + action | XState (IDLE→ARMED→ENGAGED) |
| **Emitter** | FSM action | W3C PointerEvent | Native DOM events |
| **UI Shell** | Events | Visual feedback | GoldenLayout + lil-gui |

---

## §1 UI SUBSTRATE (GoldenLayout + lil-gui)

> **Why**: Don't custom-code sliders and panels. Use battle-tested UI libraries.

### GoldenLayout Shell

```typescript
// Dockable panel system - saves layout to localStorage
import { GoldenLayout, LayoutConfig } from 'golden-layout';

const DEFAULT_LAYOUT: LayoutConfig = {
  root: {
    type: 'row',
    content: [
      { type: 'component', componentType: 'target-canvas', title: '🎯 Canvas', width: 70 },
      { type: 'column', width: 30, content: [
        { type: 'component', componentType: 'webcam-preview', title: '📹 Webcam' },
        { type: 'component', componentType: 'settings-panel', title: '⚙️ Settings' },
      ]},
    ],
  },
};

// Register panels, load layout, auto-save on change
shell.registerPanel('target-canvas', canvasFactory);
shell.registerPanel('settings-panel', settingsFactory);
shell.init();
```

### lil-gui for Settings

```typescript
import GUI from 'lil-gui';

const gui = new GUI({ title: 'Gesture Settings' });
const physicsFolder = gui.addFolder('Physics');
physicsFolder.add(config, 'stiffness', 1, 200);
physicsFolder.add(config, 'damping', 0.1, 20);
physicsFolder.add(config, 'minCutoff', 0.01, 10);
physicsFolder.add(config, 'beta', 0, 1);

const fsmFolder = gui.addFolder('FSM');
fsmFolder.add(config, 'dwellTime', 0, 1000);
fsmFolder.add(config, 'coneAngle', 0, 90);
```

### Key Insight
- GoldenLayout handles panel docking, resizing, persistence
- lil-gui handles sliders, checkboxes, dropdowns
- You just wire them to your config objects

---

## §2 SENSOR STAGE (MediaPipe)

> **Input**: Video frame | **Output**: 21 landmarks + gesture name + confidence

### MediaPipe GestureRecognizer

```typescript
import { GestureRecognizer, FilesetResolver } from '@mediapipe/tasks-vision';

const vision = await FilesetResolver.forVisionTasks(
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
);

const recognizer = await GestureRecognizer.createFromOptions(vision, {
  baseOptions: { modelAssetPath: 'gesture_recognizer.task' },
  runningMode: 'VIDEO',
  numHands: 1,
});

// Process frame
const result = recognizer.recognizeForVideo(videoElement, timestamp);
// result.landmarks[0] = 21 points, result.gestures[0][0].categoryName = 'Open_Palm'
```

### Landmark Constants

```typescript
const LANDMARK = {
  WRIST: 0,
  INDEX_TIP: 8,    // Primary cursor point
  MIDDLE_MCP: 9,   // For palm angle calculation
  // ... 21 total
};
```

### Output Contract

```typescript
const SensorFrameSchema = z.object({
  frameId: z.number(),
  timestamp: z.number(),
  landmarks: z.array(Point3DSchema).length(21),
  gesture: z.enum(['Open_Palm', 'Pointing_Up', 'Closed_Fist', 'None', ...]),
  handedness: z.enum(['Left', 'Right']),
  confidence: z.number().min(0).max(1),
});
```

---

## §3 PHYSICS STAGE (Smoothing + Prediction)

> **Input**: Raw landmarks | **Output**: Smoothed position + velocity + prediction

### One Euro Filter (Smoothing)

```typescript
// Velocity-adaptive low-pass filter (CHI 2012)
// Smooth when slow, responsive when fast
class OneEuroFilter {
  constructor(
    minCutoff = 1.0,  // Minimum cutoff frequency
    beta = 0.007,      // Speed coefficient
    dcutoff = 1.0      // Derivative cutoff
  ) {}

  filter(x: number, y: number, timestamp: number): {
    x: number;   // Smoothed X
    y: number;   // Smoothed Y
    vx: number;  // Velocity X
    vy: number;  // Velocity Y
  }
}
```

### Rapier2D Physics (Coasting + Snap-Lock)

```typescript
import RAPIER from '@dimforge/rapier2d-compat';

class PhysicsCursor {
  // Spring-damped cursor with inertia
  constructor(config: {
    stiffness: number;        // Spring constant (50)
    damping: number;          // Damping coefficient (5)
    snapLockThreshold: number; // Distance to trigger snap (0.1)
  }) {}

  setTarget(x: number, y: number): void;  // Update target (ends coasting)
  startCoasting(timestamp: number): void;  // Enter inertia mode
  step(dt: number): PhysicsCursorState;    // Advance simulation

  // Predictive position (Kalman-like extrapolation)
  getPredictivePosition(lookahead: number = 0.05): Point2D {
    return {
      x: pos.x + vel.vx * lookahead,
      y: pos.y + vel.vy * lookahead,
    };
  }
}
```

### Key Behaviors

| Behavior | Description |
|:---------|:------------|
| **Coasting** | When hand lost, cursor continues on inertia (no jump) |
| **Snap-Lock** | When hand returns, blend 70% toward new position |
| **Prediction** | Extrapolate 50ms ahead to reduce perceived latency |

---

## §4 FSM STAGE (Anti-Midas Touch)

> **Input**: Smoothed position + gesture | **Output**: State + action

### State Machine (XState)

```
IDLE ──(Open_Palm in cone + dwell)──▶ ARMED ──(Pointing_Up + dwell)──▶ ENGAGED
  ▲                                      │                                 │
  │                                      │                                 │
  └──────────(palm leaves cone)──────────┴────────(Open_Palm)──────────────┘
```

### Anti-Midas Safeguards

| Safeguard | Implementation |
|:----------|:---------------|
| **Palm Cone** | Only accept gestures when palm faces camera (±45°) |
| **Dwell Time** | Require gesture held for N ms before transition |
| **Hysteresis** | Different thresholds for enter (0.7) vs exit (0.5) |
| **Timeout** | Return to IDLE if no hand for N ms |
| **Gesture Vocabulary** | Only Open_Palm and Pointing_Up trigger transitions |

### Palm Cone Calculation

```typescript
function calculatePalmAngle(landmarks: Point3D[]): number {
  const wrist = landmarks[0];
  const middleMcp = landmarks[9];
  
  // Palm normal: wrist → middle_mcp
  const palmNormal = {
    x: middleMcp.x - wrist.x,
    y: middleMcp.y - wrist.y,
    z: middleMcp.z - wrist.z,
  };
  
  // Angle from camera normal (0,0,-1)
  const dot = -palmNormal.z;
  const mag = Math.sqrt(palmNormal.x**2 + palmNormal.y**2 + palmNormal.z**2);
  return Math.acos(dot / mag) * (180 / Math.PI);
}

function isInCone(palmAngle: number, coneAngle: number = 45): boolean {
  return palmAngle <= coneAngle;
}
```

### FSM Output Contract

```typescript
const FSMEventDetailSchema = z.object({
  state: z.enum(['IDLE', 'ARMED', 'ENGAGED']),
  action: z.enum(['NONE', 'MOVE', 'DOWN', 'UP', 'CANCEL']),
  position: Point2DSchema,
  timestamp: z.number(),
});
```

---

## §5 EMITTER STAGE (W3C Pointer Events)

> **Input**: FSM action | **Output**: Native PointerEvent

### Action → Event Mapping

| FSM Action | Pointer Event |
|:-----------|:--------------|
| MOVE | `pointermove` |
| DOWN | `pointerdown` |
| UP | `pointerup` |
| CANCEL | `pointercancel` |

### W3C PointerEvent Contract

```typescript
const PointerEventDataSchema = z.object({
  type: z.enum(['pointermove', 'pointerdown', 'pointerup', 'pointercancel']),
  clientX: z.number(),
  clientY: z.number(),
  pointerId: z.literal(1),
  pointerType: z.literal('touch'),  // or 'hand'
  button: z.number(),
  buttons: z.number(),
  pressure: z.number().min(0).max(1),
  isPrimary: z.literal(true),
});
```

### Emitter Implementation

```typescript
function emitPointerEvent(target: HTMLElement, data: PointerEventData): void {
  const event = new PointerEvent(data.type, {
    clientX: data.clientX,
    clientY: data.clientY,
    pointerId: data.pointerId,
    pointerType: data.pointerType,
    button: data.button,
    buttons: data.buttons,
    pressure: data.pressure,
    isPrimary: data.isPrimary,
    bubbles: true,
    cancelable: true,
  });
  target.dispatchEvent(event);
}
```

### Key Insight
- Any W3C-compliant consumer (buttons, sliders, canvas) just works
- No custom event handling needed in consumer code
- Standard `addEventListener('pointerdown', ...)` works

---

## §6 INTER-STAGE COMMUNICATION

> **Pattern**: CustomEvents with Zod-validated payloads

### Event Bus

```typescript
// Stages communicate via CustomEvents on a shared EventTarget
const eventBus = new EventTarget();

// Sensor emits landmarks
eventBus.dispatchEvent(new CustomEvent('gesture:landmark', {
  detail: LandmarkEventDetailSchema.parse(data)
}));

// Physics listens and emits cursor
eventBus.addEventListener('gesture:landmark', (e) => {
  const smoothed = physics.process(e.detail);
  eventBus.dispatchEvent(new CustomEvent('gesture:cursor', {
    detail: CursorEventDetailSchema.parse(smoothed)
  }));
});

// FSM listens and emits actions
eventBus.addEventListener('gesture:cursor', (e) => {
  const action = fsm.update(e.detail);
  eventBus.dispatchEvent(new CustomEvent('gesture:fsm', {
    detail: FSMEventDetailSchema.parse(action)
  }));
});
```

### Event Types

| Event | Payload | Emitter |
|:------|:--------|:--------|
| `gesture:landmark` | LandmarkEventDetail | Sensor |
| `gesture:nohand` | NoHandEventDetail | Sensor |
| `gesture:cursor` | CursorEventDetail | Physics |
| `gesture:fsm` | FSMEventDetail | FSM |

---

## §7 BOOTSTRAP CHECKLIST

### Phase 0: UI Substrate
- [ ] Install GoldenLayout: `npm i golden-layout`
- [ ] Install lil-gui: `npm i lil-gui`
- [ ] Create shell with 4 panels: canvas, webcam, settings, debug
- [ ] Wire lil-gui to config objects

### Phase 1: Sensor Stage
- [ ] Install MediaPipe: `npm i @mediapipe/tasks-vision`
- [ ] Create WebcamCapture (getUserMedia)
- [ ] Create MediaPipeWrapper (GestureRecognizer)
- [ ] Emit `gesture:landmark` events

### Phase 2: Physics Stage
- [ ] Install Rapier: `npm i @dimforge/rapier2d-compat`
- [ ] Implement OneEuroFilter
- [ ] Implement PhysicsCursor with coasting/snap-lock
- [ ] Emit `gesture:cursor` events

### Phase 3: FSM Stage
- [ ] Install XState: `npm i xstate`
- [ ] Implement GestureFSM (IDLE→ARMED→ENGAGED)
- [ ] Implement palm cone validation
- [ ] Emit `gesture:fsm` events

### Phase 4: Emitter Stage
- [ ] Map FSM actions to PointerEvent types
- [ ] Scale normalized coords to viewport
- [ ] Dispatch native PointerEvents to target

### Phase 5: Integration
- [ ] Wire all stages via event bus
- [ ] Add debug visualization (cursor trail, state indicator)
- [ ] Test with standard UI components (buttons, sliders)

---

## §8 KEY CONTRACTS (Copy-Paste Ready)

```typescript
import { z } from 'zod';

// Shared primitives
export const Point2DSchema = z.object({ x: z.number(), y: z.number() });
export const Point3DSchema = z.object({ x: z.number(), y: z.number(), z: z.number() });
export const Velocity2DSchema = z.object({ vx: z.number(), vy: z.number() });

// Sensor output
export const LandmarkEventDetailSchema = z.object({
  landmarks: z.array(Point3DSchema).length(21),
  gesture: z.enum(['Open_Palm', 'Pointing_Up', 'Closed_Fist', 'None']),
  confidence: z.number().min(0).max(1),
  palmAngle: z.number().min(0).max(180),
  timestamp: z.number(),
});

// Physics output
export const CursorEventDetailSchema = z.object({
  raw: Point2DSchema,
  physics: Point2DSchema,
  predictive: Point2DSchema,
  velocity: Velocity2DSchema,
  isCoasting: z.boolean(),
  timestamp: z.number(),
});

// FSM output
export const FSMEventDetailSchema = z.object({
  state: z.enum(['IDLE', 'ARMED', 'ENGAGED']),
  action: z.enum(['NONE', 'MOVE', 'DOWN', 'UP', 'CANCEL']),
  position: Point2DSchema,
  timestamp: z.number(),
});

// Emitter output (W3C compliant)
export const PointerEventDataSchema = z.object({
  type: z.enum(['pointermove', 'pointerdown', 'pointerup', 'pointercancel']),
  clientX: z.number(),
  clientY: z.number(),
  pointerId: z.number(),
  pointerType: z.enum(['mouse', 'pen', 'touch', 'hand']),
  button: z.number(),
  buttons: z.number(),
  pressure: z.number().min(0).max(1),
  isPrimary: z.boolean(),
});
```

---

## §9 EXISTING CODE LOCATIONS

| Component | Path | Status |
|:----------|:-----|:-------|
| GoldenLayout Shell | `P0_GESTURE_MONOLITH/src/ui/golden-layout-shell.ts` | ✅ Working |
| Contracts/Schemas | `P0_GESTURE_MONOLITH/src/contracts/schemas.ts` | ✅ Working |
| One Euro Filter | `P0_GESTURE_MONOLITH/src/stages/physics/one-euro-filter.ts` | ✅ Working |
| Physics Cursor | `P0_GESTURE_MONOLITH/src/stages/physics/physics-cursor.ts` | ✅ Working |
| Gesture FSM | `P0_GESTURE_MONOLITH/src/stages/fsm/gesture-fsm.ts` | ✅ Working |
| Palm Cone | `P0_GESTURE_MONOLITH/src/stages/fsm/palm-cone.ts` | ✅ Working |
| Pointer Factory | `P0_GESTURE_MONOLITH/src/stages/emitter/pointer-event-factory.ts` | ✅ Working |
| MediaPipe Wrapper | `P0_GESTURE_MONOLITH/src/stages/sensor/mediapipe-wrapper.ts` | ✅ Working |

---

*"The pipeline is the product. Each stage is a contract."*
