import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Agent } from '@mastra/core';
// @ts-ignore - Expected Red (Missing Packages)
import { Memory } from '@mastra/memory';
// @ts-ignore - Expected Red (Missing Packages)
import { LibSQLStore } from '@mastra/libsql';
import fs from 'fs';
import path from 'path';

/**
 * SOVEREIGN PERSISTENCE TDD TEST (RUN RED)
 * 
 * Goal: Verify that the Digital Twin can persist its "Soul" (context payloads)
 * across restarts using a hard-state LibSQL database.
 * 
 * Validates: PORT-7-SS-01 (Sovereign Context Survival)
 */

describe('Sovereign Persistence (Digital Twin)', () => {
    const DB_PATH = path.resolve(__dirname, './test_soul.db');

    beforeEach(() => {
        if (fs.existsSync(DB_PATH)) {
            fs.unlinkSync(DB_PATH);
        }
    });

    afterEach(() => {
        if (fs.existsSync(DB_PATH)) {
            fs.unlinkSync(DB_PATH);
        }
    });

    it('should persist a soul segment and recall it after instance destruction', async () => {
        const SOUL_SEGMENT = "GEN88: Biological swarm projection - billion cells in concert.";
        const AGENT_ID = "hfo-sovereign-twin";

        // 1. Setup Initial Incarnation
        const store = new LibSQLStore({
            id: "test-store",
            url: `file:${DB_PATH}`,
        });

        const memory = new Memory({
            storage: store,
        });

        const twinV1 = new Agent({
            id: AGENT_ID,
            name: "Spider Sovereign V1",
            memory: memory,
        });

        // 2. "Inscribe" the soul segment into memory
        // This simulates the agent 'remembering' a key philosophical anchor
        await twinV1.memory.save({
            content: SOUL_SEGMENT,
            metadata: { type: 'SOUL_ANCHOR', gen: 88 }
        });

        console.log('[TDD] Incarnation V1: Soul inscribed.');

        // 3. Destroy V1
        // (In-memory references cleared)
        
        // 4. Setup Second Incarnation (pointing to same hard state)
        const reloadedStore = new LibSQLStore({
            id: "test-store",
            url: `file:${DB_PATH}`,
        });

        const reloadedMemory = new Memory({
            storage: reloadedStore,
        });

        const twinV2 = new Agent({
            id: AGENT_ID,
            name: "Spider Sovereign V2",
            memory: reloadedMemory,
        });

        // 5. ASSERT: The Digital Twin recalls the biological projection
        const recalledMemories = await twinV2.memory.query({
            filter: { type: 'SOUL_ANCHOR' }
        });

        expect(recalledMemories).toBeDefined();
        expect(recalledMemories.length).toBeGreaterThan(0);
        expect(recalledMemories[0].content).toContain("billion cells");
        
        console.log('[TDD] Incarnation V2: Soul recalled. Persistence Verified.');
    });
});
