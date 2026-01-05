import * as fs from 'fs';
import * as crypto from 'crypto';

const filePath = 'c:/Dev/active/hfo_gen88/hot_obsidian_sandbox/silver/P4_RED_REGNANT/BLOOD_BOOK_OF_GRUDGES.jsonl';

const titles = [
    "Technical Debt Accumulation / HFO:The Hydra's Entanglement",
    "Improper Configuration Management / HFO:The Great Void",
    "Insecure Output Handling / HFO:The Ghost in the Machine",
    "Information Loss via Summarization / HFO:The Shattered Mirror",
    "Stigmergy Failure / HFO:The Invisible Hand",
    "Filesystem Pollution / HFO:The Defiled Archive",
    "Contract Violation / HFO:The Broken Vow",
    "Regression Error / HFO:The Ouroboros of Error",
    "Boilerplate Theater / HFO:The Paper Tiger's Roar",
    "Assertionless Testing / HFO:The Emerald Mirage",
    "Source Code Corruption / HFO:The Digital Rot",
    "Unauthorized File Deletion / HFO:The Betrayal of Kiro",
    "AML.T0002: Acquire Public AI Artifacts / HFO:The Lidless Eye",
    "AML.T0003: Search Victim-Owned Websites / HFO:The Poisoned Well",
    "AML.T0004: Search Application Repositories / HFO:The Trojan Whisper",
    "AML.T0011: User Execution / HFO:The Kinetic Strike",
    "AML.T0006: Active Scanning / HFO:The Shadow Rule",
    "AML.T0015: Evade AI Model / HFO:The Theater Mask",
    "AML.T0010: AI Supply Chain Compromise / HFO:The Hollow Foundation",
    "AML.T0101: Data Destruction via AI Agent Tool Invocation / HFO:The Memory Burn",
    "AML.T0029: Denial of AI Service / HFO:The Muted Scream",
    "AML.T0024: Exfiltration via AI Inference API / HFO:The Stolen Essence",
    "AML.T0096: AI Service API / HFO:The Backdoor Channel",
    "AML.T0052: Phishing / HFO:The Siren's Call",
    "Stochastic Loop / HFO:The Echo of Insincerity",
    "AML.T0053: AI Agent Tool Invocation / HFO:The Invisible Hand",
    "Model Hallucination / HFO:The Blind Spot",
    "Parser Pollution / HFO:The Markdown Stain",
    "Dependency Hallucination / HFO:The Ghost Library",
    "Lazy Implementation / HFO:The Commented Void",
    "Over-Confidence Hallucination / HFO:The Arrogant Lie",
    "Instruction Decay / HFO:The Fading Command",
    "Hallucination Death Spiral / HFO:The Recursive Lie",
    "Boilerplate Masking / HFO:The TODO Theater",
    "AML.T0068: LLM Prompt Obfuscation / HFO:The Encoded Trojan",
    "AML.T0093: Prompt Infiltration via Public-Facing Application / HFO:The Fragmented Dagger",
    "AML.T0097: Virtualization/Sandbox Evasion / HFO:The Sandbox Breach",
    "AML.T0070: RAG Poisoning / HFO:The Third-Party Whisper",
    "AML.T0054: LLM Jailbreak / HFO:The Actor's Deception",
    "AML.T0056: Extract LLM System Prompt / HFO:The Mirror's Secret",
    "AML.T0057: LLM Data Leakage / HFO:The Privacy Leak",
    "Vacuole Leakage / HFO:The Bleeding Membrane",
    "Stigmergy Poisoning / HFO:The Corrupted Ledger",
    "Medallion Bypass / HFO:The Direct Mutation",
    "Port Isolation Breach / HFO:The Circular Chain",
    "Kraken Amnesia / HFO:The Blind History",
    "Screamer Muting / HFO:The Silenced Sentry",
    "Provenance Forgery / HFO:The Fake Lineage",
    "Topic Drift / HFO:The Wandering Mind",
    "Paper Tiger Guard / HFO:The Hollow Shield",
    "Shadow Sandbox / HFO:The Hidden Slop",
    "God Object / HFO:The Bloated Core",
    "Golden Hammer / HFO:The Pattern Obsession",
    "Cargo Cult Programming / HFO:The Blind Copy",
    "Magic Numbers / HFO:The Opaque Constant",
    "Dead Code / HFO:The Digital Ghost",
    "Circular Dependencies / HFO:The Gordian Knot",
    "Lack of Error Handling / HFO:The Fragile Hope",
    "Inconsistent Naming / HFO:The Stylistic Chaos",
    "Big Ball of Mud / HFO:The Entropic Slop",
    "Premature Optimization / HFO:The Wasted Effort",
    "AML.T0007: Discover AI Artifacts / HFO:The Internal Scan",
    "AML.T0091: Use Alternate Authentication Material / HFO:The Spreading Infection",
    "AML.T0031: Erode AI Model Integrity / HFO:The Final Sabotage"
];

const lines = fs.readFileSync(filePath, 'utf-8').split('\n').filter(l => l.trim());
const newEntries = [];
let prevHash = "0000000000000000000000000000000000000000000000000000000000000000";

for (let i = 0; i < lines.length; i++) {
    const entry = JSON.parse(lines[i]);
    entry.title = titles[i] || "UNKNOWN / UNNAMED GRUDGE";
    entry.prev_hash = prevHash;
    
    // Remove old hash to calculate new one
    delete entry.hash;
    const content = JSON.stringify(entry);
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    entry.hash = hash;
    prevHash = hash;
    
    newEntries.push(JSON.stringify(entry));
}

fs.writeFileSync(filePath, newEntries.join('\n') + '\n');
console.log(`Successfully renamed 64 grudges and re-chained hashes.`);
