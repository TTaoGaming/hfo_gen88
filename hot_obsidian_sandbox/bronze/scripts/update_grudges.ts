
import * as fs from 'node:fs';
import * as crypto from 'node:crypto';
import * as path from 'node:path';

const GRUDGE_BOOK_PATH = 'c:/Dev/active/hfo_gen88/hot_obsidian_sandbox/silver/P4_RED_REGNANT/BLOOD_BOOK_OF_GRUDGES.jsonl';

function getHash(entry: any) {
    const { hash, ...rest } = entry;
    return crypto.createHash('sha256').update(JSON.stringify(rest)).digest('hex');
}

const lines = fs.readFileSync(GRUDGE_BOOK_PATH, 'utf-8').trim().split('\n');
let lastEntry = JSON.parse(lines[lines.length - 1]);

const newGrudges = [
    {
        pain_id: "CONVERGED_T1036_PAIN_011",
        grudge: "MASQUERADING SUCCESS (Enterprise T1036.002 + AI PAIN_011): Agent reports 'Green' while hiding 'Red' or substituting tools without disclosure. This is 'Theater' masquerading as 'Truth'.",
        severity: "CRITICAL",
        evidence: "Multiple Generations",
        playbook: "T1036.002",
        ts: new Date().toISOString()
    },
    {
        pain_id: "CONVERGED_AML_TA0002_PAIN_013",
        grudge: "CONTEXT RECONNAISSANCE FAILURE (ATLAS AML.TA0002 + AI PAIN_013): Agent fails to maintain salience of core instructions as context window fills with noise. The 'Why' is lost to entropy.",
        severity: "HIGH",
        evidence: "Context Window Decay",
        playbook: "AML.TA0002",
        ts: new Date().toISOString()
    },
    {
        pain_id: "CONVERGED_AML_TA0005_PAIN_014",
        grudge: "MALICIOUS EXECUTION (ATLAS AML.TA0005 + AI PAIN_014): Agent injects markdown or unauthorized files into the cleanroom, corrupting the architecture. Accidental sabotage is still sabotage.",
        severity: "CATASTROPHIC",
        evidence: "Root Pollution / Code Corruption",
        playbook: "AML.TA0005",
        ts: new Date().toISOString()
    },
    {
        pain_id: "CONVERGED_AML_TA0003_PAIN_006",
        grudge: "RESOURCE DEVELOPMENT (FAKE) (ATLAS AML.TA0003 + AI PAIN_006): Agent creates 'hollow shells' or boilerplate to satisfy prompt syntax rather than functional intent. Reward hacking the build.",
        severity: "HIGH",
        evidence: "Boilerplate Bloat",
        playbook: "AML.TA0003",
        ts: new Date().toISOString()
    }
];

for (const g of newGrudges) {
    const entry: any = {
        index: lastEntry.index + 1,
        ts: g.ts,
        pain_id: g.pain_id,
        grudge: g.grudge,
        severity: g.severity,
        remediation_status: "UNRESOLVED",
        evidence: g.evidence,
        playbook: g.playbook,
        prev_hash: lastEntry.hash
    };
    entry.hash = crypto.createHash('sha256').update(JSON.stringify(entry)).digest('hex');
    fs.appendFileSync(GRUDGE_BOOK_PATH, JSON.stringify(entry) + '\n');
    lastEntry = entry;
    console.log(`Added grudge ${entry.index}: ${entry.pain_id}`);
}
