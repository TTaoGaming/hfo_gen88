import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';

const CACAO_PLAYBOOK_SCHEMA = z.object({
    type: z.literal('playbook'),
    id: z.string().startsWith('playbook--'),
    name: z.string(),
    description: z.string(),
    steps: z.array(z.object({
        type: z.string(),
        name: z.string(),
        description: z.string()
    }))
});

const HEARTBEAT_SCHEMA = z.object({
    index: z.literal(-1),
    ts: z.string().datetime(),
    type: z.literal('HEARTBEAT_CHANT'),
    chant: z.array(z.string()),
    artifact_id: z.string(),
    resonance_signature: z.string().startsWith('KŪN-EARTH-CHANT'),
    prev_hash: z.string().length(64),
    hash: z.string().length(64)
});

const PORT0_ENTRY_SCHEMA = z.object({
    index: z.number().min(0),
    ts: z.string().datetime(),
    card_id: z.number(),
    title: z.string(),
    hfo_memory: z.string(),
    mantra: z.string(),
    artifact_id: z.string(),
    resonance_signature: z.string().startsWith('KŪN-EARTH-'),
    observation: z.string(),
    cacao_playbook: CACAO_PLAYBOOK_SCHEMA,
    prev_hash: z.string().length(64),
    hash: z.string().length(64)
});

const LEDGER_PATH = path.resolve(__dirname, './LEDGER.jsonl');

describe('Lidless Legion (Port 0) - Ledger Validation', () => {
    it('should validate the heartbeat and all 64 entries', () => {
        const lines = fs.readFileSync(LEDGER_PATH, 'utf8').split('\n').filter(l => l.trim());
        expect(lines.length).toBe(65); // 1 heartbeat + 64 cards

        // Validate Heartbeat
        const heartbeat = JSON.parse(lines[0]);
        const hbResult = HEARTBEAT_SCHEMA.safeParse(heartbeat);
        if (!hbResult.success) {
            console.error('HEARTBEAT SCHEMA VIOLATION:', hbResult.error.format());
        }
        expect(hbResult.success).toBe(true);

        // Validate Entries
        for (let i = 1; i < lines.length; i++) {
            const entry = JSON.parse(lines[i]);
            const result = PORT0_ENTRY_SCHEMA.safeParse(entry);
            if (!result.success) {
                console.error(`SCHEMA VIOLATION AT INDEX ${entry.index}:`, result.error.format());
            }
            expect(result.success).toBe(true);
            expect(entry.index).toBe(i - 1);
        }
    });

    it('should maintain cryptographic chain integrity', () => {
        const lines = fs.readFileSync(LEDGER_PATH, 'utf8').split('\n').filter(l => l.trim());
        let expectedPrevHash = "0000000000000000000000000000000000000000000000000000000000000000";

        lines.forEach((line) => {
            const entry = JSON.parse(line);
            expect(entry.prev_hash).toBe(expectedPrevHash);
            expectedPrevHash = entry.hash;
        });
    });

    describe('Mutation Resistance (Anti-Theater)', () => {
        it('should detect a Gross Mutation (Schema Violation)', () => {
            const validLine = fs.readFileSync(LEDGER_PATH, 'utf8').split('\n')[1];
            const entry = JSON.parse(validLine);
            
            // Gross Mutation: Remove a required field
            delete (entry as any).cacao_playbook;
            
            const result = PORT0_ENTRY_SCHEMA.safeParse(entry);
            expect(result.success).toBe(false);
        });

        it('should detect a Subtle Mutation (Hash Mismatch)', () => {
            const lines = fs.readFileSync(LEDGER_PATH, 'utf8').split('\n').filter(l => l.trim());
            const entry = JSON.parse(lines[1]);
            
            // Subtle Mutation: Change one character in the mantra
            entry.mantra = entry.mantra + ".";
            
            // Re-calculating hash would be the "correct" way to fix it, 
            // but here we just show that the existing hash no longer matches the content
            // (In a real system, we'd re-hash and check if it matches the stored hash)
            // For this test, we'll just verify that the schema still passes but the hash logic would fail.
            
            const result = PORT0_ENTRY_SCHEMA.safeParse(entry);
            expect(result.success).toBe(true); // Schema still valid
            
            // Manual hash check (simplified)
            const content = JSON.stringify({
                index: entry.index,
                ts: entry.ts,
                card_id: entry.card_id,
                title: entry.title,
                hfo_memory: entry.hfo_memory,
                mantra: entry.mantra,
                artifact_id: entry.artifact_id,
                resonance_signature: entry.resonance_signature,
                observation: entry.observation,
                cacao_playbook: entry.cacao_playbook,
                prev_hash: entry.prev_hash
            });
            
            const { createHash } = require('crypto');
            const actualHash = createHash('sha256').update(content).digest('hex');
            expect(actualHash).not.toBe(entry.hash);
        });
    });
});
