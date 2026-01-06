/**
 * 🎯 GESTURE POINTER MONOLITH - MAIN APP
 * 
 * Wires together all stages with GoldenLayout UI Shell.
 * 
 * @provenance .kiro/specs/gesture-pointer-monolith/design.md
 */

import { GoldenLayoutShell, PRESET_LAYOUTS } from './ui/golden-layout-shell.js';
import { WebcamPreviewPanel } from './ui/panels/webcam-preview.js';
import { TargetCanvasPanel } from './ui/panels/target-canvas.js';
import { SettingsPanel } from './ui/panels/settings-panel.js';
import { DebugConsolePanel } from './ui/panels/debug-console.js';
import { PhysicsStage } from './stages/physics/physics-stage.js';
import { FSMStage } from './stages/fsm/fsm-stage.js';
import { EmitterStage } from './stages/emitter/emitter-stage.js';
import { SyntheticLandmarkGenerator } from './testing/synthetic-landmark-generator.js';
import type { CursorEventDetail, LandmarkEventDetail } from './contracts/schemas.js';

export class GestureMonolithApp {
  private shell: GoldenLayoutShell;
  private physicsStage: PhysicsStage;
  private fsmStage: FSMStage;
  private emitterStage: EmitterStage;
  
  // Panels
  private webcamPanel: WebcamPreviewPanel;
  private targetPanel: TargetCanvasPanel;
  private settingsPanel: SettingsPanel;
  private debugPanel: DebugConsolePanel;
  
  // Event bus
  private eventTarget: EventTarget;
  
  // State
  private isRunning = false;
  private initialized = false;

  constructor(container: HTMLElement) {
    this.eventTarget = new EventTarget();
    
    // Create stages
    this.physicsStage = new PhysicsStage({}, this.eventTarget);
    this.fsmStage = new FSMStage({ dwellTime: 80 }, this.eventTarget);
    this.emitterStage = new EmitterStage(container.clientWidth, container.clientHeight);
    
    // Create panels
    this.webcamPanel = new WebcamPreviewPanel();
    this.targetPanel = new TargetCanvasPanel();
    this.debugPanel = new DebugConsolePanel();
    this.settingsPanel = new SettingsPanel({
      onPhysicsChange: (config) => this.physicsStage.configure(config),
      onFSMChange: (config) => this.fsmStage.configure(config),
      onPresetChange: (preset) => this.shell.applyPreset(preset),
      onCursorToggle: (cursor, visible) => this.toggleCursor(cursor, visible),
      onReset: () => this.reset(),
      onRunDemo: () => this.runDemo(),
    });
    
    // Create shell
    this.shell = new GoldenLayoutShell(container);
  }

  async init(): Promise<void> {
    // Initialize physics (loads Rapier WASM)
    await this.physicsStage.init();
    
    // Register panels
    this.shell.registerPanel('webcam-preview', this.webcamPanel);
    this.shell.registerPanel('target-canvas', this.targetPanel);
    this.shell.registerPanel('settings-panel', this.settingsPanel);
    this.shell.registerPanel('debug-console', this.debugPanel);
    
    // Initialize shell
    this.shell.init();
    
    // Wait for panels to be created
    await new Promise(r => setTimeout(r, 100));
    
    // Wire up subscriptions
    this.wireSubscriptions();
    
    this.initialized = true;
    console.log('🎯 Gesture Monolith App initialized');
  }


  private wireSubscriptions(): void {
    // Target canvas receives cursor events
    this.targetPanel.subscribe(this.eventTarget);
    
    // Debug console receives cursor and FSM events
    this.debugPanel.subscribe(this.eventTarget, this.eventTarget);
    
    // Set emitter target
    const targetEl = this.targetPanel.getElement();
    if (targetEl) {
      this.emitterStage.setTarget(targetEl);
      this.debugPanel.subscribePointerEvents(targetEl);
    }
    
    // Webcam panel subscribes to landmark events
    this.webcamPanel.subscribe(this.eventTarget);
  }

  private toggleCursor(cursor: 'raw' | 'physics' | 'predictive', visible: boolean): void {
    switch (cursor) {
      case 'raw': this.targetPanel.toggleRawCursor(visible); break;
      case 'physics': this.targetPanel.togglePhysicsCursor(visible); break;
      case 'predictive': this.targetPanel.togglePredictiveCursor(visible); break;
    }
  }

  reset(): void {
    this.physicsStage.reset();
    this.fsmStage.reset();
    this.emitterStage.clearEventLog();
    this.debugPanel.reset();
  }

  async runDemo(): Promise<void> {
    if (this.isRunning || !this.initialized) return;
    this.isRunning = true;

    const generator = new SyntheticLandmarkGenerator();
    
    // Build gesture interaction sequence
    generator
      .addStableFrames(0.2, 0.3, 12, 'Open_Palm', 30)
      .generateLinearMovement({
        startX: 0.2, startY: 0.3,
        endX: 0.5, endY: 0.5,
        duration: 400, fps: 30,
        gesture: 'Open_Palm',
        confidence: 0.9, palmAngle: 25,
      })
      .addStableFrames(0.5, 0.5, 12, 'Pointing_Up', 30)
      .generateLinearMovement({
        startX: 0.5, startY: 0.5,
        endX: 0.8, endY: 0.3,
        duration: 500, fps: 30,
        gesture: 'Pointing_Up',
        confidence: 0.9, palmAngle: 25,
      })
      .addTrackingLoss(8)
      .addStableFrames(0.75, 0.35, 5, 'Pointing_Up', 30)
      .addStableFrames(0.75, 0.35, 8, 'Open_Palm', 30)
      .generateLinearMovement({
        startX: 0.75, startY: 0.35,
        endX: 0.3, endY: 0.7,
        duration: 400, fps: 30,
        gesture: 'Open_Palm',
        confidence: 0.9, palmAngle: 25,
      })
      .addStableFrames(0.3, 0.7, 10, 'Open_Palm', 30);

    const events = generator.getEvents();
    
    for (const event of events) {
      if (event !== null) {
        // Update webcam preview with landmarks
        this.webcamPanel.updateLandmarks(event.landmarks);
        
        // Process through pipeline
        const cursorEvent = this.physicsStage.processLandmark(event);
        this.fsmStage.processLandmark(event);
        const fsmEvent = this.fsmStage.processCursor(cursorEvent);
        this.emitterStage.processFSMEvent(fsmEvent);
      } else {
        // Tracking loss
        this.webcamPanel.updateLandmarks(null);
        const cursorEvent = this.physicsStage.processNoHand(Date.now());
        this.fsmStage.processNoHand(Date.now());
      }
      
      await new Promise(r => setTimeout(r, 33)); // ~30fps
    }

    this.isRunning = false;
  }

  // Expose API for Playwright tests
  getAPI() {
    return {
      runDemo: () => this.runDemo(),
      reset: () => this.reset(),
      getState: () => this.fsmStage.getState(),
      getEventLog: () => this.emitterStage.getEventLog(),
      isReady: () => this.initialized,
      applyPreset: (preset: 'debug' | 'minimal' | 'presentation') => this.shell.applyPreset(preset),
    };
  }

  destroy(): void {
    this.shell.destroy();
    this.physicsStage.stopStepping();
  }
}
