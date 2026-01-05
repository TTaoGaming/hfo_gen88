/**
 * 🕸️ PORT 1: WEB WEAVER (The Bridger)
 * 
 * Authority: Web Weaver (The Interlocker)
 * Verb: FUSE
 * Topic: Integration & Bridging
 * Provenance: hot_obsidian_sandbox/bronze/P1_INTEGRATION_KINETIC.md
 * 
 * This port facilitates communication between isolated ports.
 * It is responsible for wrapping RAW sensor data in VacuoleEnvelopes.
 */

import { z } from 'zod';
import { search, SearchResponseSchema, type SearchResponse } from '../P0_LIDLESS_LEGION/searcher.js';

const VacuoleEnvelope = <T extends z.ZodTypeAny>(schema: T, data: unknown) => schema.parse(data);

/**
 * Fuses raw search data into a validated envelope.
 * @param query The search query.
 * @returns Validated SearchResponse.
 */
export async function fuseSearch(query: string): Promise<SearchResponse> {
    const rawData = await search(query);
    return VacuoleEnvelope(SearchResponseSchema, rawData);
}

/**
 * Bridge to Port 0 Search (Legacy/Direct).
 */
export async function sense(query: string): Promise<any> {
    return await search(query);
}
