/**
 * 📋 DEBUG CONSOLE PANEL
 * 
 * Event log with timestamps, FSM state indicator, cursor positions table.
 * 
 * @provenance .kiro/specs/gesture-pointer-monolith/design.md
 * Validates: Requirements 5.12
 */

import type { ComponentContainer } from 'golden-layout';
import type { PanelFactory } from '../golden-layout-shell.js';
import type { CursorEventDetail, FSMEventDetail, FSMState } from '../../contracts/schemas.js';

export interface DebugConsoleConfig {
  maxLogEntries: number;
  showTimestamps: boolean;
}

const DEFAULT_CONFIG: DebugConsoleConfig = {
  maxLogEntries: 50,
  showTimestamps: true,
};

export class DebugConsolePanel implements PanelFactory {
  private container: ComponentContainer | null = null;
  private element: HTMLElement | null = null;
  private fsmStateEl: HTMLElement | null = null;
  private eventLogEl: HTMLElement | null = null;
  private posRawEl: HTMLElement | null = null;
  private posPhysicsEl: HTMLElement | null = null;
  private posPredictiveEl: HTMLElement | null = null;
  private coastingEl: HTMLElement | null = null;
  private config: DebugConsoleConfig;

  constructor(config: Partial<DebugConsoleConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  create(container: ComponentContainer): void {
    this.container = container;
    this.element = container.element;
    this.element.style.cssText = 'background:#16213e;overflow-y:auto;padding:8px;font-family:monospace;font-size:12px;color:#eee;';

    this.element.innerHTML = `
      <style>
        .debug-section { margin-bottom: 12px; }
        .debug-section h4 { margin: 0 0 4px 0; color: #888; font-size: 11px; text-transform: uppercase; }
        .fsm-state { padding: 8px; background: #0f3460; border-radius: 4px; text-align: center; font-weight: bold; font-size: 16px; }
        .state-IDLE { color: #888; }
        .state-ARMED { color: #0ff; }
        .state-ENGAGED { color: #0f0; }
        .cursor-table { width: 100%; border-collapse: collapse; }
        .cursor-table td { padding: 2px 4px; }
        .cursor-table .label { color: #888; width: 80px; }
        .cursor-raw { color: #f66; }
        .cursor-physics { color: #6f6; }
        .cursor-predictive { color: #6cf; }
        .coasting { color: #f80; font-weight: bold; }
        .event-log { max-height: 150px; overflow-y: auto; background: #0f0f23; padding: 4px; border-radius: 4px; }
        .log-entry { margin: 1px 0; white-space: nowrap; }
        .log-move { color: #666; }
        .log-down { color: #0f0; }
        .log-up { color: #f80; }
        .log-cancel { color: #f00; }
        .log-time { color: #555; margin-right: 8px; }
      </style>
      <div class="debug-section">
        <h4>FSM State</h4>
        <div class="fsm-state state-IDLE" id="debug-fsm-state">IDLE</div>
      </div>
      <div class="debug-section">
        <h4>Cursor Positions</h4>
        <table class="cursor-table">
          <tr><td class="label">Raw:</td><td class="cursor-raw" id="debug-pos-raw">-</td></tr>
          <tr><td class="label">Physics:</td><td class="cursor-physics" id="debug-pos-physics">-</td></tr>
          <tr><td class="label">Predictive:</td><td class="cursor-predictive" id="debug-pos-predictive">-</td></tr>
          <tr><td class="label">Status:</td><td id="debug-coasting">Tracking</td></tr>
        </table>
      </div>
      <div class="debug-section">
        <h4>Event Log</h4>
        <div class="event-log" id="debug-event-log"></div>
      </div>
    `;

    this.fsmStateEl = this.element.querySelector('#debug-fsm-state');
    this.eventLogEl = this.element.querySelector('#debug-event-log');
    this.posRawEl = this.element.querySelector('#debug-pos-raw');
    this.posPhysicsEl = this.element.querySelector('#debug-pos-physics');
    this.posPredictiveEl = this.element.querySelector('#debug-pos-predictive');
    this.coastingEl = this.element.querySelector('#debug-coasting');
  }


  /**
   * Update FSM state display
   */
  updateFSMState(state: FSMState): void {
    if (!this.fsmStateEl) return;
    this.fsmStateEl.textContent = state;
    this.fsmStateEl.className = `fsm-state state-${state}`;
  }

  /**
   * Update cursor positions display
   */
  updateCursors(detail: CursorEventDetail): void {
    if (this.posRawEl) {
      this.posRawEl.textContent = `(${detail.raw.x.toFixed(3)}, ${detail.raw.y.toFixed(3)})`;
    }
    if (this.posPhysicsEl) {
      this.posPhysicsEl.textContent = `(${detail.physics.x.toFixed(3)}, ${detail.physics.y.toFixed(3)})`;
    }
    if (this.posPredictiveEl) {
      this.posPredictiveEl.textContent = `(${detail.predictive.x.toFixed(3)}, ${detail.predictive.y.toFixed(3)})`;
    }
    if (this.coastingEl) {
      this.coastingEl.textContent = detail.isCoasting ? 'COASTING' : 'Tracking';
      this.coastingEl.className = detail.isCoasting ? 'coasting' : '';
    }
  }

  /**
   * Log a pointer event
   */
  logEvent(type: string): void {
    if (!this.eventLogEl) return;

    const entry = document.createElement('div');
    entry.className = `log-entry log-${type.replace('pointer', '')}`;

    if (this.config.showTimestamps) {
      const time = new Date().toISOString().slice(11, 23);
      entry.innerHTML = `<span class="log-time">${time}</span>${type}`;
    } else {
      entry.textContent = type;
    }

    this.eventLogEl.insertBefore(entry, this.eventLogEl.firstChild);

    // Trim old entries
    while (this.eventLogEl.children.length > this.config.maxLogEntries) {
      this.eventLogEl.removeChild(this.eventLogEl.lastChild!);
    }
  }

  /**
   * Subscribe to cursor and FSM events
   */
  subscribe(cursorSource: EventTarget, fsmSource: EventTarget): void {
    cursorSource.addEventListener('cursor', ((event: CustomEvent<CursorEventDetail>) => {
      this.updateCursors(event.detail);
    }) as EventListener);

    fsmSource.addEventListener('fsm', ((event: CustomEvent<FSMEventDetail>) => {
      this.updateFSMState(event.detail.state);
    }) as EventListener);
  }

  /**
   * Subscribe to pointer events on target element
   */
  subscribePointerEvents(target: Element): void {
    target.addEventListener('pointermove', () => this.logEvent('pointermove'));
    target.addEventListener('pointerdown', () => this.logEvent('pointerdown'));
    target.addEventListener('pointerup', () => this.logEvent('pointerup'));
    target.addEventListener('pointercancel', () => this.logEvent('pointercancel'));
  }

  /**
   * Clear the event log
   */
  clearLog(): void {
    if (this.eventLogEl) {
      this.eventLogEl.innerHTML = '';
    }
  }

  /**
   * Reset all displays
   */
  reset(): void {
    this.updateFSMState('IDLE');
    this.clearLog();
    if (this.posRawEl) this.posRawEl.textContent = '-';
    if (this.posPhysicsEl) this.posPhysicsEl.textContent = '-';
    if (this.posPredictiveEl) this.posPredictiveEl.textContent = '-';
    if (this.coastingEl) {
      this.coastingEl.textContent = 'Tracking';
      this.coastingEl.className = '';
    }
  }

  configure(config: Partial<DebugConsoleConfig>): void {
    this.config = { ...this.config, ...config };
  }

  destroy(): void {
    // Cleanup handled by GoldenLayout
  }
}
