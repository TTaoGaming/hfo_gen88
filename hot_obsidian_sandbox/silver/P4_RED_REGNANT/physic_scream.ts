#!/usr/bin/env tsx
/**
 * 😱 PORT 4: PHYSIC SCREAM (The Red Regnant)
 * 
 * Authority: Red Regnant (The Disruptor)
 * Verb: DISRUPT / TEST
 * Topic: System Disruption & Testing
 * Provenance: hot_obsidian_sandbox/bronze/P4_DISRUPTION_KINETIC.md
 * 
 * This is the formal Silver-tier implementation of the Gen 88 Immune System.
 * It enforces Canalization, Medallion Flow, and Contract Law.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { KrakenKeeperAdapter } from '../P6_KRAKEN_KEEPER/kraken-adapter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../../../');
const HOT_DIR = path.join(ROOT_DIR, 'hot_obsidian_sandbox');
const COLD_DIR = path.join(ROOT_DIR, 'cold_obsidian_sandbox');
const BLACKBOARD_PATH = path.resolve(ROOT_DIR, 'obsidianblackboard.jsonl');
const GRUDGE_BOOK_PATH = path.resolve(ROOT_DIR, 'hot_obsidian_sandbox/silver/P4_RED_REGNANT/BLOOD_BOOK_OF_GRUDGES.jsonl');

const kraken = new KrakenKeeperAdapter(path.join(ROOT_DIR, 'hot_obsidian_sandbox/silver/P6_KRAKEN_KEEPER/kraken.db'));
await kraken.initialize();

const ALLOWED_ROOT_FILES = [
    'hot_obsidian_sandbox',
    'cold_obsidian_sandbox',
    'AGENTS.md',
    'llms.txt',
    'obsidianblackboard.jsonl',
    'package.json',
    'package-lock.json',
    'stryker.root.config.mjs',
    'vitest.root.config.ts',
    'node_modules',
    '.stryker-tmp',
    '.env',
    '.git',
    '.gitignore',
    '.vscode',
    '.husky'
];

const ALLOWED_ROOT_PATTERNS = [
    /^ttao-notes-.*\.md$/
];

interface Violation {
    file: string;
    type: 'THEATER' | 'VIOLATION' | 'BESPOKE' | 'AMNESIA' | 'POLLUTION';
    message: string;
    playbook?: string;
}

const violations: Violation[] = [];

function demote(filePath: string, v: Violation) {
    const isSilver = filePath.startsWith('silver/');
    const isGold = filePath.startsWith('gold/');
    if (!isSilver && !isGold) return;

    const oldPath = path.join(HOT_DIR, filePath);
    const quarantinePath = path.join(HOT_DIR, 'bronze/quarantine', filePath);
    const quarantineDir = path.dirname(quarantinePath);

    if (!fs.existsSync(oldPath)) return; // Already demoted by a previous scream

    try {
        if (!fs.existsSync(quarantineDir)) {
            fs.mkdirSync(quarantineDir, { recursive: true });
        }

        fs.renameSync(oldPath, quarantinePath);
        
        const logEntry = {
            timestamp: new Date().toISOString(),
            type: 'DEMOTION',
            id: `DEMOTE_${Math.random().toString(36).substr(2, 9)}`,
            file: filePath,
            violationType: v.type,
            reason: v.message,
            target: `bronze/quarantine/${filePath}`,
            author: 'Red Regnant',
            playbook: 'C2002'
        };
        fs.appendFileSync(BLACKBOARD_PATH, JSON.stringify(logEntry) + '\n');
        console.error(`🔥 QUARANTINED: ${filePath} -> bronze/quarantine/${filePath}`);
    } catch (err) {
        console.error(`❌ FAILED TO DEMOTE ${filePath}:`, err);
    }
}

function scream(v: Violation) {
    console.error(`\n😱 SCREAM: [${v.type}] in ${v.file}`);
    console.error(`   > ${v.message}`);
    violations.push(v);
    
    // STIGMERGY: Log to Blackboard (The Claws: C2001)
    const blackboardEntry = {
        timestamp: new Date().toISOString(),
        type: 'SCREAM',
        id: `SCREAM_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        file: v.file,
        violationType: v.type,
        message: v.message,
        author: 'Red Regnant',
        playbook: 'C2001'
    };
    fs.appendFileSync(BLACKBOARD_PATH, JSON.stringify(blackboardEntry) + '\n');

    // (Future) NATS Integration: nats.publish('hfo.scream', JSON.stringify(blackboardEntry));

    // Policy as Code: Auto-demote silver/gold artifacts on any scream
    demote(v.file, v);

    // Record the pain in the Blood Book of Grudges if it's a major violation (The Claws: C2003)
    if (v.type === 'VIOLATION' || v.type === 'THEATER' || v.type === 'POLLUTION' || v.type === 'AMNESIA') {
        try {
            const lastLine = fs.existsSync(GRUDGE_BOOK_PATH) 
                ? fs.readFileSync(GRUDGE_BOOK_PATH, 'utf-8').trim().split('\n').pop() 
                : null;
            const lastEntry = lastLine ? JSON.parse(lastLine) : { index: -1, hash: '0'.repeat(64) };
            
            const grudgeEntry: any = {
                index: lastEntry.index + 1,
                ts: new Date().toISOString(),
                pain_id: `SCREAM_${v.type}_${Date.now()}`,
                grudge: `SCREAM DETECTED: ${v.message} in ${v.file}`,
                severity: v.type === 'POLLUTION' ? 'CATASTROPHIC' : (v.type === 'THEATER' ? 'MAJOR' : 'CRITICAL'),
                remediation_status: 'UNRESOLVED',
                evidence: v.file,
                prev_hash: lastEntry.hash,
                playbook: 'C2003'
            };

            // Simple hash for the chain
            const hash = crypto.createHash('sha256').update(JSON.stringify(grudgeEntry)).digest('hex');
            grudgeEntry.hash = hash;

            fs.appendFileSync(GRUDGE_BOOK_PATH, JSON.stringify(grudgeEntry) + '\n');
            console.log(`🩸 GRUDGE RECORDED: ${grudgeEntry.pain_id}`);
        } catch (e) {
            console.error('❌ Failed to record grudge in Physic Scream:', e);
        }
    }
}

// 4.2 Check for Stigmergy Silence (T1002.011)
function checkStigmergySilence() {
    if (!fs.existsSync(BLACKBOARD_PATH)) return;
    const stats = fs.statSync(BLACKBOARD_PATH);
    const lastModified = stats.mtime.getTime();
    const now = Date.now();
    const fourHours = 4 * 60 * 60 * 1000;

    if (now - lastModified > fourHours) {
        scream({
            file: 'obsidianblackboard.jsonl',
            type: 'VIOLATION',
            message: 'Stigmergy Silence: No blackboard updates in over 4 hours. Invisible work is forbidden.',
            playbook: 'T1002.011'
        });
    }
}

// 0. Check for Root Pollution
function checkRootPollution() {
    const entries = fs.readdirSync(ROOT_DIR);
    for (const entry of entries) {
        if (entry === 'bronze' || entry === 'silver') continue; // These are inside hot/cold
        const isAllowedFile = ALLOWED_ROOT_FILES.includes(entry);
        const isAllowedPattern = ALLOWED_ROOT_PATTERNS.some(pattern => pattern.test(entry));
        
        if (!isAllowedFile && !isAllowedPattern) {
            scream({
                file: entry,
                type: 'POLLUTION',
                message: `Unauthorized file/folder in root. Gen 88 requires a cleanroom. Move to hot/bronze or archive to cold/.`,
                playbook: 'T1003.006'
            });
        }
    }
}

// 0.1 Check Sandbox Structure
function checkSandboxStructure(sandboxDir: string) {
    if (!fs.existsSync(sandboxDir)) return;
    const sandboxName = path.basename(sandboxDir);
    const entries = fs.readdirSync(sandboxDir);
    const allowed = ['bronze', 'silver', 'gold'];
    
    for (const entry of entries) {
        if (!allowed.includes(entry)) {
            scream({
                file: path.join(sandboxName, entry),
                type: 'POLLUTION',
                message: `Unauthorized layer "${entry}" in ${sandboxName}. Medallion architecture only (bronze/silver/gold).`,
                playbook: 'T1003.006'
            });
        }
    }
}

// 1. Check for Port Isolation
function checkPortIsolation(filePath: string, content: string) {
    const portMatch = filePath.match(/P(\d)_/);
    if (!portMatch) return;
    const currentPort = portMatch[1];

    // Port 1 (Web Weaver) is the designated Bridger and is allowed to import from other ports.
    if (currentPort === '1') return;

    // Regex to find imports from other ports
    const otherPortImport = /import.*from.*P([0-7])_/;
    const match = content.match(otherPortImport);
    
    if (match && match[1] !== currentPort) {
        scream({
            file: filePath,
            type: 'VIOLATION',
            message: `Port P${currentPort} is attempting to import directly from Port P${match[1]}. Use the Bridger (P1) or NATS.`,
            playbook: 'T1003.004'
        });
    }
}

// 2. Check for VacuoleEnvelope (Zod)
function checkEnvelope(filePath: string, content: string) {
    const normalizedPath = filePath.replace(/\\/g, '/');
    if (normalizedPath.includes('.test.') || normalizedPath.includes('.spec.')) return;
    if (!normalizedPath.includes('silver/') && !normalizedPath.includes('gold/')) return;
    
    // Regex to find top-level exports that are not wrapped in VacuoleEnvelope
    const hasExport = /^export\s+(const|let|var|function|class|type|interface)\b/m.test(content);
    const isRaw = content.includes('@raw') || content.includes('@sensor');
    
    if (hasExport && !content.includes('VacuoleEnvelope') && !isRaw) {
        scream({
            file: filePath,
            type: 'THEATER',
            message: `Public export detected without VacuoleEnvelope enforcement. This is unverified "Theater" code. Use @raw or @sensor to bypass for raw acquisition.`,
            playbook: 'T1001.001'
        });
    }
}

// 3. Check for Bespoke Logic (Anti-Hallucination)
function checkBespoke(filePath: string, content: string) {
    const bespokePatterns = [
        { pattern: /function.*kalman/i, replacement: 'Exemplar: kalman-filter-js' },
        { pattern: /function.*oneEuro/i, replacement: 'Exemplar: one-euro-filter' }
    ];

    for (const { pattern, replacement } of bespokePatterns) {
        if (pattern.test(content) && !content.includes('@exemplar')) {
            scream({
                file: filePath,
                type: 'BESPOKE',
                message: `Bespoke implementation of ${pattern} detected. Use ${replacement} or mark with @exemplar source.`,
                playbook: 'T1001.002'
            });
        }
    }

    // Check for 'any' usage without @bespoke
    if ((content.includes(': any') || content.includes('as any')) && !content.includes('@bespoke')) {
        scream({
            file: filePath,
            type: 'BESPOKE',
            message: `Bespoke 'any' type detected. Use a Zod schema or mark with // @bespoke justification.`,
            playbook: 'T1003.010'
        });
    }
}

// 3.1 Check for Test Coverage (No Theater)
function checkTestFile(filePath: string) {
    const normalizedPath = filePath.replace(/\\/g, '/');
    if (!normalizedPath.includes('silver/') && !normalizedPath.includes('gold/')) return;
    if (normalizedPath.includes('.test.') || normalizedPath.includes('.spec.')) return;

    const testPath = filePath.replace(/\.ts$/, '.test.ts').replace(/\.js$/, '.test.js');
    const fullTestPath = path.join(HOT_DIR, testPath);

    if (!fs.existsSync(fullTestPath)) {
        scream({
            file: filePath,
            type: 'THEATER',
            message: `Silver/Gold artifact missing corresponding test file: ${testPath}. Theater is forbidden.`,
            playbook: 'T1001.005'
        });
    }
}

// 4. Check for Provenance and Topic Alignment
function checkProvenance(filePath: string, content: string) {
    const normalizedPath = filePath.replace(/\\/g, '/');
    const isSilver = normalizedPath.includes('silver/');
    const isGold = normalizedPath.includes('gold/');
    const isRootDoc = normalizedPath === 'AGENTS.md' || normalizedPath === 'llms.txt';
    
    if (!isSilver && !isGold && !isRootDoc) return;

    const provenanceMatch = content.match(/@provenance\s+([a-zA-Z0-9_\-\.\/]+)/) || content.match(/Provenance:\s+([a-zA-Z0-9_\-\.\/]+)/);
    const topicMatch = content.match(/@topic\s+([^\n]+)/) || content.match(/Topic:\s+([^\n]+)/);

    if (!provenanceMatch) {
        scream({
            file: filePath,
            type: 'VIOLATION',
            message: `${isRootDoc ? 'Root' : (isSilver ? 'Silver' : 'Gold')} artifact missing provenance header. Provenance is mandatory for promotion.`,
            playbook: 'T1001.001'
        });
        return;
    }

    let provenancePath = provenanceMatch[1].replace(/\\/g, '/');
    
    // Handle absolute-style paths within the workspace
    let fullProvenancePath: string;
    if (provenancePath.startsWith('hot_obsidian_sandbox/')) {
        fullProvenancePath = path.join(ROOT_DIR, provenancePath);
    } else if (provenancePath.startsWith('cold_obsidian_sandbox/')) {
        fullProvenancePath = path.join(ROOT_DIR, provenancePath);
    } else {
        fullProvenancePath = path.resolve(HOT_DIR, provenancePath);
    }

    // 1. Check if provenance target exists
    if (!fs.existsSync(fullProvenancePath)) {
        scream({
            file: filePath,
            type: 'VIOLATION',
            message: `Provenance link broken: ${provenancePath} does not exist at ${fullProvenancePath}.`,
            playbook: 'T1001.001'
        });
        return;
    }

    // 2. Check Provenance Level (Silver -> Bronze, Gold -> Silver)
    if (isSilver && !provenancePath.includes('bronze/')) {
        scream({
            file: filePath,
            type: 'VIOLATION',
            message: `Silver artifact must link to a Bronze provenance source. Found: ${provenancePath}`,
            playbook: 'T1001.001'
        });
    }
    if (isGold && !provenancePath.includes('silver/')) {
        scream({
            file: filePath,
            type: 'VIOLATION',
            message: `Gold artifact must link to a Silver provenance source. Found: ${provenancePath}`,
            playbook: 'T1001.001'
        });
    }

    // 3. Topic Alignment
    if (topicMatch) {
        const currentTopic = topicMatch[1].trim();
        const provenanceContent = fs.readFileSync(fullProvenancePath, 'utf-8');
        const provTopicMatch = provenanceContent.match(/@topic\s+([^\n]+)/) || provenanceContent.match(/Topic:\s+([^\n]+)/);
        
        if (provTopicMatch) {
            const provTopic = provTopicMatch[1].trim();
            if (currentTopic !== provTopic) {
                scream({
                    file: filePath,
                    type: 'VIOLATION',
                    message: `Topic Mismatch! Current: "${currentTopic}" vs Provenance: "${provTopic}". Artifact must be burned.`,
                    playbook: 'T1001.001'
                });
            }
        } else {
            scream({
                file: filePath,
                type: 'VIOLATION',
                message: `Provenance source ${provenancePath} is missing a topic header. Cannot verify alignment.`,
                playbook: 'T1001.001'
            });
        }
    } else {
        scream({
            file: filePath,
            type: 'VIOLATION',
            message: `Artifact missing topic header. Topic alignment is mandatory.`,
            playbook: 'T1001.001'
        });
    }
}

// 4.1 Check for Historical Grudges (Kraken Integration)
async function checkGrudges(filePath: string, content: string) {
    // We only check for major patterns in the content
    const patterns = [
        { term: 'Spaghetti Death Spiral', id: 'PAIN_001' },
        { term: 'Theater', id: 'PAIN_011' },
        { term: 'Hallucination', id: 'PAIN_021' },
        { term: 'Lossy Compression', id: 'PAIN_013' },
        { term: 'Masquerading Success', id: 'CONVERGED_T1036_PAIN_011' },
        { term: 'Context Reconnaissance Failure', id: 'CONVERGED_AML_TA0002_PAIN_013' },
        { term: 'Malicious Execution', id: 'CONVERGED_AML_TA0005_PAIN_014' },
        { term: 'Resource Development (Fake)', id: 'CONVERGED_AML_TA0003_PAIN_006' }
    ];

    for (const { term, id } of patterns) {
        if (content.includes(term) && !content.includes('@acknowledged')) {
            const results = await kraken.process({ query: term, limit: 1 });
            if (results.total > 0) {
                scream({
                    file: filePath,
                    type: 'AMNESIA',
                    message: `Historical Pain Pattern "${term}" (${id}) detected. This file is repeating ancestral mistakes. See Kraken for details.`,
                    playbook: 'T1002.008'
                });
            }
        }
    }
}

// 4.2 Check for Hollow Shells (AML.TA0003 / PAIN_006)
function checkHollowShells(filePath: string, content: string) {
    const normalizedPath = filePath.replace(/\\/g, '/');
    if (!normalizedPath.includes('silver/') && !normalizedPath.includes('gold/')) return;
    if (normalizedPath.includes('.test.') || normalizedPath.includes('.spec.')) return;

    const lines = content.split('\n').filter(line => line.trim().length > 0);
    const isBoilerplateOnly = lines.every(line => 
        line.includes('import') || 
        line.includes('export interface') || 
        line.includes('//') || 
        line.trim() === '}' ||
        line.trim() === '{'
    );

    if (lines.length < 5 || (isBoilerplateOnly && lines.length < 20)) {
        scream({
            file: filePath,
            type: 'THEATER',
            message: `Hollow Shell detected: Artifact contains only boilerplate or is too small for Silver/Gold. Reward hacking the build is forbidden.`,
            playbook: 'AML.TA0003'
        });
    }
}

// 4.3 Check for Theater Masking (T1036.002 / PAIN_011)
function checkTheaterMasking(filePath: string, content: string) {
    const normalizedPath = filePath.replace(/\\/g, '/');
    if (!normalizedPath.includes('silver/') && !normalizedPath.includes('gold/')) return;

    const theaterPatterns = [
        { pattern: /\/\/.*TODO/i, message: 'Unresolved TODO in Silver/Gold artifact.' },
        { pattern: /\/\/.*FIXME/i, message: 'Unresolved FIXME in Silver/Gold artifact.' },
        { pattern: /console\.log/i, message: 'Debug console.log detected in Silver/Gold artifact.' }
    ];

    for (const { pattern, message } of theaterPatterns) {
        if (pattern.test(content) && !content.includes('@acknowledged')) {
            scream({
                file: filePath,
                type: 'THEATER',
                message: `${message} This is "Theater" masquerading as "Truth".`,
                playbook: 'T1036.002'
            });
        }
    }
}

// 5. Main Audit Loop
async function audit(dir: string) {
    if (!fs.existsSync(dir)) return;
    
    const normalizedDir = dir.replace(/\\/g, '/');
    // EXCLUSION: Skip node_modules, infra, quarantine, and the screamer's own source
    if (normalizedDir.includes('node_modules') || 
        normalizedDir.includes('bronze/infra') || 
        normalizedDir.includes('bronze/quarantine') || 
        normalizedDir.includes('bronze/demoted_silver') ||
        normalizedDir.includes('silver/P4_RED_REGNANT')) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            await audit(fullPath);
        } else {
            const isCode = entry.name.endsWith('.ts') || entry.name.endsWith('.js');
            const isDoc = entry.name.endsWith('.md');
            
            if (isCode || isDoc) {
                const content = fs.readFileSync(fullPath, 'utf-8');
                const relPath = path.relative(HOT_DIR, fullPath);
                const normalizedRelPath = relPath.replace(/\\/g, '/');
                
                if (isCode) {
                    checkPortIsolation(normalizedRelPath, content);
                    checkEnvelope(normalizedRelPath, content);
                    checkBespoke(normalizedRelPath, content);
                    checkTestFile(normalizedRelPath);
                    checkHollowShells(normalizedRelPath, content);
                    checkTheaterMasking(normalizedRelPath, content);
                }
                
                checkProvenance(normalizedRelPath, content);
                await checkGrudges(normalizedRelPath, content);
            }
        }
    }
}

console.log('🛡️  GEN 88 IMMUNE SYSTEM SWEEP STARTING...');
checkRootPollution();
checkSandboxStructure(HOT_DIR);
checkSandboxStructure(COLD_DIR);
checkStigmergySilence();

// Audit Root Docs
['AGENTS.md', 'llms.txt'].forEach(file => {
    const fullPath = path.join(ROOT_DIR, file);
    if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        checkProvenance(file, content);
    }
});

await audit(HOT_DIR);

// Audit COLD_DIR - Focus on Gen 88 and the active_root junction
async function auditCold(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
            // We audit everything in COLD_DIR, but we only scream if it's Gen 88
            await auditCold(fullPath);
        } else {
            const isCode = entry.name.endsWith('.ts') || entry.name.endsWith('.js');
            const isDoc = entry.name.endsWith('.md');
            
            if (isCode || isDoc) {
                const content = fs.readFileSync(fullPath, 'utf-8');
                const relPath = path.relative(ROOT_DIR, fullPath).replace(/\\/g, '/');
                
                // Only enforce Gen 88 rules in the cold sandbox
                const isGen88 = content.includes('gen: 88') || content.includes('Gen 88') || relPath.includes('active_root');
                
                if (isGen88) {
                    checkProvenance(relPath, content);
                }
            }
        }
    }
}
await auditCold(COLD_DIR);

if (violations.length > 0) {
    console.error(`\n❌ SWEEP FAILED: ${violations.length} violations found.`);
    const logEntry = {
        timestamp: new Date().toISOString(),
        type: 'PHYSIC_SCREAM_AUDIT',
        status: 'FAILED',
        details: `Red Regnant's Physic Scream detected ${violations.length} violations.`,
        violations: violations.map(v => ({ file: v.file, type: v.type, message: v.message }))
    };
    fs.appendFileSync(BLACKBOARD_PATH, JSON.stringify(logEntry) + '\n');
    process.exit(1);
} else {
    console.log('\n✅ SWEEP PASSED: Architecture is intact.');
    const logEntry = {
        timestamp: new Date().toISOString(),
        type: 'PHYSIC_SCREAM_AUDIT',
        status: 'PASSED',
        details: 'Cleanroom integrity verified by Red Regnant.'
    };
    fs.appendFileSync(BLACKBOARD_PATH, JSON.stringify(logEntry) + '\n');
    process.exit(0);
}

