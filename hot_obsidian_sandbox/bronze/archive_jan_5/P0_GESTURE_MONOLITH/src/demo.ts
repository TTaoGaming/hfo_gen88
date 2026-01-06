/**
 * 🎯 GESTURE POINTER MONOLITH - DEMO
 * 
 * Interactive demo with synthetic data for Playwright testing.
 */

import { PhysicsStage } from './stages/physics/physics-stage.js';
import { FSMStage } from './stages/fsm/fsm-stage.js';
import { EmitterStage } from './stages/emitter/emitter-stage.js';
import { SyntheticLandmarkGenerator } from './testing/synthetic-landmark-generator.js';
import type { CursorEventDetail, FSMEventDetail, LandmarkEventDetail } from './contracts/schemas.js';

// DOM elements
const canvas = document.getElementById('target-canvas') as HTMLDivElement;
const rawCursor = document.getElementById('cursor-raw') as HTMLDivElement;
const physicsCursor = document.getElementById('cursor-physics') as HTMLDivElement;
const predictiveCursor = document.getElementById('cursor-predictive') as HTMLDivElement;
const debugPanel = document.getElementById('debug-panel') as HTMLDivElement;
const btnDemo = document.getElementById('btn-demo') as HTMLButtonElement;
const btnReset = document.getElementById('btn-reset') as HTMLButtonElement;

// Create debug panel content
debugPanel.innerHTML = `
  <style>
    #debug-panel {
      width: 300px;
      background: #16213e;
      border-radius: 8px;
      padding: 1rem;
    }
    #fsm-state {
      padding: 0.5rem;
      margin: 0.5rem 0;
      background: #0f3460;
      border-radius: 4px;
      text-align: center;
      font-weight: bold;
      font-size: 1.2rem;
    }
    .state-IDLE { color: #888; }
    .state-ARMED { color: #0ff; }
    .state-ENGAGED { color: #0f0; }
    #event-log {
      height: 200px;
      overflow-y: auto;
      background: #0f0f23;
      padding: 0.5rem;
      font-family: monospace;
      font-size: 0.75rem;
      border-radius: 4px;
      margin-top: 0.5rem;
    }
    .log-entry { margin: 2px 0; }
    .log-move { color: #666; }
    .log-down { color: #0f0; }
    .log-up { color: #f80; }
    .log-cancel { color: #f00; }
    #cursor-info {
      font-size: 0.8rem;
      margin-top: 0.5rem;
      padding: 0.5rem;
      background: #0f0f23;
      border-radius: 4px;
    }
  </style>
  <h3>FSM State</h3>
  <div id="fsm-state" class="state-IDLE">IDLE</div>
  <div id="cursor-info">
    <div>Raw: <span id="pos-raw">-</span></div>
    <div>Physics: <span id="pos-physics">-</span></div>
    <div>Predictive: <span id="pos-predictive">-</span></div>
  </div>
  <h3 style="margin-top: 1rem;">Event Log</h3>
  <div id="event-log"></div>
`;

const fsmStateEl = document.getElementById('fsm-state') as HTMLDivElement;
const eventLog = document.getElementById('event-log') as HTMLDivElement;
const posRaw = document.getElementById('pos-raw') as HTMLSpanElement;
const posPhysics = document.getElementById('pos-physics') as HTMLSpanElement;
const posPredictive = document.getElementById('pos-predictive') as HTMLSpanElement;

// Initialize stages
const eventTarget = new EventTarget();
let physicsStage: PhysicsStage;
let fsmStage: FSMStage;
let emitterStage: EmitterStage;
let isRunning = false;

async function initStages() {
  physicsStage = new PhysicsStage({}, eventTarget);
  await physicsStage.init();
  fsmStage = new FSMStage({ dwellTime: 80 }, eventTarget);
  emitterStage = new EmitterStage(canvas.clientWidth, canvas.clientHeight);
  emitterStage.setTarget(canvas);
}

// Update cursor positions
function updateCursors(cursorEvent: CursorEventDetail) {
  const rect = canvas.getBoundingClientRect();
  
  rawCursor.style.left = `${cursorEvent.raw.x * rect.width}px`;
  rawCursor.style.top = `${cursorEvent.raw.y * rect.height}px`;
  
  physicsCursor.style.left = `${cursorEvent.physics.x * rect.width}px`;
  physicsCursor.style.top = `${cursorEvent.physics.y * rect.height}px`;
  
  predictiveCursor.style.left = `${cursorEvent.predictive.x * rect.width}px`;
  predictiveCursor.style.top = `${cursorEvent.predictive.y * rect.height}px`;

  posRaw.textContent = `(${cursorEvent.raw.x.toFixed(2)}, ${cursorEvent.raw.y.toFixed(2)})`;
  posPhysics.textContent = `(${cursorEvent.physics.x.toFixed(2)}, ${cursorEvent.physics.y.toFixed(2)})`;
  posPredictive.textContent = `(${cursorEvent.predictive.x.toFixed(2)}, ${cursorEvent.predictive.y.toFixed(2)})`;
}

function updateFSMState(state: string) {
  fsmStateEl.textContent = state;
  fsmStateEl.className = `state-${state}`;
}

function logEvent(type: string) {
  const entry = document.createElement('div');
  entry.className = `log-entry log-${type.replace('pointer', '')}`;
  const time = new Date().toISOString().slice(11, 23);
  entry.textContent = `${time} ${type}`;
  eventLog.insertBefore(entry, eventLog.firstChild);
  while (eventLog.children.length > 30) {
    eventLog.removeChild(eventLog.lastChild!);
  }
}

// Listen for pointer events
canvas.addEventListener('pointermove', () => logEvent('pointermove'));
canvas.addEventListener('pointerdown', () => logEvent('pointerdown'));
canvas.addEventListener('pointerup', () => logEvent('pointerup'));
canvas.addEventListener('pointercancel', () => logEvent('pointercancel'));

// Run synthetic demo sequence
async function runDemo() {
  if (isRunning) return;
  isRunning = true;
  btnDemo.disabled = true;

  const generator = new SyntheticLandmarkGenerator();
  
  // Build a complete gesture interaction sequence
  generator
    // Start with hand appearing (Open_Palm to arm)
    .addStableFrames(0.2, 0.3, 12, 'Open_Palm', 30)
    // Move while armed
    .generateLinearMovement({
      startX: 0.2, startY: 0.3,
      endX: 0.5, endY: 0.5,
      duration: 400, fps: 30,
      gesture: 'Open_Palm',
      confidence: 0.9, palmAngle: 25,
    })
    // Engage with Pointing_Up
    .addStableFrames(0.5, 0.5, 12, 'Pointing_Up', 30)
    // Drag while engaged
    .generateLinearMovement({
      startX: 0.5, startY: 0.5,
      endX: 0.8, endY: 0.3,
      duration: 500, fps: 30,
      gesture: 'Pointing_Up',
      confidence: 0.9, palmAngle: 25,
    })
    // Simulate tracking loss (coasting)
    .addTrackingLoss(8)
    // Resume tracking
    .addStableFrames(0.75, 0.35, 5, 'Pointing_Up', 30)
    // Release with Open_Palm
    .addStableFrames(0.75, 0.35, 8, 'Open_Palm', 30)
    // Move back
    .generateLinearMovement({
      startX: 0.75, startY: 0.35,
      endX: 0.3, endY: 0.7,
      duration: 400, fps: 30,
      gesture: 'Open_Palm',
      confidence: 0.9, palmAngle: 25,
    })
    // Final stable position
    .addStableFrames(0.3, 0.7, 10, 'Open_Palm', 30);

  const events = generator.getEvents();
  
  for (const event of events) {
    if (event !== null) {
      const cursorEvent = physicsStage.processLandmark(event);
      updateCursors(cursorEvent);
      
      fsmStage.processLandmark(event);
      const fsmEvent = fsmStage.processCursor(cursorEvent);
      updateFSMState(fsmEvent.state);
      
      emitterStage.processFSMEvent(fsmEvent);
    } else {
      // Tracking loss - coast
      const cursorEvent = physicsStage.processNoHand(Date.now());
      updateCursors(cursorEvent);
      fsmStage.processNoHand(Date.now());
    }
    
    await new Promise(r => setTimeout(r, 33)); // ~30fps
  }

  isRunning = false;
  btnDemo.disabled = false;
}

function reset() {
  physicsStage.reset();
  fsmStage.reset();
  emitterStage.clearEventLog();
  eventLog.innerHTML = '';
  updateFSMState('IDLE');
  
  // Reset cursor positions
  rawCursor.style.left = '50%';
  rawCursor.style.top = '50%';
  physicsCursor.style.left = '50%';
  physicsCursor.style.top = '50%';
  predictiveCursor.style.left = '50%';
  predictiveCursor.style.top = '50%';
}

// Button handlers
btnDemo.addEventListener('click', runDemo);
btnReset.addEventListener('click', reset);

// Expose API for Playwright tests
(window as any).gestureAPI = {
  runDemo,
  reset,
  getState: () => fsmStage.getState(),
  getEventLog: () => emitterStage.getEventLog(),
  isReady: () => physicsStage.isReady(),
};

// Initialize on load
initStages().then(() => {
  console.log('Gesture Pointer Monolith initialized');
  (window as any).gestureAPI.initialized = true;
});
