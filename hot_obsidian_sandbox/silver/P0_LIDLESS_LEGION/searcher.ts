/**
 * 👁️ PORT 0: LIDLESS LEGION (The Searcher)
 * 
 * Authority: Lidless Legion (The Sensor)
 * Verb: SENSE
 * Topic: Web Search & Perception
 * Provenance: hot_obsidian_sandbox/bronze/P0_GESTURE_KINETIC_DRAFT.md
 * 
 * This port provides the "Lidless" gaze into the digital world via Tavily.
 */

import { z } from 'zod';
import * as dotenv from 'dotenv';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const VacuoleEnvelope = <T extends z.ZodTypeAny>(schema: T, data: unknown) => schema.parse(data);

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
 * @returns A list of search results.
 */
export async function search(query: string): Promise<SearchResponse> {
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
            search_depth: 'smart',
            include_answer: true,
            max_results: 5
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Tavily search failed: ${error}`);
    }

    const data = await response.json();
    return VacuoleEnvelope(SearchResponseSchema, data);
}
