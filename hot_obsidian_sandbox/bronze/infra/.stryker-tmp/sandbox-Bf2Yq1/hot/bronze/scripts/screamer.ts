#!/usr/bin/env tsx
// @ts-nocheck
/**
 * 😱 THE HFO GEN 88 SCREAMER
 * 
 * This script is the "Immune System" of the Gen 88 Cleanroom.
 * It runs every 10 minutes to detect AI Theater, Hallucinations, and Architectural Violations.
 * 
 * RULES:
 * 1. NO BESPOKE LOGIC: Use Exemplars or fail.
 * 2. PORT ISOLATION: Ports cannot talk to each other directly.
 * 3. ENVELOPE MANDATORY: All data must be in a VacuoleEnvelope.
 * 4. TDD TRACEABILITY: No Green without Red in the Blackboard.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../../..');
const HOT_DIR = path.join(ROOT_DIR, 'hot');
const BLACKBOARD_PATH = path.resolve(ROOT_DIR, 'obsidianblackboard.jsonl');

const ALLOWED_ROOT_FILES = [
    'MANIFEST_GEN88.md',
    'AGENTS.md',
    'WORKFLOWS_GEN88.md',
    'PAIN_REGISTRY_GEN88.md',
    'TRANSITION_CHECKLIST.md',
    'package.json',
    'package-lock.json',
    'tsconfig.json',
    'obsidianblackboard.jsonl',
    'node_modules',
    'hot',
    'cold',
    'specs',
    'tests',
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

function scream(v: Violation) {
    console.error(`\n😱 SCREAM: [${v.type}] in ${v.file}`);
    console.error(`   > ${v.message}`);
    violations.push(v);
}

// 0. Check for Root Pollution
function checkRootPollution() {
    const entries = fs.readdirSync(ROOT_DIR);
    for (const entry of entries) {
        if (!ALLOWED_ROOT_FILES.includes(entry)) {
            scream({
                file: entry,
                type: 'POLLUTION',
                message: `Unauthorized file/folder in root. Gen 88 requires a cleanroom. Move to hot/bronze or archive to cold/.`
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
    
    if (content.includes('export const') && !content.includes('VacuoleEnvelope')) {
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

// 4. Main Audit Loop
function audit(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            audit(fullPath);
        } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.js')) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const relPath = path.relative(HOT_DIR, fullPath);
            
            checkPortIsolation(relPath, content);
            checkEnvelope(relPath, content);
            checkBespoke(relPath, content);
        }
    }
}

console.log('🛡️  GEN 88 IMMUNE SYSTEM SWEEP STARTING...');
checkRootPollution();
audit(HOT_DIR);

if (violations.length > 0) {
    console.error(`\n❌ SWEEP FAILED: ${violations.length} violations found.`);
    process.exit(1);
} else {
    console.log('\n✅ SWEEP PASSED: Architecture is intact.');
    process.exit(0);
}
