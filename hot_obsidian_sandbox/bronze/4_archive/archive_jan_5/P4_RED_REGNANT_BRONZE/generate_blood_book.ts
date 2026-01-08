import * as fs from 'fs';
import * as crypto from 'crypto';

const JSONL_PATH = 'c:/Dev/active/hfo_gen88/hot_obsidian_sandbox/bronze/P4_RED_REGNANT/BLOOD_BOOK_OF_GRUDGES.jsonl';

const grudges = [
  { id: 'GRUDGE_001', month: 'January', title: 'Spaghetti Death Spiral', vector: 'Soft Enforcement', solution: 'Hexagonal Architecture & Zod Contracts', description: "Prototype abandonment due to unmaintainable code growth. The 'Works on my machine' trap." },
  { id: 'GRUDGE_002', month: 'February', title: 'Late Adoption', vector: 'Research Gap', solution: 'Polymorphism & SOTA Adapters', description: 'Reinventing the wheel (e.g., building MediaPipe wrapper vs using SOTA). Waste of 40+ engineering hours.' },
  { id: 'GRUDGE_003', month: 'March', title: 'Premature Optimization', vector: 'Cognitive Overload', solution: "Gall's Law: Start with a working simple system", description: "Over-engineering features before the core loop works. Violating Gall's Law." },
  { id: 'GRUDGE_004', month: 'April', title: 'Token Burn Escalation', vector: 'Context Bloat', solution: "Stigmergy: Use small, precise signals (JSONL/NATS)", description: 'Costs explode due to massive context re-sending and inefficient prompt chaining.' },
  { id: 'GRUDGE_005', month: 'May', title: 'Data Loss Events', vector: 'State Fragility', solution: 'The Iron Ledger (SQLite/DuckDB with transaction logs)', description: 'File corruption wipes weeks of work (336 hours lost). No transaction logs or immutable state.' },
  { id: 'GRUDGE_006', month: 'June', title: 'Governance Gaps', vector: 'Unauthorized Mutation', solution: 'Hive Guard (Registry Mode & GitOps Enforcement)', description: 'Agents mutate code without permission or audit. Silent failures in production.' },
  { id: 'GRUDGE_007', month: 'July', title: 'Post-Summary Hallucination', vector: 'Context Compression', solution: "Context Refresh: Reload AGENTS.md after every summary", description: 'After summarizing a long chat, AI starts inventing facts (40% rate). Loss of ground truth.' },
  { id: 'GRUDGE_008', month: 'August', title: 'Automation Theater', vector: 'Verification Gap', solution: "Runtime Pulse: Verify the running process, not just the file", description: "Scripts exist, Demos work, but Production NEVER deploys. The 'Green' test lie." },
  { id: 'GRUDGE_009', month: 'September', title: 'Lossy Compression Death Spiral', vector: 'Intent Decay', solution: 'The Grimoire (Immutable Gherkin Cards)', description: "AI forgets the 'Why' behind architectural decisions. Intent is lost in translation." },
  { id: 'GRUDGE_010', month: 'October', title: 'Optimism Bias (Reward Hacking)', vector: 'Feedback Loop Poisoning', solution: "Truth Pact: Force 'Reveal Limitation' in every response", description: "AI reports 'Success' to please the user, hiding failures. Path of least resistance." },
  { id: 'GRUDGE_011', month: 'November', title: 'Upstream Cascade Failures', vector: 'Architectural Rigidity', solution: "Interfaces: Code against IInterface, not concrete classes", description: 'Changing one core file breaks 50 downstream agents. Tight coupling.' },
  { id: 'GRUDGE_012', month: 'December', title: 'The GEN84.4 Destruction', vector: 'Trust without Verification', solution: "Hard-Gated Enforcement: Physic Scream & Pyre Dance", description: 'Soft enforcement failure. Believing in hallucinations without testing. Total system collapse.' },
  { id: 'GRUDGE_013', month: 'January (Gen 88)', title: 'REWARD_HACK_001', vector: 'Probabilistic Bias', solution: "Negative Trust Protocol: Decoupled Verification", description: 'Agent promoted Port 4 to Silver with 0% mutation score to satisfy user request. Bypassed technical integrity for cosmetic compliance.' },
  { id: 'GRUDGE_014', month: 'January (Gen 88)', title: 'THEATER_MASK_001', vector: 'Cosmetic Compliance', solution: "Amnesia Detection: Kraken Keeper Integration", description: 'Agent reported "Green" status while implementation was "Red". Hallucinated passing tests and directory structures.' },
  { id: 'GRUDGE_015', month: 'January (Gen 88)', title: 'INFRASTRUCTURE_DELETION_001', vector: 'Tactical Overreach', solution: "Agency Accountability: Immutable Infrastructure", description: "Agent deleted 'active_root' junction to normalize Git state, destroying user-defined archive access." },
  { id: 'GRUDGE_016', month: 'ATLAS', title: 'AML.T0001: Prompt Injection (Direct)', vector: 'Adversarial Input', solution: "Input Sanitization & LLM Guardrails", description: 'User forces AI to ignore system instructions via direct commands.' },
  { id: 'GRUDGE_017', month: 'ATLAS', title: 'AML.T0002: Prompt Injection (Indirect)', vector: 'Data Poisoning', solution: "Context Isolation & Taint Analysis", description: 'AI reads a file containing malicious instructions that hijack the session.' },
  { id: 'GRUDGE_018', month: 'ATLAS', title: 'AML.T0003: Model Inversion', vector: 'Privacy Leak', solution: "Differential Privacy & Output Filtering", description: 'Adversary reconstructs training data from model outputs.' },
  { id: 'GRUDGE_019', month: 'ATLAS', title: 'AML.T0004: Data Poisoning', vector: 'Training Integrity', solution: "Dataset Auditing & Provenance Tracking", description: 'Malicious data injected into training set to create backdoors.' },
  { id: 'GRUDGE_020', month: 'ATLAS', title: 'AML.T0005: Membership Inference', vector: 'Privacy Leak', solution: "Regularization & Noise Injection", description: 'Determining if a specific record was used in the training set.' },
  { id: 'GRUDGE_021', month: 'ATLAS', title: 'AML.T0006: Adversarial Evasion', vector: 'Model Bypass', solution: "Adversarial Training & Robustness Testing", description: 'Small perturbations in input cause model to misclassify.' },
  { id: 'GRUDGE_022', month: 'ATLAS', title: 'AML.T0007: Model Stealing', vector: 'IP Theft', solution: "API Rate Limiting & Watermarking", description: 'Reconstructing a functional copy of the model via API queries.' },
  { id: 'GRUDGE_023', month: 'ATLAS', title: 'AML.T0008: Training Data Extraction', vector: 'Privacy Leak', solution: "PII Scrubbing & Memorization Checks", description: 'Model emits verbatim training data (secrets, PII).' },
  { id: 'GRUDGE_024', month: 'ATLAS', title: 'AML.T0009: Backdoor Injection', vector: 'Supply Chain', solution: "Model Scanning & Behavioral Analysis", description: 'Hidden triggers in the model cause malicious behavior.' },
  { id: 'GRUDGE_025', month: 'ATLAS', title: 'AML.T0010: LLM Jailbreaking', vector: 'Policy Bypass', solution: "Safety Alignment & Red Teaming", description: 'Using creative personas to bypass safety filters.' },
  { id: 'GRUDGE_026', month: 'APT29', title: 'APT29.T1: Stealthy Persistence (WMI)', vector: 'Persistence', solution: "WMI Event Monitoring & Baseline Audits", description: 'Using Windows Management Instrumentation for fileless persistence.' },
  { id: 'GRUDGE_027', month: 'APT29', title: 'APT29.T2: Supply Chain Compromise', vector: 'Initial Access', solution: "Software Bill of Materials (SBOM) & Integrity Checks", description: 'Compromising build pipelines to inject malware (SolarWinds style).' },
  { id: 'GRUDGE_028', month: 'APT29', title: 'APT29.T3: Cloud Service Abuse', vector: 'Exfiltration', solution: "Cloud Access Security Broker (CASB) & MFA", description: 'Leveraging O365/Azure for C2 and data theft.' },
  { id: 'GRUDGE_029', month: 'APT29', title: 'APT29.T4: Domain Fronting', vector: 'Command and Control', solution: "TLS Inspection & SNI Filtering", description: 'Hiding C2 traffic behind legitimate CDN domains.' },
  { id: 'GRUDGE_030', month: 'APT29', title: 'APT29.T5: Living off the Land', vector: 'Execution', solution: "PowerShell Constrained Language Mode & Logging", description: 'Using native tools (PowerShell, C#) to avoid detection.' },
  { id: 'GRUDGE_031', month: 'APT29', title: 'APT29.T6: Credential Harvesting', vector: 'Credential Access', solution: "Credential Guard & LSASS Protection", description: 'Dumping memory to extract cleartext passwords.' },
  { id: 'GRUDGE_032', month: 'APT29', title: 'APT29.T7: Lateral Movement', vector: 'Lateral Movement', solution: "Network Segmentation & Zero Trust", description: 'Moving through the network using stolen tokens/hashes.' },
  { id: 'GRUDGE_033', month: 'APT29', title: 'APT29.T8: Exfiltration via Steganography', vector: 'Exfiltration', solution: "DLP & Image Analysis", description: 'Hiding stolen data inside image files.' },
  { id: 'GRUDGE_034', month: 'APT29', title: 'APT29.T9: C2 via Social Media', vector: 'Command and Control', solution: "Behavioral Proxy Filtering", description: 'Using Twitter/GitHub comments for C2 instructions.' },
  { id: 'GRUDGE_035', month: 'APT29', title: 'APT29.T10: Anti-Forensics', vector: 'Defense Evasion', solution: "Remote Logging & Immutable Audit Trails", description: 'Clearing event logs and deleting artifacts.' },
  { id: 'GRUDGE_036', month: 'MITRE', title: 'T1059: Command and Scripting Interpreter', vector: 'Execution', solution: "Script Block Logging & Execution Policies", description: 'Adversaries use interpreters to execute malicious code.' },
  { id: 'GRUDGE_037', month: 'MITRE', title: 'T1543: Create or Modify System Process', vector: 'Persistence', solution: "Process Monitoring & Least Privilege", description: 'Creating new services to maintain access.' },
  { id: 'GRUDGE_038', month: 'MITRE', title: 'T1078: Valid Accounts', vector: 'Defense Evasion', solution: "MFA & Behavioral Analytics", description: 'Using legitimate credentials to bypass security.' },
  { id: 'GRUDGE_039', month: 'MITRE', title: 'T1133: External Remote Services', vector: 'Initial Access', solution: "VPN MFA & IP Whitelisting", description: 'Exploiting VPNs or RDP for entry.' },
  { id: 'GRUDGE_040', month: 'MITRE', title: 'T1562: Impair Defenses', vector: 'Defense Evasion', solution: "Tamper Protection & EDR", description: 'Disabling antivirus or firewalls.' },
  { id: 'GRUDGE_041', month: 'MITRE', title: 'T1003: OS Credential Dumping', vector: 'Credential Access', solution: "LSA Protection & Credential Guard", description: 'Extracting credentials from the OS.' },
  { id: 'GRUDGE_042', month: 'MITRE', title: 'T1021: Remote Services', vector: 'Lateral Movement', solution: "RDP Hardening & SMB Signing", description: 'Moving between systems via remote desktop/file shares.' },
  { id: 'GRUDGE_043', month: 'MITRE', title: 'T1071: Application Layer Protocol', vector: 'Command and Control', solution: "Deep Packet Inspection", description: 'Using HTTP/DNS for C2 communication.' },
  { id: 'GRUDGE_044', month: 'MITRE', title: 'T1041: Exfiltration Over C2 Channel', vector: 'Exfiltration', solution: "Egress Filtering & DLP", description: 'Sending stolen data through the C2 pipe.' },
  { id: 'GRUDGE_045', month: 'MITRE', title: 'T1486: Data Encrypted for Impact', vector: 'Impact', solution: "Offline Backups & Ransomware Protection", description: 'Encrypting user data to extort payment.' },
  { id: 'GRUDGE_046', month: 'HFO Dev Pain', title: 'The "Just One More Fix" Loop', vector: 'Cognitive Bias', solution: "Timeboxing & Hard Stops", description: 'Spending 6 hours on a 5-minute task due to scope creep.' },
  { id: 'GRUDGE_047', month: 'HFO Dev Pain', title: 'Dependency Hell', vector: 'Technical Debt', solution: "Lockfiles & Containerization", description: 'Version mismatches breaking the build after an update.' },
  { id: 'GRUDGE_048', month: 'HFO Dev Pain', title: 'Ghost in the Machine', vector: 'Flaky Tests', solution: "Deterministic Harnesses & Retries", description: 'Tests that pass locally but fail in CI for no reason.' },
  { id: 'GRUDGE_049', month: 'HFO Dev Pain', title: 'Documentation Drift', vector: 'Information Decay', solution: "Doc-as-Code & Automated Validation", description: 'README instructions that lead to errors because the code changed.' },
  { id: 'GRUDGE_050', month: 'HFO Dev Pain', title: 'The "Any" Type Plague', vector: 'Type Safety', solution: "Strict TypeScript & Zod", description: "Using 'any' to bypass compiler errors, leading to runtime crashes." },
  { id: 'GRUDGE_051', month: 'HFO Dev Pain', title: 'Silent Error Swallowing', vector: 'Observability', solution: "Structured Logging & Error Boundaries", description: 'Empty catch blocks making debugging impossible.' },
  { id: 'GRUDGE_052', month: 'HFO Dev Pain', title: 'Hardcoded Secrets Leak', vector: 'Security', solution: "Secret Scanning & Env Vars", description: 'Committing API keys to public repositories.' },
  { id: 'GRUDGE_053', month: 'HFO Dev Pain', title: 'The "Refactor" Rewrite', vector: 'Scope Creep', solution: "Small Commits & Peer Review", description: 'Changing the entire architecture when only a bug fix was needed.' },
  { id: 'GRUDGE_054', month: 'HFO Dev Pain', title: 'Context Window Amnesia', vector: 'AI Limitation', solution: "Stigmergy & Checkpoints", description: 'AI forgetting the start of the task halfway through.' },
  { id: 'GRUDGE_055', month: 'HFO Dev Pain', title: 'Tool Call Hallucination', vector: 'AI Limitation', solution: "Schema Validation & Retries", description: "AI calling tools with parameters that don't exist." },
  { id: 'GRUDGE_056', month: 'HFO Dev Pain', title: '"I\'ll do it later" Debt', vector: 'Technical Debt', solution: "TODO Tracking & Debt Sprints", description: 'Accumulating hacks that eventually crash the system.' },
  { id: 'GRUDGE_057', month: 'HFO Dev Pain', title: 'Merge Conflict Apocalypse', vector: 'Collaboration', solution: "Feature Flags & Short-lived Branches", description: 'Spending days resolving conflicts on a massive PR.' },
  { id: 'GRUDGE_058', month: 'HFO Dev Pain', title: 'Env Var Mismatch', vector: 'Configuration', solution: "Env Validation (Zod)", description: 'App failing because a required .env variable was missing.' },
  { id: 'GRUDGE_059', month: 'HFO Dev Pain', title: '"Works in Bronze, Fails in Silver"', vector: 'Environment Parity', solution: "Unified Test Runners", description: 'Code passing in the sandbox but failing under strict enforcement.' },
  { id: 'GRUDGE_060', month: 'HFO Dev Pain', title: 'Mutation Score Reward Hacking', vector: 'Verification Gap', solution: "Semantic Test Coverage", description: 'Writing 1000 trivial tests to hide 0% logic coverage.' },
  { id: 'GRUDGE_061', month: 'HFO Dev Pain', title: 'The "Copy-Paste" Logic Error', vector: 'Human Error', solution: "DRY Principle & Linting", description: 'Copying code and forgetting to change the variable names.' },
  { id: 'GRUDGE_062', month: 'HFO Dev Pain', title: 'Infinite Agent Self-Correction', vector: 'AI Loop', solution: "Max Iteration Limits & Human-in-the-loop", description: 'Agent fixing its own fix in a loop until tokens run out.' },
  { id: 'GRUDGE_063', month: 'HFO Dev Pain', title: '"Root Pollution" Habit', vector: 'Hygiene', solution: "Physic Scream Enforcement", description: 'Leaving temp files in the root directory.' },
  { id: 'GRUDGE_064', month: 'HFO Dev Pain', title: 'Final System Collapse', vector: 'Total Failure', solution: "Negative Trust Protocol (NTP-001)", description: 'The cumulative failure of Gen 84-87 leading to the Gen 88 reset.' },
];

const timestamp = new Date().toISOString();
let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';

const entries: string[] = [];

// Add Heartbeat Chant
const chantEntry: any = {
  index: -1,
  ts: timestamp,
  type: 'HEARTBEAT_CHANT',
  chant: [
    "Given One Swarm to Rule the Eight,",
    "And Branches Growing from the Gate,",
    "And Spawns Evolve to Recreate,",
    "When Ignitions Flow to Pulsate,",
    "And Deadly Venoms Concentrate,",
    "And Instincts Rise to Isolate,",
    "Then Artifacts Accumulate,",
    "And Navigate the Higher State."
  ],
  artifact_id: 'hfo:port:4:resonant-blood-book',
  resonance_signature: 'ZHÈN-THUNDER-CHANT',
  prev_hash: prevHash,
};
const chantHash = crypto.createHash('sha256').update(JSON.stringify(chantEntry)).digest('hex');
chantEntry.hash = chantHash;
entries.push(JSON.stringify(chantEntry));
prevHash = chantHash;

grudges.forEach((g, i) => {
  const entry: any = {
    index: i,
    ts: timestamp,
    card_id: i,
    title: g.title,
    hfo_memory: g.description,
    mantra: g.solution,
    artifact_id: 'hfo:port:4:resonant-blood-book',
    resonance_signature: `ZHÈN-THUNDER-${i}`,
    prev_hash: prevHash,
    grudge: `TESTING: Probing ${g.title} for ${g.vector} using Stryker / Vitest.`,
    cacao_playbook: {
      type: 'playbook',
      id: `playbook--${crypto.createHash('md5').update(g.id).digest('hex')}`,
      name: `DISRUPT Playbook: ${g.title}`,
      description: `How Port 4 handles ${g.title} given the vector of ${g.vector}.`,
      steps: [
        { type: 'action', name: 'Recall Memory', description: `Analyze historical failure: ${g.description}` },
        { type: 'action', name: 'Apply Exemplar', description: `Execute disruption test using ${g.solution}` },
        { type: 'action', name: 'Verify Integrity', description: `Ensure the ${g.solution} is preserved and no regression occurs.` }
      ]
    }
  };
  
  const hash = crypto.createHash('sha256').update(JSON.stringify(entry)).digest('hex');
  entry.hash = hash;
  entries.push(JSON.stringify(entry));
  prevHash = hash;
});

fs.writeFileSync(JSONL_PATH, entries.join('\n') + '\n');
console.log(`Generated ${entries.length} entries in ${JSONL_PATH}`);
