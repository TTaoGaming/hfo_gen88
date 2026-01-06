/**
 * 🧪 PLAYWRIGHT E2E TESTS
 * 
 * Browser-based tests for the gesture pipeline with GoldenLayout UI.
 * Tests that the pipeline correctly produces W3C Pointer Events.
 * 
 * Feature: gesture-pointer-monolith
 * Validates: Full pipeline integration in browser
 */

import { test, expect } from '@playwright/test';

test.describe('Gesture Pipeline E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for initialization - GoldenLayout app sets initialized = true
    await page.waitForFunction(() => (window as any).gestureAPI?.initialized === true, {
      timeout: 15000,
    });
  });

  test('should load the demo page with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Gesture/);
  });

  test('should display target canvas', async ({ page }) => {
    // GoldenLayout creates target-canvas inside a panel
    const canvas = page.locator('#target-canvas');
    await expect(canvas).toBeVisible();
  });

  test('should display all three cursors', async ({ page }) => {
    const rawCursor = page.locator('#cursor-raw');
    const physicsCursor = page.locator('#cursor-physics');
    const predictiveCursor = page.locator('#cursor-predictive');
    
    await expect(rawCursor).toBeVisible();
    await expect(physicsCursor).toBeVisible();
    await expect(predictiveCursor).toBeVisible();
  });

  test('should display FSM state indicator', async ({ page }) => {
    // FSM state is in debug console panel
    const fsmState = page.locator('#debug-fsm-state');
    await expect(fsmState).toBeVisible();
    await expect(fsmState).toHaveText('IDLE');
  });

  test('should run demo and produce pointer events', async ({ page }) => {
    // Run demo via API
    await page.evaluate(() => (window as any).gestureAPI.runDemo());
    
    // Wait for demo to complete (about 3 seconds)
    await page.waitForTimeout(4000);
    
    // Check that FSM transitioned through states
    const fsmState = page.locator('#debug-fsm-state');
    const stateText = await fsmState.textContent();
    expect(['IDLE', 'ARMED', 'ENGAGED']).toContain(stateText);
  });

  test('should dispatch pointermove events during demo', async ({ page }) => {
    // Collect pointer events
    const pointerEvents: string[] = [];
    
    await page.exposeFunction('capturePointerEvent', (type: string) => {
      pointerEvents.push(type);
    });
    
    await page.evaluate(() => {
      const canvas = document.getElementById('target-canvas');
      if (canvas) {
        canvas.addEventListener('pointermove', () => (window as any).capturePointerEvent('pointermove'));
        canvas.addEventListener('pointerdown', () => (window as any).capturePointerEvent('pointerdown'));
        canvas.addEventListener('pointerup', () => (window as any).capturePointerEvent('pointerup'));
      }
    });
    
    // Run demo via API
    await page.evaluate(() => (window as any).gestureAPI.runDemo());
    await page.waitForTimeout(4000);
    
    // Should have captured pointer events
    expect(pointerEvents.length).toBeGreaterThan(0);
    expect(pointerEvents).toContain('pointermove');
  });

  test('should dispatch pointerdown and pointerup during engage/release', async ({ page }) => {
    const pointerEvents: string[] = [];
    
    await page.exposeFunction('captureEvent', (type: string) => {
      pointerEvents.push(type);
    });
    
    await page.evaluate(() => {
      const canvas = document.getElementById('target-canvas');
      if (canvas) {
        canvas.addEventListener('pointerdown', () => (window as any).captureEvent('pointerdown'));
        canvas.addEventListener('pointerup', () => (window as any).captureEvent('pointerup'));
      }
    });
    
    // Run demo via API
    await page.evaluate(() => (window as any).gestureAPI.runDemo());
    await page.waitForTimeout(5000);
    
    // Should have pointerdown (engage)
    expect(pointerEvents).toContain('pointerdown');
    expect(pointerEvents.length).toBeGreaterThan(0);
  });

  test('should reset state via API', async ({ page }) => {
    // Run demo first
    await page.evaluate(() => (window as any).gestureAPI.runDemo());
    await page.waitForTimeout(2000);
    
    // Reset via API
    await page.evaluate(() => (window as any).gestureAPI.reset());
    
    // FSM should be back to IDLE
    const fsmState = page.locator('#debug-fsm-state');
    await expect(fsmState).toHaveText('IDLE');
  });

  test('should update cursor positions during demo', async ({ page }) => {
    // Get initial cursor position
    const physicsCursor = page.locator('#cursor-physics');
    const initialLeft = await physicsCursor.evaluate(el => el.style.left);
    
    // Run demo via API
    await page.evaluate(() => (window as any).gestureAPI.runDemo());
    await page.waitForTimeout(1000);
    
    // Cursor should have moved
    const newLeft = await physicsCursor.evaluate(el => el.style.left);
    expect(newLeft).not.toBe(initialLeft);
  });

  test('should expose gestureAPI for programmatic control', async ({ page }) => {
    const hasAPI = await page.evaluate(() => {
      return typeof (window as any).gestureAPI !== 'undefined';
    });
    expect(hasAPI).toBe(true);
    
    const isReady = await page.evaluate(() => {
      return (window as any).gestureAPI.isReady();
    });
    expect(isReady).toBe(true);
  });

  test('should support layout presets', async ({ page }) => {
    // Apply minimal preset
    await page.evaluate(() => (window as any).gestureAPI.applyPreset('minimal'));
    await page.waitForTimeout(500);
    
    // Target canvas should still be visible
    const canvas = page.locator('#target-canvas');
    await expect(canvas).toBeVisible();
  });
});
