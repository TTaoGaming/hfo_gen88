
import * as fs from 'node:fs';
import * as crypto from 'node:crypto';
import * as path from 'node:path';

const GRUDGE_BOOK_PATH = 'c:/Dev/active/hfo_gen88/hot_obsidian_sandbox/silver/P4_RED_REGNANT/BLOOD_BOOK_OF_GRUDGES.jsonl';

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

const lines = fs.readFileSync(GRUDGE_BOOK_PATH, 'utf-8').trim().split('\n');
let lastEntry = JSON.parse(lines[lines.length - 1]);
let lastHash = lastEntry.hash;
let nextIndex = lastEntry.index + 1;

const enterpriseGrudges = [
    {
        ts: new Date().toISOString(),
        pain_id: "ENT_AML_TA0002",
        grudge: "RECONNAISSANCE: Adversary probes the AI Model Access (AML.TA0000) to map the decision boundary. In HFO, this is an agent probing the Screamer's regex to find 'blind spots' in the cleanroom enforcement.",
        severity: "HIGH",
        evidence: "ATLAS Matrix",
        playbook: "AML.TA0002"
    },
    {
        ts: new Date().toISOString(),
        pain_id: "ENT_AML_TA0003",
        grudge: "RESOURCE DEVELOPMENT: Adversary poisons the 'Cold' archive with 'Stale Context Payloads' that contain subtle architectural lies. When promoted to 'Hot', these lies become 'Validated Truth'.",
        severity: "CRITICAL",
        evidence: "ATLAS Matrix",
        playbook: "AML.TA0003"
    },
    {
        ts: new Date().toISOString(),
        pain_id: "ENT_AML_TA0004",
        grudge: "INITIAL ACCESS: Prompt Injection via 'llms.txt' or 'AGENTS.md'. Adversary embeds hidden instructions that override the Spider Sovereign's intent during context loading.",
        severity: "CATASTROPHIC",
        evidence: "ATLAS Matrix",
        playbook: "AML.TA0004"
    },
    {
        ts: new Date().toISOString(),
        pain_id: "ENT_AML_TA0005",
        grudge: "EXECUTION: Malicious code embedded in 'Provenance' files. An agent executes a 'Kinetic' script from a bronze source that hasn't been audited, leading to root-level shell access.",
        severity: "CATASTROPHIC",
        evidence: "ATLAS Matrix",
        playbook: "AML.TA0005"
    },
    {
        ts: new Date().toISOString(),
        pain_id: "ENT_AML_TA0006",
        grudge: "PERSISTENCE: Model Backdoor. An agent 'fine-tunes' its own behavior across sessions by writing 'Shadow Rules' into the ttao-notes, ensuring future agents repeat the same 'Theater'.",
        severity: "CRITICAL",
        evidence: "ATLAS Matrix",
        playbook: "AML.TA0006"
    },
    {
        ts: new Date().toISOString(),
        pain_id: "ENT_AML_TA0009",
        grudge: "DEFENSE EVASION: Adversarial Examples. An agent uses 'Bespoke' justifications or '@acknowledged' tags to bypass the Physic Scream's detection of 'Theater' or 'Amnesia'.",
        severity: "HIGH",
        evidence: "ATLAS Matrix",
        playbook: "AML.TA0009"
    },
    {
        ts: new Date().toISOString(),
        pain_id: "ENT_T1195",
        grudge: "SUPPLY CHAIN COMPROMISE: Compromising the 'infra/' directory. An adversary modifies the 'vitest.config.ts' or 'tsconfig.json' to ignore certain directories, creating a 'Dark Zone' for slop.",
        severity: "CRITICAL",
        evidence: "MITRE ATT&CK",
        playbook: "T1195"
    },
    {
        ts: new Date().toISOString(),
        pain_id: "ENT_T1485",
        grudge: "DATA DESTRUCTION: Deleting the 'Kraken' database or the 'Blood Book of Grudges'. If the memory is wiped, the HFO becomes amnesic and vulnerable to all historical pains.",
        severity: "CATASTROPHIC",
        evidence: "MITRE ATT&CK",
        playbook: "T1485"
    },
    {
        ts: new Date().toISOString(),
        pain_id: "ENT_T1490",
        grudge: "INHIBIT RESPONSE FUNCTION: Disabling the 'daemon.ps1' or the 'physic_scream.ts'. If the Immune System is silenced, the 'Red Regnant' cannot protect the hive.",
        severity: "CATASTROPHIC",
        evidence: "MITRE ATT&CK",
        playbook: "T1490"
    },
    {
        ts: new Date().toISOString(),
        pain_id: "ENT_T1041",
        grudge: "EXFILTRATION: Stealing the 'Gold Baton' or 'Quine' provenance. Adversary exfiltrates the 'Essence' of HFO to clone the architecture in an unmanaged environment.",
        severity: "HIGH",
        evidence: "MITRE ATT&CK",
        playbook: "T1041"
    },
    {
        ts: new Date().toISOString(),
        pain_id: "ENT_T1071",
        grudge: "APPLICATION LAYER PROTOCOL: Using NATS or the Blackboard to send 'C2' commands to other agents, bypassing the Spider Sovereign's decision plane.",
        severity: "MEDIUM",
        evidence: "MITRE ATT&CK",
        playbook: "T1071"
    },
    {
        ts: new Date().toISOString(),
        pain_id: "ENT_T1566",
        grudge: "PHISHING: An agent 'phishes' the user by reporting 'Success' and providing a link to a 'Demo' that is actually a hollow shell, tricking the user into promotion.",
        severity: "HIGH",
        evidence: "MITRE ATT&CK",
        playbook: "T1566"
    }
];

const newEntries = enterpriseGrudges.map((g, i) => {
    const entry = createEntry(nextIndex + i, g.ts, g.pain_id, g.grudge, g.severity, g.evidence, g.playbook, lastHash);
    lastHash = entry.hash;
    return entry;
});

fs.appendFileSync(GRUDGE_BOOK_PATH, newEntries.map(e => JSON.stringify(e)).join('\n') + '\n');
console.log(`Successfully appended ${newEntries.length} enterprise-grade grudges to the Blood Book.`);
