#!/usr/bin/env tsx
/**
 * 😱 THE RED REGNANT'S PHYSIC SCREAM (PORT 4)
 * 
 * Authority: Red Regnant (The Disruptor)
 * Topic: System Disruption & Testing
 * Provenance: bronze/P4_DISRUPTION_KINETIC.md
 * 
 * This script is the "Immune System" of the Gen 88 Cleanroom.
 * It runs to disrupt AI Theater, Hallucinations, and Architectural Violations.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../../../../');
const HOT_DIR = path.join(ROOT_DIR, 'hot_obsidian_sandbox');
const COLD_DIR = path.join(ROOT_DIR, 'cold_obsidian_sandbox');
const BLACKBOARD_PATH = path.resolve(ROOT_DIR, 'obsidianblackboard.jsonl');

const ALLOWED_ROOT_FILES = [
    'hot_obsidian_sandbox',
    'cold_obsidian_sandbox',
    'AGENTS.md',
    'llms.txt',
    'obsidianblackboard.jsonl',
    '.git',
    '.gitignore',
    '.vscode'
];

interface Violation {
    file: string;
    type: 'THEATER' | 'VIOLATION' | 'BESPOKE' | 'AMNESIA' | 'POLLUTION';
    message: string;
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
            author: 'Red Regnant'
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
    
    // Policy as Code: Auto-demote silver/gold artifacts on any scream
    demote(v.file, v);
}

// 0. Check for Root Pollution
function checkRootPollution() {
    const entries = fs.readdirSync(ROOT_DIR);
    for (const entry of entries) {
        if (entry === 'bronze' || entry === 'silver') continue; // These are inside hot/cold
        if (!ALLOWED_ROOT_FILES.includes(entry)) {
            scream({
                file: entry,
                type: 'POLLUTION',
                message: `Unauthorized file/folder in root. Gen 88 requires a cleanroom. Move to hot/bronze or archive to cold/.`
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
                message: `Unauthorized layer "${entry}" in ${sandboxName}. Medallion architecture only (bronze/silver/gold).`
            });
        }
    }
}

// 1. Check for Port Isolation
function checkPortIsolation(filePath: string, content: string) {
    const portMatch = filePath.match(/P(\d)_/);
    if (!portMatch) return;
    const currentPort = portMatch[1];

    // Regex to find imports from other ports
    const otherPortImport = /import.*from.*P([0-7])_/;
    const match = content.match(otherPortImport);
    
    if (match && match[1] !== currentPort) {
        scream({
            file: filePath,
            type: 'VIOLATION',
            message: `Port P${currentPort} is attempting to import directly from Port P${match[1]}. Use the Bridger (P1) or NATS.`
        });
    }
}

// 2. Check for VacuoleEnvelope (Zod)
function checkEnvelope(filePath: string, content: string) {
    if (filePath.includes('.test.') || filePath.includes('.spec.')) return;
    
    // Regex to find top-level exports that are not wrapped in VacuoleEnvelope
    const exportRegex = /^export\s+(const|let|var|function|class)\s+/m;
    if (exportRegex.test(content) && !content.includes('VacuoleEnvelope')) {
        scream({
            file: filePath,
            type: 'THEATER',
            message: `Public export detected without VacuoleEnvelope enforcement. This is unverified "Theater" code.`
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
                message: `Bespoke implementation of ${pattern} detected. Use ${replacement} or mark with @exemplar source.`
            });
        }
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
            message: `${isRootDoc ? 'Root' : (isSilver ? 'Silver' : 'Gold')} artifact missing provenance header. Provenance is mandatory for promotion.`
        });
        return;
    }

    const provenancePath = provenanceMatch[1].replace(/\\/g, '/');
    const fullProvenancePath = path.resolve(HOT_DIR, provenancePath);

    // 1. Check if provenance target exists
    if (!fs.existsSync(fullProvenancePath)) {
        scream({
            file: filePath,
            type: 'VIOLATION',
            message: `Provenance link broken: ${provenancePath} does not exist.`
        });
        return;
    }

    // 2. Check Provenance Level (Silver -> Bronze, Gold -> Silver)
    if (isSilver && !provenancePath.includes('bronze/')) {
        scream({
            file: filePath,
            type: 'VIOLATION',
            message: `Silver artifact must link to a Bronze provenance source. Found: ${provenancePath}`
        });
    }
    if (isGold && !provenancePath.includes('silver/')) {
        scream({
            file: filePath,
            type: 'VIOLATION',
            message: `Gold artifact must link to a Silver provenance source. Found: ${provenancePath}`
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
                    message: `Topic Mismatch! Current: "${currentTopic}" vs Provenance: "${provTopic}". Artifact must be burned.`
                });
            }
        } else {
            scream({
                file: filePath,
                type: 'VIOLATION',
                message: `Provenance source ${provenancePath} is missing a topic header. Cannot verify alignment.`
            });
        }
    } else {
        scream({
            file: filePath,
            type: 'VIOLATION',
            message: `Artifact missing topic header. Topic alignment is mandatory.`
        });
    }
}

// 5. Main Audit Loop
function audit(dir: string) {
    if (!fs.existsSync(dir)) return;
    
    const normalizedDir = dir.replace(/\\/g, '/');
    // EXCLUSION: Skip node_modules, infra, and quarantine
    if (normalizedDir.includes('node_modules') || normalizedDir.includes('bronze/infra') || normalizedDir.includes('bronze/quarantine') || normalizedDir.includes('bronze/demoted_silver')) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            audit(fullPath);
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
                }
                
                checkProvenance(normalizedRelPath, content);
            }
        }
    }
}

console.log('🛡️  GEN 88 IMMUNE SYSTEM SWEEP STARTING...');
checkRootPollution();
checkSandboxStructure(HOT_DIR);
checkSandboxStructure(COLD_DIR);

// Audit Root Docs
['AGENTS.md', 'llms.txt'].forEach(file => {
    const fullPath = path.join(ROOT_DIR, file);
    if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        checkProvenance(file, content);
    }
});

audit(HOT_DIR);
// Audit COLD_DIR but skip the active_root junction to avoid infinite loops/slowness
function auditCold(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.name === 'active_root') continue; // Skip the massive junction
        
        if (entry.isDirectory()) {
            auditCold(fullPath);
        } else {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const relPath = path.relative(ROOT_DIR, fullPath);
            checkProvenance(relPath, content);
        }
    }
}
auditCold(COLD_DIR);

if (violations.length > 0) {
    console.error(`\n❌ SWEEP FAILED: ${violations.length} violations found.`);
    process.exit(1);
} else {
    console.log('\n✅ SWEEP PASSED: Architecture is intact.');
    process.exit(0);
}
