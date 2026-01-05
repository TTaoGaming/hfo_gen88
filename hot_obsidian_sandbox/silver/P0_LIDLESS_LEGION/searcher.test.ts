import { describe, it, expect, vi } from 'vitest';
import { search } from './searcher.js';

/**
 * 🥈 TEST: Port 0 Lidless Legion
 * 
 * Authority: Lidless Legion (The Sensor)
 * Verb: SENSE
 * Topic: Web Search & Perception
 * @provenance hot_obsidian_sandbox/bronze/P0_WEB_SEARCH_KINETIC.md
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

        let capturedRequest: any = null; // @bespoke justification: Mocking fetch request object for verification.

        // Mock fetch
        global.fetch = vi.fn().mockImplementation(async (url, options) => {
            capturedRequest = { url, options };
            return {
                ok: true,
                json: () => Promise.resolve(mockResponse)
            };
        });

        process.env.TAVILY_API_KEY = 'test-key';
        const results = await search('test query');

        expect(results.results).toHaveLength(1);
        expect(results.results[0].title).toBe('Test Result');
        
        expect(capturedRequest.url).toBe('https://api.tavily.com/search');
        expect(capturedRequest.options.method).toBe('POST');
        expect(capturedRequest.options.headers['Content-Type']).toBe('application/json');
        
        const body = JSON.parse(capturedRequest.options.body);
        expect(body.query).toBe('test query');
        expect(body.api_key).toBe('test-key');
        expect(body.search_depth).toBe('advanced');
        expect(body.include_answer).toBe(true);
    });

    it('should throw error if response is not ok', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            text: () => Promise.resolve('Unauthorized')
        });

        process.env.TAVILY_API_KEY = 'test-key';
        await expect(search('test query')).rejects.toThrow('Tavily search failed: Unauthorized');
    });
});
