import { describe, it, expect, vi } from 'vitest';
import { Navigator } from './navigator.js';

vi.mock('../P1_WEB_WEAVER/bridger.js', () => ({
    sense: vi.fn()
}));

describe('Galois Lattice: Mathematical & Semantic Tension', () => {
    const navigator = new Navigator(8);

    it('should have no collisions in the 8x8 semantic manifold', () => {
        const purposes = new Set<string>();
        const roles = new Set<string>();

        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                // Accessing private method via any for verification
                const { role, purpose } = (navigator as any).resolveGaloisLattice(x, y);
                purposes.add(purpose);
                roles.add(role);
            }
        }

        // 8x8 = 64 unique combinations
        expect(purposes.size).toBe(64);
        expect(roles.size).toBe(64);
    });

    it('should correctly identify the HIVE Anti-Diagonal (X+Y=7)', () => {
        const expectedPhases = ['HUNT', 'INTERLOCK', 'VALIDATE', 'EVOLVE'];
        
        // Hunt: (0,7), (7,0) -> No, the logic in navigator.ts is:
        // if (x + y === 7) {
        //    if (x === 0 || x === 7) role = `HIVE Anti-Diagonal: HUNT (${commanderX} ↔ ${commanderY})`;
        //    ...
        // }

        const hunt1 = (navigator as any).resolveGaloisLattice(0, 7);
        expect(hunt1.role).toContain('HIVE Anti-Diagonal: HUNT');
        
        const interlock1 = (navigator as any).resolveGaloisLattice(1, 6);
        expect(interlock1.role).toContain('HIVE Anti-Diagonal: INTERLOCK');

        const validate1 = (navigator as any).resolveGaloisLattice(2, 5);
        expect(validate1.role).toContain('HIVE Anti-Diagonal: VALIDATE');

        const evolve1 = (navigator as any).resolveGaloisLattice(3, 4);
        expect(evolve1.role).toContain('HIVE Anti-Diagonal: EVOLVE');
    });

    it('should correctly identify the Legendary Diagonal (X=Y)', () => {
        for (let i = 0; i < 8; i++) {
            const { role, purpose } = (navigator as any).resolveGaloisLattice(i, i);
            expect(role).toContain('Legendary Diagonal');
            // e.g., "Meta-sensing. Calibrating sensors and verifying ISR integrity."
        }
    });
});
