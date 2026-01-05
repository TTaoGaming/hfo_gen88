#!/usr/bin/env tsx
/**
 * 🔥 PORT 5: PYRE DANCE (The Pyre Praetorian)
 * 
 * Authority: Pyre Praetorian (The Defender)
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

// Step 3: The Shield (VacuoleEnvelope Wrapping)
function stepShield() {
    const silverDir = path.join(ROOT_DIR, 'hot_obsidian_sandbox/silver');
    if (!fs.existsSync(silverDir)) return;

    const files = getAllFiles(silverDir).filter(f => f.endsWith('.ts') && !f.endsWith('.test.ts'));
    let unshieldedCount = 0;

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        // Simple check for VacuoleEnvelope usage if it exports something
        if (content.includes('export ') && !content.includes('VacuoleEnvelope')) {
            console.warn(`⚠️ SHIELD WARNING: ${path.relative(ROOT_DIR, file)} is missing VacuoleEnvelope!`);
            unshieldedCount++;
        }
    }

    if (unshieldedCount > 0) {
        logDance('SHIELD', `Detected ${unshieldedCount} unshielded files in silver/. Remediation required.`);
    } else {
        logDance('SHIELD', 'All silver/ exports are properly shielded.');
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
console.log('🔥 PYRE DANCE COMPLETE. THE CLEANROOM IS HARDENED.');
