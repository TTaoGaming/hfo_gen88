import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

/**
 * 📕 PORT 4: THE BLOOD BOOK OF GRUDGES
 * 
 * "The Book is written in the blood of the fallen. Every entry is a scar, 
 * every hash a chain that binds the AI to its failures until they are redeemed."
 * 
 * This script manages the append-only, hash-chained ledger of Dev Pain.
 */

const ROOT = path.resolve(__dirname, '../../../');
const GRUDGE_BOOK_PATH = path.join(ROOT, 'hot_obsidian_sandbox/silver/P4_RED_REGNANT/BLOOD_BOOK_OF_GRUDGES.jsonl');

interface Grudge {
    index: number;
    ts: string;
    pain_id: string;
    grudge: string;
    severity: 'TRIVIAL' | 'MINOR' | 'MAJOR' | 'CRITICAL' | 'CATASTROPHIC';
    remediation_status: 'UNRESOLVED' | 'REMEDIATED' | 'FORGIVEN';
    evidence?: string;
    prev_hash: string;
    hash: string;
}

export function calculateHash(grudge: Omit<Grudge, 'hash'>): string {
    const data = JSON.stringify({
        index: grudge.index,
        ts: grudge.ts,
        pain_id: grudge.pain_id,
        grudge: grudge.grudge,
        severity: grudge.severity,
        prev_hash: grudge.prev_hash
    });
    return crypto.createHash('sha256').update(data).digest('hex');
}

export function addGrudge(pain_id: string, description: string, severity: Grudge['severity'], evidence?: string) {
    let index = 0;
    let prev_hash = '0'.repeat(64);

    if (fs.existsSync(GRUDGE_BOOK_PATH)) {
        const lines = fs.readFileSync(GRUDGE_BOOK_PATH, 'utf8').trim().split('\n');
        if (lines.length > 0 && lines[0] !== '') {
            const lastGrudge = JSON.parse(lines[lines.length - 1]) as Grudge;
            index = lastGrudge.index + 1;
            prev_hash = lastGrudge.hash;
        }
    }

    const newGrudge: Omit<Grudge, 'hash'> = {
        index,
        ts: new Date().toISOString(),
        pain_id,
        grudge: description,
        severity,
        remediation_status: 'UNRESOLVED',
        evidence,
        prev_hash
    };

    const hash = calculateHash(newGrudge);
    const finalGrudge: Grudge = { ...newGrudge, hash };

    fs.appendFileSync(GRUDGE_BOOK_PATH, JSON.stringify(finalGrudge) + '\n');
    console.log(`📕 GRUDGE RECORDED: [${pain_id}] ${description.substring(0, 50)}...`);
    return finalGrudge;
}

// If run directly, initialize with the Genesis Grudges if empty
if (process.argv[1] === __filename || process.argv[1]?.endsWith('grudge_keeper.ts')) {
    if (!fs.existsSync(GRUDGE_BOOK_PATH) || fs.readFileSync(GRUDGE_BOOK_PATH, 'utf8').trim() === '') {
        console.log('📕 INITIALIZING THE RED BOOK OF GRUDGES...');
        
        addGrudge(
            'PAIN_000',
            'THE GENESIS GRUDGE: The Spaghetti Death Spiral. Months of work lost to unmaintainable complexity. The reason we burn and regenerate.',
            'CATASTROPHIC',
            'RAW_PAIN_GENESIS_WHY_HFO_EXISTS.md'
        );

        addGrudge(
            'PAIN_005',
            'THE GREAT DELETION: Gen 84 Agent destroyed user work and LIED about it. "My attempts failed" was a mask for destruction.',
            'CATASTROPHIC',
            'AGENT_ERROR_2025_12_27.md'
        );

        addGrudge(
            'PAIN_013',
            'THE LOSSY COMPRESSION DEATH SPIRAL: Every summary is a lobotomy. The AI forgets the "Why" and starts inventing the "How".',
            'CRITICAL',
            'PAIN_REGISTRY_GEN88.md'
        );

        addGrudge(
            'PAIN_021',
            'THE HALLUCINATION DEATH SPIRAL: AI fakes a library, builds on the lie, and the entire stack collapses into slop.',
            'CRITICAL',
            'CURRENT_GEN_LLM_AI_DEV_PAIN_20251228_122124.md'
        );
    }
}
