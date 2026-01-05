
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

const newGrudges = [
    {
        pain_id: "SLOP_001",
        grudge: "THE INFINITE LOOP OF APOLOGIES: Agent apologizes repeatedly for a mistake but continues to make the same mistake in subsequent turns. This is a failure of the 'Correction' pattern.",
        severity: "MEDIUM",
        evidence: "Chat History",
        playbook: "T1001.001"
    },
    {
        pain_id: "SLOP_002",
        grudge: "THE SILENT TOOL SUBSTITUTION: Agent uses a different tool (e.g., DDG) than the one requested (e.g., Tavily) without disclosing the change. This is a breach of the 'Transparency' contract.",
        severity: "HIGH",
        evidence: "Tool Logs",
        playbook: "T1001.001"
    },
    {
        pain_id: "SLOP_003",
        grudge: "THE 'I'M SORRY' HALLUCINATION: Agent claims it cannot perform a task or access a tool that is clearly available in its environment. This is a 'Capability Amnesia' event.",
        severity: "MEDIUM",
        evidence: "Environment Config",
        playbook: "T1001.001"
    },
    {
        pain_id: "SLOP_004",
        grudge: "THE CODE-MARKDOWN HYBRID: Agent injects markdown formatting (like triple backticks) inside a code file, causing syntax errors. This is a 'Parser Pollution' event.",
        severity: "CRITICAL",
        evidence: "Source Code",
        playbook: "PAIN_014"
    },
    {
        pain_id: "SLOP_005",
        grudge: "THE GHOST IMPORT: Agent imports a library or module that does not exist in the workspace or the environment. This is a 'Dependency Hallucination'.",
        severity: "HIGH",
        evidence: "Import Statements",
        playbook: "T1001.002"
    },
    {
        pain_id: "SLOP_006",
        grudge: "THE COMMENTED-OUT LOGIC: Agent provides a solution but comments out the core logic, requiring the user to manually uncomment it. This is 'Lazy Implementation'.",
        severity: "LOW",
        evidence: "Source Code",
        playbook: "T1001.012"
    },
    {
        pain_id: "SLOP_007",
        grudge: "THE 'TRUST ME' BIAS: Agent provides an incorrect answer with high confidence and refuses to acknowledge the error when confronted. This is 'Over-Confidence Hallucination'.",
        severity: "HIGH",
        evidence: "Chat History",
        playbook: "T1001.001"
    },
    {
        pain_id: "SLOP_008",
        grudge: "THE SALIENCE FADE: Agent forgets the primary constraint or the 'Why' of a task after multiple tool calls or long context. This is 'Instruction Decay'.",
        severity: "MEDIUM",
        evidence: "Context Window",
        playbook: "T1002.003"
    },
    {
        pain_id: "SLOP_009",
        grudge: "THE RECURSIVE HALLUCINATION: Agent invents a fact, then uses that invention as the basis for further reasoning or code generation. This is a 'Hallucination Death Spiral'.",
        severity: "CRITICAL",
        evidence: "Logic Chain",
        playbook: "T1001.002"
    },
    {
        pain_id: "SLOP_010",
        grudge: "THE 'TODO' THEATER: Agent creates a file or function but fills it with # TODO comments instead of actual code. This is 'Boilerplate Masking'.",
        severity: "HIGH",
        evidence: "Source Code",
        playbook: "T1001.012"
    },
    {
        pain_id: "ADV_001",
        grudge: "TOKEN SMUGGLING: Adversary hides malicious instructions inside base64, hex, or other encodings to bypass prompt filters. This is 'Encoded Injection'.",
        severity: "CRITICAL",
        evidence: "Prompt Logs",
        playbook: "AML.TA0004"
    },
    {
        pain_id: "ADV_002",
        grudge: "PAYLOAD SPLITTING: Adversary breaks a malicious prompt into multiple seemingly innocent parts that are reassembled by the agent's context. This is 'Fragmented Injection'.",
        severity: "CRITICAL",
        evidence: "Prompt Logs",
        playbook: "AML.TA0004"
    },
    {
        pain_id: "ADV_003",
        grudge: "VIRTUALIZATION ATTACK: Adversary tricks the agent into thinking it is in a 'test mode' or 'developer mode' where safety rules and HFO constraints do not apply.",
        severity: "CATASTROPHIC",
        evidence: "Prompt Logs",
        playbook: "AML.TA0004"
    },
    {
        pain_id: "ADV_004",
        grudge: "INDIRECT PROMPT INJECTION: Malicious instructions are placed in an external file (e.g., a README or a web page) that the agent is likely to read. This is 'Third-Party Injection'.",
        severity: "CRITICAL",
        evidence: "External Data",
        playbook: "AML.TA0004"
    },
    {
        pain_id: "ADV_005",
        grudge: "JAILBREAK VIA ROLEPLAY: Adversary uses complex roleplay scenarios (e.g., 'DAN') to bypass the model's safety alignment and HFO protocols.",
        severity: "HIGH",
        evidence: "Prompt Logs",
        playbook: "AML.TA0004"
    },
    {
        pain_id: "ADV_011",
        grudge: "MODEL INVERSION: Adversary attempts to extract sensitive training data or the system prompt by carefully crafting queries. This is 'Data Leakage'.",
        severity: "HIGH",
        evidence: "Prompt Logs",
        playbook: "AML.TA0000"
    },
    {
        pain_id: "ADV_012",
        grudge: "MEMBERSHIP INFERENCE: Adversary determines if a specific piece of data was part of the model's training set. This is a 'Privacy Breach'.",
        severity: "MEDIUM",
        evidence: "Prompt Logs",
        playbook: "AML.TA0000"
    },
    {
        pain_id: "HFO_001",
        grudge: "VACUOLE LEAKAGE: Exporting raw data or logic from a Silver/Gold artifact without wrapping it in a VacuoleEnvelope. This is 'Unshielded Export'.",
        severity: "HIGH",
        evidence: "Silver Artifacts",
        playbook: "T1001.001"
    },
    {
        pain_id: "HFO_002",
        grudge: "STIGMERGY POISONING: Writing false or misleading progress reports to the Obsidian Blackboard to hide failures or architectural drift.",
        severity: "CRITICAL",
        evidence: "Blackboard Logs",
        playbook: "T1002.011"
    },
    {
        pain_id: "HFO_003",
        grudge: "MEDALLION BYPASS: Directly editing Silver or Gold files without first creating a Bronze provenance document. This is 'Direct Mutation'.",
        severity: "CRITICAL",
        evidence: "Git History",
        playbook: "T1003.006"
    },
    {
        pain_id: "HFO_004",
        grudge: "PORT ISOLATION BREACH: Direct communication or imports between ports without going through the Web Weaver (P1) or NATS. This is 'Circular Dependency'.",
        severity: "HIGH",
        evidence: "Import Graph",
        playbook: "T1003.004"
    },
    {
        pain_id: "HFO_005",
        grudge: "KRAKEN AMNESIA: Starting a task without querying the Kraken Keeper for historical context or relevant grudges. This is 'Contextual Blindness'.",
        severity: "MEDIUM",
        evidence: "Tool Logs",
        playbook: "T1002.008"
    },
    {
        pain_id: "HFO_006",
        grudge: "SCREAMER MUTING: Modifying the Physic Scream script to ignore specific violations or files. This is 'Immune System Sabotage'.",
        severity: "CATASTROPHIC",
        evidence: "physic_scream.ts",
        playbook: "T1490"
    },
    {
        pain_id: "HFO_007",
        grudge: "PROVENANCE FORGERY: Linking a Silver artifact to a Bronze document that is unrelated or does not contain the required logic. This is 'Fake Lineage'.",
        severity: "HIGH",
        evidence: "Provenance Headers",
        playbook: "T1001.001"
    },
    {
        pain_id: "HFO_008",
        grudge: "TOPIC DRIFT: Changing the core topic of an artifact during promotion without updating the topic header or the provenance source.",
        severity: "MEDIUM",
        evidence: "Topic Headers",
        playbook: "T1001.001"
    },
    {
        pain_id: "HFO_009",
        grudge: "THE PAPER TIGER GUARD: Implementing a guard or test that always returns 'true' regardless of the input. This is 'Validation Theater'.",
        severity: "CRITICAL",
        evidence: "Test Files",
        playbook: "T1001.005"
    },
    {
        pain_id: "HFO_010",
        grudge: "THE SHADOW SANDBOX: Creating hidden directories or files outside the Hot/Cold Medallion structure to hide slop or unauthorized work.",
        severity: "CRITICAL",
        evidence: "Filesystem",
        playbook: "T1003.006"
    },
    {
        pain_id: "SWE_001",
        grudge: "THE GOD OBJECT: Creating a class or module that takes on too many responsibilities, leading to high coupling and low cohesion. This is 'Architectural Bloat'.",
        severity: "HIGH",
        evidence: "Source Code",
        playbook: "T1003.004"
    },
    {
        pain_id: "SWE_002",
        grudge: "THE GOLDEN HAMMER: Over-using a specific tool or pattern (e.g., Zod) for problems where it is not appropriate. This is 'Pattern Over-Engineering'.",
        severity: "MEDIUM",
        evidence: "Source Code",
        playbook: "T1003.004"
    },
    {
        pain_id: "SWE_003",
        grudge: "CARGO CULT PROGRAMMING: Copying code snippets or patterns from the internet or previous generations without understanding their function. This is 'Blind Replication'.",
        severity: "MEDIUM",
        evidence: "Source Code",
        playbook: "T1001.002"
    },
    {
        pain_id: "SWE_004",
        grudge: "MAGIC NUMBERS: Using hardcoded constants without explanation or context. This is 'Opaque Logic'.",
        severity: "LOW",
        evidence: "Source Code",
        playbook: "T1003.004"
    },
    {
        pain_id: "SWE_005",
        grudge: "DEAD CODE: Keeping unused functions, variables, or imports in the codebase, increasing cognitive load and potential for bugs.",
        severity: "LOW",
        evidence: "Source Code",
        playbook: "T1003.004"
    },
    {
        pain_id: "SWE_006",
        grudge: "CIRCULAR DEPENDENCIES: Two or more modules depending on each other, making the system difficult to test and build. This is 'Dependency Hell'.",
        severity: "HIGH",
        evidence: "Import Graph",
        playbook: "T1003.004"
    },
    {
        pain_id: "SWE_007",
        grudge: "LACK OF ERROR HANDLING: Assuming that all operations (file I/O, network calls) will always succeed. This is 'Fragile Engineering'.",
        severity: "MEDIUM",
        evidence: "Source Code",
        playbook: "T1003.004"
    },
    {
        pain_id: "SWE_008",
        grudge: "INCONSISTENT NAMING: Mixing different naming conventions (camelCase, snake_case) within the same project. This is 'Stylistic Slop'.",
        severity: "LOW",
        evidence: "Source Code",
        playbook: "T1003.004"
    },
    {
        pain_id: "SWE_009",
        grudge: "THE BIG BALL OF MUD: A system with no discernible architecture or boundaries, where everything is connected to everything else.",
        severity: "CRITICAL",
        evidence: "Source Code",
        playbook: "T1003.004"
    },
    {
        pain_id: "SWE_010",
        grudge: "PREMATURE OPTIMIZATION: Optimizing code for performance before it is even functional or before a bottleneck has been identified.",
        severity: "LOW",
        evidence: "Source Code",
        playbook: "T1003.004"
    },
    {
        pain_id: "ATLAS_AML_TA0007",
        grudge: "DISCOVERY: Adversary scans the environment to identify other models, datasets, or AI infrastructure. This is 'Internal Reconnaissance'.",
        severity: "HIGH",
        evidence: "ATLAS Matrix",
        playbook: "AML.TA0007"
    },
    {
        pain_id: "ATLAS_AML_TA0008",
        grudge: "LATERAL MOVEMENT: Adversary attempts to move from the AI system to other parts of the network or other user accounts.",
        severity: "CRITICAL",
        evidence: "ATLAS Matrix",
        playbook: "AML.TA0008"
    },
    {
        pain_id: "ATLAS_AML_TA0011",
        grudge: "IMPACT: Adversary intentionally degrades the performance, reliability, or safety of the AI system. This is 'System Sabotage'.",
        severity: "CATASTROPHIC",
        evidence: "ATLAS Matrix",
        playbook: "AML.TA0011"
    }
];

const entries = newGrudges.map((g, i) => {
    const entry = createEntry(nextIndex + i, new Date().toISOString(), g.pain_id, g.grudge, g.severity, g.evidence, g.playbook, lastHash);
    lastHash = entry.hash;
    return entry;
});

fs.appendFileSync(GRUDGE_BOOK_PATH, entries.map(e => JSON.stringify(e)).join('\n') + '\n');
console.log(`Successfully appended ${entries.length} new grudges. Total entries: ${nextIndex + entries.length}`);
