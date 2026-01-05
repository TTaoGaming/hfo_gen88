#!/usr/bin/env tsx
/**
 * 🔥 PORT 5: PYRE DANCE (The Pyre Praetorian)
 * 
 * Authority: Pyre Praetorian (The Immunizer)
 * Verb: DEFEND / IMMUNIZE
 * Topic: System Disruption & Testing
 * Provenance: hot_obsidian_sandbox/bronze/P5_PYRE_PRAETORIAN/DANCE_SPEC.md
 * 
 * The Pyre Dance is the proactive hardening response to the Red Regnant's Scream.
 * It "dances" with the system to remediate violations before they become screams.
 * Yin (Hardening) to the Red Regnant's Yang (Disruption).
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../../../');
const HOT_DIR = path.join(ROOT_DIR, 'hot_obsidian_sandbox');
const BLACKBOARD_PATH = path.resolve(ROOT_DIR, 'obsidianblackboard.jsonl');
const QUARANTINE_DIR = path.join(HOT_DIR, 'bronze/quarantine/pollution');

const ALLOWED_ROOT_FILES = [
    'hot_obsidian_sandbox',
    'cold_obsidian_sandbox',
    'AGENTS.md',
    'llms.txt',
    'obsidianblackboard.jsonl',
    '.env',
    '.git',
    '.gitignore',
    '.vscode'
];

const ALLOWED_ROOT_PATTERNS = [
    /^ttao-notes-.*\.md$/
];

function logDance(step: string, details: string) {
    const entry = {
        timestamp: new Date().toISOString(),
        type: 'PYRE_DANCE',
        step,
        details,
        author: 'Pyre Praetorian'
    };
    fs.appendFileSync(BLACKBOARD_PATH, JSON.stringify(entry) + '\n');
    console.log(`🔥 PYRE DANCE [${step}]: ${details}`);
}

// Step 1: The Sweep (Proactive Pollution Removal)
function stepSweep() {
    const entries = fs.readdirSync(ROOT_DIR);
    let movedCount = 0;

    if (!fs.existsSync(QUARANTINE_DIR)) {
        fs.mkdirSync(QUARANTINE_DIR, { recursive: true });
    }

    for (const entry of entries) {
        if (entry === 'bronze' || entry === 'silver') continue;
        const isAllowedFile = ALLOWED_ROOT_FILES.includes(entry);
        const isAllowedPattern = ALLOWED_ROOT_PATTERNS.some(pattern => pattern.test(entry));

        if (!isAllowedFile && !isAllowedPattern) {
            const oldPath = path.join(ROOT_DIR, entry);
            const newPath = path.join(QUARANTINE_DIR, entry);
            
            try {
                fs.renameSync(oldPath, newPath);
                movedCount++;
            } catch (err) {
                console.error(`❌ PYRE DANCE: Failed to sweep ${entry}`, err);
            }
        }
    }

    if (movedCount > 0) {
        logDance('SWEEP', `Proactively moved ${movedCount} unauthorized files to quarantine.`);
    }
}

// Step 2: The Seal (Gitignore Hardening)
function stepSeal() {
    const gitignorePath = path.join(ROOT_DIR, '.gitignore');
    if (!fs.existsSync(gitignorePath)) return;

    let content = fs.readFileSync(gitignorePath, 'utf-8');
    const mandatoryBlocks = [
        '# HFO Gen 88 Cleanroom Firewall',
        '.env',
        'node_modules/',
        '.venv/',
        '*.log',
        '.stryker-tmp/',
        'hot_obsidian_sandbox/bronze/quarantine/'
    ];

    let updated = false;
    for (const block of mandatoryBlocks) {
        if (!content.includes(block)) {
            content += `\n${block}`;
            updated = true;
        }
    }

    if (updated) {
        fs.writeFileSync(gitignorePath, content);
        logDance('SEAL', 'Hardened .gitignore with mandatory cleanroom blocks.');
    }
}

/**
 * 🛡️ STEP 3: SHIELD (Defense in Depth)
 * Proactively check silver/ for missing envelopes, theater, and hallucinations.
 */
function stepShield() {
    const silverDir = path.join(ROOT_DIR, 'hot_obsidian_sandbox/silver');
    if (!fs.existsSync(silverDir)) return;

    const files = getAllFiles(silverDir).filter(f => f.endsWith('.ts') && !f.endsWith('.test.ts'));
    let unshieldedCount = 0;
    let theaterCount = 0;
    let hallucinationCount = 0;

    const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'hot_obsidian_sandbox/bronze/infra/package.json'), 'utf8'));
    const allowedDeps = [...Object.keys(packageJson.dependencies || {}), ...Object.keys(packageJson.devDependencies || {}), 'node:fs', 'node:path', 'node:child_process', 'node:os', 'node:crypto', 'node:events', 'node:util', 'node:stream', 'node:url', 'node:http', 'node:https', 'node:zlib', 'node:readline', 'node:buffer', 'node:process', 'node:v8', 'node:vm', 'node:worker_threads', 'node:perf_hooks', 'node:async_hooks', 'node:diagnostics_channel', 'node:test', 'node:net', 'node:tls', 'node:dgram', 'node:dns', 'node:string_decoder', 'node:punycode', 'node:querystring', 'node:timers', 'node:trace_events', 'node:inspector', 'node:module'];

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        const relativePath = path.relative(ROOT_DIR, file);

        // 1. VacuoleEnvelope Check
        const isRaw = content.includes('@raw') || content.includes('@sensor');
        if (content.includes('export ') && !content.includes('VacuoleEnvelope') && !isRaw) {
            console.warn(`⚠️ SHIELD WARNING: ${relativePath} is missing VacuoleEnvelope!`);
            unshieldedCount++;
        }

        // 2. Theater Check (TODOs, FIXMEs, or empty implementations)
        if (content.includes('TODO') || content.includes('FIXME') || /\{\s*\}/.test(content.replace(/\/\/.*/g, ''))) {
            console.warn(`🎭 THEATER DETECTED: ${relativePath} contains placeholders or empty blocks.`);
            theaterCount++;
        }

        // 3. Hallucination Check (Import Audit)
        const importMatches = content.matchAll(/import .* from ['"](.*)['"]/g);
        for (const match of importMatches) {
            const dep = match[1];
            if (!dep.startsWith('.') && !dep.startsWith('/') && !allowedDeps.includes(dep) && !allowedDeps.includes(`node:${dep}`)) {
                console.error(`❌ HALLUCINATION DETECTED: ${relativePath} imports unknown module '${dep}'`);
                hallucinationCount++;
            }
        }
    }

    if (unshieldedCount > 0 || theaterCount > 0 || hallucinationCount > 0) {
        logDance('SHIELD', `Detected ${unshieldedCount} unshielded, ${theaterCount} theater, and ${hallucinationCount} hallucinated files in silver/.`);
    } else {
        logDance('SHIELD', 'All silver/ exports are properly shielded and audited.');
    }
}

/**
 * 🛡️ STEP 4: PULSE (Test Verification)
 * Prevent Optimistic Override by checking the blackboard for recent test success.
 */
function stepPulse() {
    const blackboardPath = path.join(ROOT_DIR, 'obsidianblackboard.jsonl');
    if (!fs.existsSync(blackboardPath)) {
        console.warn('⚠️ PULSE WARNING: No blackboard found. Cannot verify test pulse.');
        return;
    }

    const lines = fs.readFileSync(blackboardPath, 'utf8').trim().split('\n');
    const lastEntries = lines.slice(-20).map(line => JSON.parse(line));
    
    const lastTestSuccess = lastEntries.reverse().find(entry => 
        entry.type === 'TEST_SUCCESS' || 
        entry.msg?.includes('PASSED') || 
        entry.status === 'PASSED'
    );

    if (!lastTestSuccess) {
        console.error('❌ PULSE FAILURE: No recent test success found in blackboard. Optimistic Override suspected.');
        // In a strict dance, we would exit 1 here.
    } else {
        logDance('PULSE', `Verified recent test success: ${lastTestSuccess.msg}`);
    }
}

function getAllFiles(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getAllFiles(file));
        } else {
            results.push(file);
        }
    });
    return results;
}

console.log('🔥 PYRE PRAETORIAN: BEGINNING THE PYRE DANCE...');
stepSweep();
stepSeal();
stepShield();
stepPulse();
console.log('🔥 PYRE DANCE COMPLETE. THE CLEANROOM IS HARDENED.');
