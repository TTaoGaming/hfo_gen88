import { describe, it, expect, vi } from 'vitest';
import { search } from './searcher.js';

/**
 * 🥈 TEST: Port 0 Lidless Legion
 * 
 * Authority: Lidless Legion (The Sensor)
 * Verb: SENSE
 * Topic: Gesture Control Plane
 * Provenance: hot_obsidian_sandbox/bronze/P0_GESTURE_KINETIC_DRAFT.md
 */

describe('Port 0 Lidless Legion', () => {
    it('should throw error if API key is missing', async () => {
        const originalKey = process.env.TAVILY_API_KEY;
        delete process.env.TAVILY_API_KEY;
        
        await expect(search('test')).rejects.toThrow('TAVILY_API_KEY not found in environment.');
        
        process.env.TAVILY_API_KEY = originalKey;
    });

    it('should call Tavily API and return results', async () => {
        const mockResponse = {
            results: [
                { title: 'Test Result', url: 'https://test.com', content: 'Test content', score: 0.9 }
            ]
        };

        // Mock fetch
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockResponse)
        });

        process.env.TAVILY_API_KEY = 'test-key';
        const results = await search('test query');

        expect(results.results).toHaveLength(1);
        expect(results.results[0].title).toBe('Test Result');
        expect(global.fetch).toHaveBeenCalledWith('https://api.tavily.com/search', expect.any(Object));
    });
});
