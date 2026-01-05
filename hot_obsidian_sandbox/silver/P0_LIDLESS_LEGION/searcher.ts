/**
 * 👁️ PORT 0: LIDLESS LEGION (The Searcher)
 * 
 * Authority: Lidless Legion (The Sensor)
 * Verb: SENSE
 * Topic: Web Search & Perception
 * @provenance hot_obsidian_sandbox/bronze/P0_WEB_SEARCH_KINETIC.md
 * 
 * This port provides the "Lidless" gaze into the digital world via Tavily.
 * @sensor RAW acquisition only. Wrapping is handled by Port 1.
 */

import { z } from 'zod';
// import * as dotenv from 'dotenv';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root
// dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const SearchResultSchema = z.object({
    title: z.string(),
    url: z.string(),
    content: z.string(),
    score: z.number()
});

export const SearchResponseSchema = z.object({
    results: z.array(SearchResultSchema)
});

export type SearchResponse = z.infer<typeof SearchResponseSchema>;

/**
 * Performs a web search using Tavily.
 * @param query The search query.
 * @returns A list of search results (RAW).
 */
export async function search(query: string): Promise<any> {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
        throw new Error('TAVILY_API_KEY not found in environment.');
    }

    const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            api_key: apiKey,
            query,
            search_depth: 'advanced',
            include_answer: true,
            max_results: 5
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Tavily search failed: ${error}`);
    }

    return await response.json();
}
