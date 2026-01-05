/**
 * 🥈 TEST: Port 1 Web Weaver
 * 
 * Authority: Web Weaver (The Interlocker)
 * Verb: FUSE
 * Topic: Integration & Bridging
 * Provenance: hot_obsidian_sandbox/bronze/P1_INTEGRATION_KINETIC.md
 */
import { describe, it, expect, vi } from 'vitest';
import { fuseSearch, sense } from './bridger.js';

describe('Port 1 Web Weaver', () => {
    it('should bridge to Port 0 search (RAW)', async () => {
        vi.mock('../P0_LIDLESS_LEGION/searcher.js', () => ({
            search: vi.fn().mockResolvedValue({ results: [] }),
            SearchResponseSchema: { parse: (d: unknown) => d } // Mock schema
        }));

        const results = await sense('test');
        expect(results.results).toBeDefined();
    });

    it('should fuse search results into a validated envelope', async () => {
        // We need to mock the searcher module properly
        vi.mock('../P0_LIDLESS_LEGION/searcher.js', async () => {
            const actual = await vi.importActual('../P0_LIDLESS_LEGION/searcher.js') as Record<string, unknown>;
            return {
                ...actual,
                search: vi.fn().mockResolvedValue({
                    results: [
                        { title: 'Test', url: 'http://test.com', content: 'content', score: 1.0 }
                    ]
                })
            };
        });

        const results = await fuseSearch('test');
        expect(results.results[0].title).toBe('Test');
    });
});
