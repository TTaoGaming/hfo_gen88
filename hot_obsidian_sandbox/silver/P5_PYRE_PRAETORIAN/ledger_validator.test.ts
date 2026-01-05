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
    resonance_signature: z.string().startsWith('LÍ-FIRE-CHANT'),
    prev_hash: z.string().length(64),
    hash: z.string().length(64)
});

const PORT5_ENTRY_SCHEMA = z.object({
    index: z.number().min(0),
    ts: z.string().datetime(),
    card_id: z.number(),
    title: z.string(),
    hfo_memory: z.string(),
    mantra: z.string(),
    artifact_id: z.string(),
    resonance_signature: z.string().startsWith('LÍ-FIRE-'),
    immunization: z.string(),
    cacao_playbook: CACAO_PLAYBOOK_SCHEMA,
    prev_hash: z.string().length(64),
    hash: z.string().length(64)
});

const LEDGER_PATH = path.resolve(__dirname, './LEDGER.jsonl');

describe('Pyre Praetorian (Port 5) - Ledger Validation', () => {
    it('should validate the heartbeat and all 64 entries', () => {
        const lines = fs.readFileSync(LEDGER_PATH, 'utf8').split('\n').filter(l => l.trim());
        expect(lines.length).toBe(65);

        const heartbeat = JSON.parse(lines[0]);
        expect(HEARTBEAT_SCHEMA.safeParse(heartbeat).success).toBe(true);

        for (let i = 1; i < lines.length; i++) {
            const entry = JSON.parse(lines[i]);
            const result = PORT5_ENTRY_SCHEMA.safeParse(entry);
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
});
