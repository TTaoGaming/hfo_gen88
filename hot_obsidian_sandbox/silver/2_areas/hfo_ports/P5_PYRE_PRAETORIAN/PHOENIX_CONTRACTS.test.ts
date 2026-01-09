import { describe, it, expect } from 'vitest';
import { GOLDILOCKS, ArtifactContract, ArtifactMetadataSchema } from './PHOENIX_CONTRACTS.js';

describe('PHOENIX_CONTRACTS', () => {
    it('should have consistent Goldilocks thresholds', () => {
        expect(GOLDILOCKS.MIN).toBe(80);
        expect(GOLDILOCKS.TARGET).toBe(88);
        expect(GOLDILOCKS.MAX).toBe(99);
    });

    it('should validate correctly with ArtifactContract', () => {
        const valid = {
            filePath: 'test.ts',
            content: '// @port 5\n// @commander Pyre',
            meta: {
                port: 5,
                commander: 'Pyre'
            }
        };
        expect(() => ArtifactContract.parse(valid)).not.toThrow();
    });
});
