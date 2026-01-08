/**
 * 👁️ P0-SUB-0: TELEMETRY COLLECTOR
 * Primary ingestion point for external telemetry signals.
 * 
 * @port 0
 * @commander LIDLESS_LEGION
 * @gen 88
 * @status BRONZE
 * @provenance LEGENDARY_COMMANDERS_V9.md
 * Validates: Requirement 2.5 (Telemetry Ingestion)
 */

export interface TelemetryFrame {
  source: string;
  value: any; /* @bespoke: telemetry values can be any JSON-serializable type */
  timestamp: number;
}

export class TelemetryCollector {
  private buffer: TelemetryFrame[] = [];

  public collect(source: string, value: any /* @bespoke: telemetry input */): TelemetryFrame {
    const frame: TelemetryFrame = {
      source,
      value,
      timestamp: Date.now(),
    };
    this.buffer.push(frame);
    if (this.buffer.length > 100) this.buffer.shift(); // Max 100 frames
    return frame;
  }

  public getHistory(): TelemetryFrame[] {
    return this.buffer;
  }
}
