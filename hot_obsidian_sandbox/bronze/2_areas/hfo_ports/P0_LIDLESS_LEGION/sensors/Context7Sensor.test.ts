/**
 * Context7Sensor.test.ts - Verification for Documentation Sensing
 * 
 * @port 0
 * @commander LIDLESS_LEGION
 * @gen 88
 * @status BRONZE
 * @provenance LIDLESS_OBSERVER.ts
 * Validates: Requirement 2.5 (Documentation Observation)
 */
import { describe, it, expect, vi } from 'vitest';
import { Context7Sensor } from './Context7Sensor';

describe('Context7Sensor', () => {
  it('should return a successful observation when sensing', async () => {
    const sensor = new Context7Sensor();
    const result = await sensor.sense('How to use React useEffect');

    expect(result.success).toBe(true);
    expect(result.observation).toBeDefined();
    expect(result.observation?.source).toBe('CONTEXT7');
    expect(result.observation?.query).toBe('How to use React useEffect');
    expect(result.observation?.confidence).toBe(0.98);
    expect(result.observation?.data).toMatchObject({
      resolution_status: 'CONNECTED',
      documentation_hits: []
    });
  });

  it('should handle default query parameter', async () => {
    const sensor = new Context7Sensor();
    const result = await sensor.sense();
    expect(result.observation?.query).toBe('');
  });

  it('should handle errors gracefully', async () => {
    const sensor = new Context7Sensor();
    
    // Force an error by mocking crypto.randomUUID
    const spy = vi.spyOn(crypto, 'randomUUID').mockImplementation(() => {
      throw new Error('Simulation of randomness collapse');
    });

    const result = await sensor.sense('faulty query');
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('Simulation of randomness collapse');
    
    spy.mockRestore();
  });

  it('should include exact tags in metadata', async () => {
    const sensor = new Context7Sensor();
    const result = await sensor.sense('vitest coverage');
    
    expect(result.observation?.metadata.tags).toEqual(['documentation', 'frameworks', 'v14']);
  });
});
