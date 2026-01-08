import { ISensor } from './sensors/ISensor';
import { MemorySensor } from './sensors/MemorySensor';
import { DuckDBSensor } from './sensors/DuckDBSensor';
import { TavilySensor } from './sensors/TavilySensor';
import { Context7Sensor } from './sensors/Context7Sensor';
import { MediaPipeSensor } from './sensors/MediaPipeSensor';
import { ObservationBatch, ObservationFilter, SenseResult } from './contracts';

/**
 * LIDLESS_OBSERVER - The Core Orchestrator for Port 0
 * 
 * @port 0
 * @commander LIDLESS_LEGION
 * @gen 88
 * @status BRONZE
 * @provenance LEGENDARY_COMMANDERS_V9.md
 * @verb FUSE
 * Validates: Requirement 1.0 (Unified Observation Hub)
 */
export class LidlessObserver {
  private sensors: Map<string, ISensor> = new Map();

  constructor() {
    this.bootstrap();
  }

  private bootstrap() {
    this.registerSensor(new MemorySensor());
    this.registerSensor(new DuckDBSensor());
    this.registerSensor(new TavilySensor());
    this.registerSensor(new Context7Sensor());
    this.registerSensor(new MediaPipeSensor());
  }

  registerSensor(sensor: ISensor) {
    this.sensors.set(sensor.name, sensor);
  }

  async observeAll(query?: string, filter?: ObservationFilter): Promise<ObservationBatch> {
    const results = await Promise.all(
      Array.from(this.sensors.values()).map(s => s.sense(query, filter))
    );

    const observations = results
      .filter((r): r is SenseResult & { observation: any /* @bespoke: generic observation data from various sensors */ } => r.success && !!r.observation)
      .map(r => r.observation);

    return {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      observations,
      correlationId: crypto.randomUUID()
    };
  }

  getSensor(name: string): ISensor | undefined {
    return this.sensors.get(name);
  }
}

// Singleton for easy access in the sandbox
export const Observer = new LidlessObserver();
