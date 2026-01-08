# W3C Gesture Pointer Vertical Slice

**Date**: 2026-01-06
**Status**: IMPLEMENTATION READY
**TRL**: 8 (Working code exists in P0_GESTURE_MONOLITH)

---

## Mission

Transform webcam hand landmarks into W3C Pointer Events for universal UI control.

```
Webcam → MediaPipe → OneEuro Filter → FSM → W3C PointerEvent
```

---

## Composition of Exemplars (Proven Technology)

| Component | Exemplar | TRL | Status |
|-----------|----------|-----|--------|
| Hand Tracking | @mediapipe/tasks-vision GestureRecognizer | 9 | Production |
| Smoothing | One Euro Filter (CHI 2012) | 9 | Implemented |
| State Machine | XState v5 | 9 | Implemented |
| Event Output | Native PointerEvent API | 9 | Implemented |
| UI Shell | GoldenLayout + lil-gui | 9 | Implemented |

---

## Working Implementation

All code exists and is tested in `hot_obsidian_sandbox/bronze/P0_GESTURE_MONOLITH/`.

### 1. Sensor Stage (MediaPipe)

**File**: `src/stages/sensor/mediapipe-wrapper.ts`

```typescript
import { GestureRecognizer, FilesetResolver } from '@mediapipe/tasks-vision';

// Initialize once
const vision = await FilesetResolver.forVisionTasks(
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
);
const recognizer = await GestureRecognizer.createFromOptions(vision, {
  baseOptions: { modelAssetPath: 'gesture_recognizer.task' },
  runningMode: 'VIDEO',
  numHands: 1,
});

// Per frame
const result = recognizer.recognizeForVideo(videoElement, timestamp);
// Output: 21 landmarks, gesture name, confidence
```

**Output Contract**:
```typescript
interface SensorFrame {
  frameId: number;
  timestamp: number;
  landmarks: Point3D[]; // 21 points
  gesture: 'Open_Palm' | 'Pointing_Up' | 'Closed_Fist' | 'None';
  handedness: 'Left' | 'Right';
  confidence: number; // 0-1
}
```

### 2. Physics Stage (One Euro Filter)

**File**: `src/stages/physics/one-euro-filter.ts`

The One Euro Filter is a velocity-adaptive low-pass filter:
- Slow movement = high smoothing (reduces jitter)
- Fast movement = low smoothing (reduces lag)

```typescript
class OneEuroFilter {
  constructor(config: {
    minCutoff: number;  // 0.5 default - minimum smoothing
    beta: number;       // 0.001 default - speed coefficient
    dcutoff: number;    // 1.0 default - derivative cutoff
  }) {}

  filter(x: number, y: number, timestamp: number): {
    position: { x: number; y: number };
    velocity: { vx: number; vy: number };
  }
}
```

**Key Parameters**:
- `minCutoff = 0.5`: Base smoothing level
- `beta = 0.001`: How much velocity affects smoothing
- `dcutoff = 1.0`: Velocity estimation smoothing

### 3. FSM Stage (XState v5)

**File**: `src/stages/fsm/gesture-fsm.ts`

State machine with anti-Midas safeguards:

```
IDLE ──(Open_Palm + dwell)──▶ ARMED ──(Pointing_Up + dwell)──▶ ENGAGED
  ▲                              │                                │
  └──────────────────────────────┴────────(Open_Palm)─────────────┘
```

**Anti-Midas Safeguards**:
| Safeguard | Implementation |
|-----------|----------------|
| Palm Cone | Only accept gestures when palm faces camera (±45°) |
| Dwell Time | Require gesture held for 80ms before transition |
| Hysteresis | Enter threshold 0.7, exit threshold 0.5 |
| Timeout | Return to IDLE if no hand for 500ms |

**FSM Output**:
```typescript
interface FSMEventDetail {
  state: 'IDLE' | 'ARMED' | 'ENGAGED';
  action: 'NONE' | 'MOVE' | 'DOWN' | 'UP' | 'CANCEL';
  position: { x: number; y: number };
  timestamp: number;
}
```

### 4. Emitter Stage (W3C Pointer Events)

**File**: `src/stages/emitter/pointer-event-factory.ts`

Maps FSM actions to native PointerEvents:

| FSM Action | Pointer Event |
|------------|---------------|
| MOVE | pointermove |
| DOWN | pointerdown |
| UP | pointerup |
| CANCEL | pointercancel |

```typescript
function createPointerEvent(fsmEvent: FSMEventDetail): PointerEvent {
  return new PointerEvent(mapActionToType(fsmEvent.action), {
    clientX: fsmEvent.position.x * viewportWidth,
    clientY: fsmEvent.position.y * viewportHeight,
    pointerId: 1,
    pointerType: 'touch',
    button: fsmEvent.action === 'DOWN' ? 0 : -1,
    buttons: fsmEvent.state === 'ENGAGED' ? 1 : 0,
    pressure: fsmEvent.state === 'ENGAGED' ? 0.5 : 0,
    isPrimary: true,
    bubbles: true,
    cancelable: true,
  });
}
```

---

## Quick Start

```bash
cd hot_obsidian_sandbox/bronze/P0_GESTURE_MONOLITH
npm install
npm run dev
# Open http://localhost:5173?demo=true
```

---

## Next Steps (Thin Slice)

### Option A: Deploy Demo (1 day)
1. `npm run build`
2. Deploy to Vercel/Netlify
3. Share URL for feedback

### Option B: Add Drawing (3 days)
1. Add canvas drawing on pointerdown/pointermove
2. Add color picker via lil-gui
3. Test with real webcam

### Option C: Add Voice (1 week)
1. Add Web Speech API
2. Parse "pen", "eraser", "clear" commands
3. Wire to canvas tool selection

---

## Key Files

| File | Purpose |
|------|---------|
| `src/app.ts` | Main app wiring |
| `src/stages/sensor/sensor-stage.ts` | MediaPipe wrapper |
| `src/stages/physics/one-euro-filter.ts` | Smoothing filter |
| `src/stages/fsm/gesture-fsm.ts` | XState state machine |
| `src/stages/emitter/emitter-stage.ts` | PointerEvent dispatch |
| `src/contracts/schemas.ts` | Zod contracts |

---

## References

- [One Euro Filter Paper (CHI 2012)](http://cristal.univ-lille.fr/~casiez/1euro/)
- [MediaPipe Gesture Recognizer](https://ai.google.dev/edge/mediapipe/solutions/vision/gesture_recognizer)
- [W3C Pointer Events Level 3](https://www.w3.org/TR/pointerevents3/)
- [XState v5 Documentation](https://stately.ai/docs)
