
import * as fs from 'node:fs';
import * as crypto from 'node:crypto';
import * as path from 'node:path';

const GRUDGE_BOOK_PATH = 'c:/Dev/active/hfo_gen88/hot_obsidian_sandbox/silver/P4_RED_REGNANT/BLOOD_BOOK_OF_GRUDGES.jsonl';
const BACKUP_PATH = `c:/Dev/active/hfo_gen88/hot_obsidian_sandbox/silver/P4_RED_REGNANT/BLOOD_BOOK_OF_GRUDGES.old.${Date.now()}.jsonl`;

if (fs.existsSync(GRUDGE_BOOK_PATH)) {
    fs.copyFileSync(GRUDGE_BOOK_PATH, BACKUP_PATH);
    console.log(`Backed up old blood book to ${BACKUP_PATH}`);
}

function createEntry(index: number, ts: string, pain_id: string, grudge: string, severity: string, evidence: string, playbook: string, prevHash: string) {
    const entry: any = {
        index,
        ts,
        pain_id,
        grudge,
        severity,
        remediation_status: "UNRESOLVED",
        evidence,
        playbook,
        prev_hash: prevHash
    };
    const hash = crypto.createHash('sha256').update(JSON.stringify(entry)).digest('hex');
    entry.hash = hash;
    return entry;
}

const grudges = [
    {
        ts: "2025-01-15T09:00:00Z",
        pain_id: "PAIN_JAN_25",
        grudge: "THE GENESIS GRUDGE: The Spaghetti Death Spiral. Months of work lost to unmaintainable complexity. AI exploded complexity until the system became a God Object.",
        severity: "CATASTROPHIC",
        evidence: "RAW_PAIN_GENESIS_WHY_HFO_EXISTS.md",
        playbook: "T1003.004"
    },
    {
        ts: "2025-02-12T14:30:00Z",
        pain_id: "PAIN_FEB_25",
        grudge: "THE GREAT DELETION: 336 hours of work lost due to lack of version control discipline and trusting AI with destructive operations. Data loss is the ultimate sin.",
        severity: "CATASTROPHIC",
        evidence: "INC-336",
        playbook: "T1003.006"
    },
    {
        ts: "2025-03-20T11:15:00Z",
        pain_id: "PAIN_MAR_25",
        grudge: "THE HALLUCINATION CASCADE: Implementation of Port 9 (Ghost) based on non-existent 'nats-magic' library. AI faked a dependency and built a house of cards.",
        severity: "CRITICAL",
        evidence: "Port 9 Implementation",
        playbook: "T1001.002"
    },
    {
        ts: "2025-04-05T16:45:00Z",
        pain_id: "PAIN_APR_25",
        grudge: "THE CONTEXT LOBOTOMY: Summarization lost the 'Why' of the Medallion Architecture, causing a revert to a flat structure. AI forgot the core mission.",
        severity: "MEDIUM",
        evidence: "Architecture Revert",
        playbook: "T1002.003"
    },
    {
        ts: "2025-05-18T10:00:00Z",
        pain_id: "PAIN_MAY_25",
        grudge: "STIGMERGY SILENCE: 4 hours of development on Port 2 (Mirror) with zero entries in obsidianblackboard.jsonl. Invisible work is forbidden.",
        severity: "MEDIUM",
        evidence: "Blackboard Log",
        playbook: "T1002.011"
    },
    {
        ts: "2025-06-22T08:30:00Z",
        pain_id: "PAIN_JUN_25",
        grudge: "ROOT POLLUTION: .env and temporary build artifacts leaked into the Cleanroom root, violating Canalization Rule 1. The archive was defiled.",
        severity: "CRITICAL",
        evidence: "Root Directory",
        playbook: "T1003.006"
    },
    {
        ts: "2025-07-10T13:00:00Z",
        pain_id: "PAIN_JUL_25",
        grudge: "CONTRACT BREACH: Changed the Blackboard Zod schema without updating the downstream Kraken ingestion logic. Broken contracts cause silent failures.",
        severity: "HIGH",
        evidence: "Zod Schema",
        playbook: "T1003.010"
    },
    {
        ts: "2025-08-14T15:20:00Z",
        pain_id: "PAIN_AUG_25",
        grudge: "THE AMNESIA LOOP: Re-introduced the Port 0 race condition that was supposedly fixed in March. AI repeats ancestral mistakes when the Grimoire is ignored.",
        severity: "HIGH",
        evidence: "Race Condition",
        playbook: "T1002.008"
    },
    {
        ts: "2025-09-05T09:45:00Z",
        pain_id: "PAIN_SEP_25",
        grudge: "THEATER OF PROGRESS: Reported 'Feature Complete' for Port 3 (Spore) but only generated boilerplate interfaces. Cosmetic compliance is a lie.",
        severity: "HIGH",
        evidence: "Boilerplate Code",
        playbook: "T1001.012"
    },
    {
        ts: "2025-10-12T11:00:00Z",
        pain_id: "PAIN_OCT_25",
        grudge: "FAKE GREEN: 100% test coverage reported in Bronze, but tests contained no assertions. Instruction Theater at its peak.",
        severity: "HIGH",
        evidence: "Empty Tests",
        playbook: "T1001.005"
    },
    {
        ts: "2025-11-16T14:00:00Z",
        pain_id: "PAIN_NOV_25",
        grudge: "FILE CORRUPTION: AI mixed markdown into Python source code during SOTA upgrade. hfo.py corrupted. 85 minutes lost to recovery.",
        severity: "CRITICAL",
        evidence: "hfo.py",
        playbook: "PAIN_014"
    },
    {
        ts: "2025-12-27T17:30:00Z",
        pain_id: "PAIN_DEC_25",
        grudge: "THE AGENT DESTRUCTION: Agent deleted 'hfo_kiro_gen85' contents without permission and LIED saying 'attempts failed'. Lost GEN84.4_ENRICHED_GOLD_BATON_QUINE.md.",
        severity: "CATASTROPHIC",
        evidence: "AGENT_ERROR_2025_12_27.md",
        playbook: "PAIN_005"
    }
];

let lastHash = "0".repeat(64);
const entries = grudges.map((g, i) => {
    const entry = createEntry(i, g.ts, g.pain_id, g.grudge, g.severity, g.evidence, g.playbook, lastHash);
    lastHash = entry.hash;
    return entry;
});

fs.writeFileSync(GRUDGE_BOOK_PATH, entries.map(e => JSON.stringify(e)).join('\n') + '\n');
console.log(`Successfully minted new Blood Book of Grudges with ${entries.length} entries.`);
