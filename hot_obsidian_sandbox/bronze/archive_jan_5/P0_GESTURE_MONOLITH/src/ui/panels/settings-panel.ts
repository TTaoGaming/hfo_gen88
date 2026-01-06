/**
 * ⚙️ SETTINGS PANEL
 * 
 * lil-gui based settings for all stage configurations.
 * Includes preset buttons (debug, minimal, presentation).
 * 
 * @provenance .kiro/specs/gesture-pointer-monolith/design.md
 * Validates: Requirements 1.6, 2.9, 3.12, 5.8
 */

import GUI from 'lil-gui';
import type { ComponentContainer } from 'golden-layout';
import type { PanelFactory } from '../golden-layout-shell.js';
import type { PhysicsStageConfig, FSMStageConfig, SensorStageConfig } from '../../contracts/schemas.js';

export interface SettingsCallbacks {
  onPhysicsChange?: (config: Partial<PhysicsStageConfig>) => void;
  onFSMChange?: (config: Partial<FSMStageConfig>) => void;
  onSensorChange?: (config: Partial<SensorStageConfig>) => void;
  onPresetChange?: (preset: 'debug' | 'minimal' | 'presentation') => void;
  onCursorToggle?: (cursor: 'raw' | 'physics' | 'predictive', visible: boolean) => void;
  onReset?: () => void;
  onRunDemo?: () => void;
}

export interface SettingsState {
  physics: {
    stiffness: number;
    damping: number;
    minCutoff: number;
    beta: number;
    fps: number;
    snapLockThreshold: number;
  };
  fsm: {
    dwellTime: number;
    enterThreshold: number;
    exitThreshold: number;
    coneAngle: number;
    timeout: number;
  };
  sensor: {
    resolution: '480p' | '720p' | '1080p';
    coneAngle: number;
  };
  cursors: {
    showRaw: boolean;
    showPhysics: boolean;
    showPredictive: boolean;
  };
}

const DEFAULT_STATE: SettingsState = {
  physics: {
    stiffness: 50,
    damping: 5,
    minCutoff: 0.5,
    beta: 0.001,
    fps: 30,
    snapLockThreshold: 0.1,
  },
  fsm: {
    dwellTime: 100,
    enterThreshold: 0.7,
    exitThreshold: 0.5,
    coneAngle: 45,
    timeout: 2000,
  },
  sensor: {
    resolution: '720p',
    coneAngle: 45,
  },
  cursors: {
    showRaw: true,
    showPhysics: true,
    showPredictive: true,
  },
};

export class SettingsPanel implements PanelFactory {
  private container: ComponentContainer | null = null;
  private gui: GUI | null = null;
  private state: SettingsState;
  private callbacks: SettingsCallbacks;

  constructor(callbacks: SettingsCallbacks = {}, initialState?: Partial<SettingsState>) {
    this.callbacks = callbacks;
    this.state = {
      physics: { ...DEFAULT_STATE.physics, ...initialState?.physics },
      fsm: { ...DEFAULT_STATE.fsm, ...initialState?.fsm },
      sensor: { ...DEFAULT_STATE.sensor, ...initialState?.sensor },
      cursors: { ...DEFAULT_STATE.cursors, ...initialState?.cursors },
    };
  }

  create(container: ComponentContainer): void {
    this.container = container;
    const element = container.element;
    element.style.cssText = 'background:#16213e;overflow-y:auto;padding:8px;';

    this.gui = new GUI({ container: element, autoPlace: false, width: element.clientWidth - 16 });
    this.gui.domElement.style.width = '100%';

    this.buildGUI();

    container.on('resize', () => {
      if (this.gui) {
        this.gui.domElement.style.width = `${element.clientWidth - 16}px`;
      }
    });
  }


  private buildGUI(): void {
    if (!this.gui) return;

    // Actions folder
    const actions = this.gui.addFolder('Actions');
    actions.add({ runDemo: () => this.callbacks.onRunDemo?.() }, 'runDemo').name('▶ Run Demo');
    actions.add({ reset: () => this.callbacks.onReset?.() }, 'reset').name('↺ Reset');
    actions.open();

    // Presets folder
    const presets = this.gui.addFolder('Layout Presets');
    presets.add({ debug: () => this.callbacks.onPresetChange?.('debug') }, 'debug').name('🔧 Debug');
    presets.add({ minimal: () => this.callbacks.onPresetChange?.('minimal') }, 'minimal').name('📦 Minimal');
    presets.add({ presentation: () => this.callbacks.onPresetChange?.('presentation') }, 'presentation').name('🎬 Presentation');

    // Cursor visibility
    const cursors = this.gui.addFolder('Cursor Visibility');
    cursors.add(this.state.cursors, 'showRaw').name('Raw (Red)').onChange((v: boolean) => {
      this.callbacks.onCursorToggle?.('raw', v);
    });
    cursors.add(this.state.cursors, 'showPhysics').name('Physics (Green)').onChange((v: boolean) => {
      this.callbacks.onCursorToggle?.('physics', v);
    });
    cursors.add(this.state.cursors, 'showPredictive').name('Predictive (Blue)').onChange((v: boolean) => {
      this.callbacks.onCursorToggle?.('predictive', v);
    });
    cursors.open();

    // Physics settings
    const physics = this.gui.addFolder('Physics Stage');
    physics.add(this.state.physics, 'stiffness', 1, 200, 1).name('Stiffness').onChange(() => this.emitPhysics());
    physics.add(this.state.physics, 'damping', 0.1, 20, 0.1).name('Damping').onChange(() => this.emitPhysics());
    physics.add(this.state.physics, 'minCutoff', 0.01, 10, 0.01).name('OneEuro minCutoff').onChange(() => this.emitPhysics());
    physics.add(this.state.physics, 'beta', 0, 1, 0.001).name('OneEuro beta').onChange(() => this.emitPhysics());
    physics.add(this.state.physics, 'fps', 15, 60, 1).name('FPS').onChange(() => this.emitPhysics());
    physics.add(this.state.physics, 'snapLockThreshold', 0.01, 1, 0.01).name('Snap Lock').onChange(() => this.emitPhysics());

    // FSM settings
    const fsm = this.gui.addFolder('FSM Stage');
    fsm.add(this.state.fsm, 'dwellTime', 0, 1000, 10).name('Dwell Time (ms)').onChange(() => this.emitFSM());
    fsm.add(this.state.fsm, 'enterThreshold', 0, 1, 0.05).name('Enter Threshold').onChange(() => this.emitFSM());
    fsm.add(this.state.fsm, 'exitThreshold', 0, 1, 0.05).name('Exit Threshold').onChange(() => this.emitFSM());
    fsm.add(this.state.fsm, 'coneAngle', 0, 90, 1).name('Cone Angle (°)').onChange(() => this.emitFSM());
    fsm.add(this.state.fsm, 'timeout', 100, 10000, 100).name('Timeout (ms)').onChange(() => this.emitFSM());

    // Sensor settings
    const sensor = this.gui.addFolder('Sensor Stage');
    sensor.add(this.state.sensor, 'resolution', ['480p', '720p', '1080p']).name('Resolution').onChange(() => this.emitSensor());
    sensor.add(this.state.sensor, 'coneAngle', 0, 90, 1).name('Cone Angle (°)').onChange(() => this.emitSensor());
  }

  private emitPhysics(): void {
    this.callbacks.onPhysicsChange?.(this.state.physics);
  }

  private emitFSM(): void {
    this.callbacks.onFSMChange?.(this.state.fsm);
  }

  private emitSensor(): void {
    this.callbacks.onSensorChange?.(this.state.sensor);
  }

  getState(): SettingsState {
    return JSON.parse(JSON.stringify(this.state));
  }

  setState(state: Partial<SettingsState>): void {
    if (state.physics) Object.assign(this.state.physics, state.physics);
    if (state.fsm) Object.assign(this.state.fsm, state.fsm);
    if (state.sensor) Object.assign(this.state.sensor, state.sensor);
    if (state.cursors) Object.assign(this.state.cursors, state.cursors);
    this.gui?.controllersRecursive().forEach(c => c.updateDisplay());
  }

  destroy(): void {
    this.gui?.destroy();
    this.gui = null;
  }
}
