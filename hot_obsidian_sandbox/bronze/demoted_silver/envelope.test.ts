/**
 * Topic: System Disruption & Testing
 * Provenance: bronze/P4_DISRUPTION_KINETIC.md
 */
import { describe, it, expect } from 'vitest';
import { wrapInEnvelope, VacuoleEnvelope } from './envelope';

describe('VacuoleEnvelope', () => {
  it('should wrap payload in a valid envelope', () => {
    const payload = { data: 'test' };
    const envelope = wrapInEnvelope('TEST_001', payload);
    
    const result = VacuoleEnvelope.safeParse(envelope);
    expect(result.success).toBe(true);
    expect(envelope.mark).toBe('TEST_001');
  });
});
