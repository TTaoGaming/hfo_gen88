/**
 * 🧪 GESTURE PIPELINE TESTS
 * 
 * Property-based and unit tests for the modular monolith pipeline.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { fc, test as fcTest } from '@fast-check/vitest';
import {
  OneEuroFilter,
  PhysicsCursor,
  GestureFSM,
  GesturePipeline,
  createPointerEvent,
  PointerEventData,
} from './gesture-pipeline.js';

// ============================================================================
// ONE EURO FILTER TESTS
// ============================================================================

describe('OneEuroFilter', () => {
  it('should return input on first call', () => {
    const filter = new OneEuroFilter();
    const result = filter.filter(0.5, 0.5, 1000);
    expect(result.x).toBeCloseTo(0.5);
    expect(result.y).toBeCloseTo(0.5);
  });

  it('should smooth jittery input', () => {
    const filter = new OneEuroFilter(0.5, 0.001, 1.0);
    
    // Simulate jittery input around 0.5
    const results: { x: number; y: number }[] = [];
    for (let i = 0; i < 10; i++) {
      const jitter = (Math.random() - 0.5) * 0.1;
      results.push(filter.filter(0.5 + jitter, 0.5 + jitter, 1000 + i * 16));
    }
    
    // Output should be smoother than input (closer to 0.5)
    const lastResult = results[results.length - 1];
    expect(Math.abs(lastResult.x - 0.5)).toBeLessThan(0.1);
    expect(Math.abs(lastResult.y - 0.5)).toBeLessThan(0.1);
  });

  // Property: Output should always be bounded by input range (excluding NaN)
  fcTest.prop([
    fc.array(
      fc.tuple(
        fc.float({ min: 0, max: 1, noNaN: true }), 
        fc.float({ min: 0, max: 1, noNaN: true })
      ), 
      { minLength: 5, maxLength: 20 }
    )
  ])('output bounded by input range', (inputs) => {
    const filter = new OneEuroFilter();
    let minX = 1, maxX = 0, minY = 1, maxY = 0;
    
    inputs.forEach(([x, y], i) => {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      
      const result = filter.filter(x, y, 1000 + i * 16);
      
      // Allow small overshoot due to filter dynamics
      expect(result.x).toBeGreaterThanOrEqual(minX - 0.1);
      expect(result.x).toBeLessThanOrEqual(maxX + 0.1);
      expect(result.y).toBeGreaterThanOrEqual(minY - 0.1);
      expect(result.y).toBeLessThanOrEqual(maxY + 0.1);
    });
  });
});

// ============================================================================
// PHYSICS CURSOR TESTS
// ============================================================================

describe('PhysicsCursor', () => {
  let cursor: PhysicsCursor;

  beforeAll(async () => {
    cursor = new PhysicsCursor();
    await cursor.init(50, 5);
  });

  it('should initialize at center', () => {
    const pos = cursor.step();
    expect(pos.x).toBeCloseTo(0.5, 1);
    expect(pos.y).toBeCloseTo(0.5, 1);
  });

  it('should follow target over time', async () => {
    const cursor = new PhysicsCursor();
    await cursor.init(100, 10); // Higher stiffness for faster settling
    
    cursor.setTarget(0.8, 0.8);
    
    // Step multiple times to let spring settle (more steps needed)
    let pos = { x: 0.5, y: 0.5 };
    for (let i = 0; i < 200; i++) {
      pos = cursor.step();
    }
    
    // Should be moving toward target
    expect(pos.x).toBeGreaterThan(0.55);
    expect(pos.y).toBeGreaterThan(0.55);
  });
});

// ============================================================================
// GESTURE FSM TESTS
// ============================================================================

describe('GestureFSM', () => {
  it('should start in IDLE', () => {
    const fsm = new GestureFSM();
    expect(fsm.state).toBe('IDLE');
  });

  it('should transition IDLE -> ARMED on Open_Palm', () => {
    const fsm = new GestureFSM();
    fsm.transition('Open_Palm', true, true, 16);
    expect(fsm.state).toBe('ARMED');
  });

  it('should transition ARMED -> TRACKING on Pointing_Up', () => {
    const fsm = new GestureFSM();
    fsm.transition('Open_Palm', true, true, 16);
    const result = fsm.transition('Pointing_Up', false, true, 16);
    expect(fsm.state).toBe('TRACKING');
    expect(result.action).toBe('MOVE');
  });

  it('should transition TRACKING -> CLICKING on Closed_Fist', () => {
    const fsm = new GestureFSM();
    fsm.transition('Open_Palm', true, true, 16);
    fsm.transition('Pointing_Up', false, true, 16);
    const result = fsm.transition('Closed_Fist', false, true, 16);
    expect(fsm.state).toBe('CLICKING');
    expect(result.action).toBe('DOWN');
  });

  it('should transition CLICKING -> TRACKING on fist open', () => {
    const fsm = new GestureFSM();
    fsm.transition('Open_Palm', true, true, 16);
    fsm.transition('Pointing_Up', false, true, 16);
    fsm.transition('Closed_Fist', false, true, 16);
    const result = fsm.transition('Pointing_Up', false, true, 16);
    expect(fsm.state).toBe('TRACKING');
    expect(result.action).toBe('UP');
  });

  it('should return to IDLE after no hand timeout', () => {
    const fsm = new GestureFSM();
    fsm.transition('Open_Palm', true, true, 16);
    expect(fsm.state).toBe('ARMED');
    
    // Simulate no hand for 600ms
    for (let i = 0; i < 40; i++) {
      fsm.transition('None', false, false, 16);
    }
    
    expect(fsm.state).toBe('IDLE');
  });
});

// ============================================================================
// POINTER EVENT TESTS
// ============================================================================

describe('createPointerEvent', () => {
  it('should create pointermove with correct coordinates', () => {
    const event = createPointerEvent('pointermove', 0.5, 0.5, 1920, 1080);
    expect(event.type).toBe('pointermove');
    expect(event.clientX).toBe(960);
    expect(event.clientY).toBe(540);
    expect(event.button).toBe(-1);
  });

  it('should create pointerdown with button=0', () => {
    const event = createPointerEvent('pointerdown', 0.5, 0.5, 1920, 1080);
    expect(event.type).toBe('pointerdown');
    expect(event.button).toBe(0);
    expect(event.buttons).toBe(1);
  });

  it('should create pointerup with button=0', () => {
    const event = createPointerEvent('pointerup', 0.5, 0.5, 1920, 1080);
    expect(event.type).toBe('pointerup');
    expect(event.button).toBe(0);
    expect(event.buttons).toBe(0);
  });

  // Property: coordinates should scale linearly with viewport
  fcTest.prop([
    fc.float({ min: 0, max: 1, noNaN: true }),
    fc.float({ min: 0, max: 1, noNaN: true }),
    fc.integer({ min: 100, max: 4000 }),
    fc.integer({ min: 100, max: 4000 }),
  ])('coordinates scale with viewport', (x, y, width, height) => {
    const event = createPointerEvent('pointermove', x, y, width, height);
    expect(event.clientX).toBeCloseTo(x * width, 5);
    expect(event.clientY).toBeCloseTo(y * height, 5);
  });
});

// ============================================================================
// FULL PIPELINE TESTS
// ============================================================================

describe('GesturePipeline', () => {
  it('should initialize without error', async () => {
    const pipeline = new GesturePipeline();
    await pipeline.init();
    expect(pipeline.getState()).toBe('IDLE');
  });

  it('should return null for invalid input', async () => {
    const pipeline = new GesturePipeline();
    await pipeline.init();
    
    const result = pipeline.process({ invalid: 'data' }, 1000, 1920, 1080);
    expect(result).toBeNull();
  });

  it('should return null when no hand detected', async () => {
    const pipeline = new GesturePipeline();
    await pipeline.init();
    
    const result = pipeline.process({ landmarks: [] }, 1000, 1920, 1080);
    expect(result).toBeNull();
  });

  it('should emit pointermove when tracking', async () => {
    const pipeline = new GesturePipeline();
    await pipeline.init();

    // Generate 21 landmarks
    const landmarks = Array.from({ length: 21 }, (_, i) => ({
      x: 0.5,
      y: i === 0 ? 0.6 : 0.4, // wrist below middle_mcp = palm facing
      z: 0,
    }));

    // Arm with Open_Palm
    pipeline.process({
      landmarks: [landmarks],
      gestures: [[{ categoryName: 'Open_Palm', score: 0.9 }]],
    }, 1000, 1920, 1080);

    expect(pipeline.getState()).toBe('ARMED');

    // Track with Pointing_Up
    const event = pipeline.process({
      landmarks: [landmarks],
      gestures: [[{ categoryName: 'Pointing_Up', score: 0.9 }]],
    }, 1016, 1920, 1080);

    expect(pipeline.getState()).toBe('TRACKING');
    expect(event?.type).toBe('pointermove');
  });
});
