/**
 * 👁️ P0-SUB-7: ERROR BEACON
 * Senses and emits signals when system exceptions occur.
 */

export interface ErrorSignal {
  message: string;
  stack?: string;
  severity: 'WARN' | 'ERROR' | 'FATAL';
  timestamp: number;
}

export class ErrorBeacon {
  private signals: ErrorSignal[] = [];

  public beacon(error: Error | string, severity: ErrorSignal['severity'] = 'ERROR'): ErrorSignal {
    const signal: ErrorSignal = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      severity,
      timestamp: Date.now(),
    };
    this.signals.push(signal);
    return signal;
  }

  public getSignals(): ErrorSignal[] {
    return this.signals;
  }
}
