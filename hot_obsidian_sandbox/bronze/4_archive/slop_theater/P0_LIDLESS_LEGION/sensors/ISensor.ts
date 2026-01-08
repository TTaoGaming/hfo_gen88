/**
 * @port 0
 * @commander LIDLESS_LEGION
 * @gen 88
 * @status BRONZE
 * @provenance LEGENDARY_COMMANDERS_V9.md
 * Validates: Requirement 2.0 (Sensor Interface)
 */
import { Observation, ObservationFilter, SenseResult } from '../contracts';

export interface ISensor {
  name: string;
  sense(query?: string, filter?: ObservationFilter): Promise<SenseResult>;
}
