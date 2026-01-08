/**
 * 👁️ P0-SUB-1: SYSTEM MONITOR
 * Senses architectural load and system resource utilization.
 */

export interface SystemMetrics {
  cpuLoad: number;
  memoryUsage: number;
  processCount: number;
}

export class SystemMonitor {
  /**
   * Returns current system metrics (Mocked for Bronze).
   */
  public getMetrics(): SystemMetrics {
    return {
      cpuLoad: Math.random() * 100,
      memoryUsage: Math.random() * 16384, // MB
      processCount: Math.floor(Math.random() * 200),
    };
  }

  /**
   * Senses if the system is under 'Critical' load (AI Theater detection).
   */
  public isCritical(): boolean {
    const metrics = this.getMetrics();
    return metrics.cpuLoad > 95;
  }
}
