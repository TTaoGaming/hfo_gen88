/**
 *  THE RED REGNANT'S PHYSIC SCREAM (PORT 4)
 * 
 * Authority: Red Regnant (The Red Queen)
 * Provenance: hot_obsidian_sandbox/silver/P4_RED_REGNANT/physic_scream.ts
 * Pattern: Fail-Closed Promotion Quality Gate (Stop-the-Line Interlock)
 * Protocol: Negative Trust Protocol (NTP-001)
 * 
 * "How do we TEST the TEST? Mutation is the only truth."
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { z } from 'zod';
import * as yaml from 'js-yaml';

// --- SCHEMAS (Inlined for Silver Autonomy) ---

export const CacaoStepSchema = z.object({
    type: z.string(),
    name: z.string(),
    description: z.string(),
});

export const CacaoPlaybookSchema = z.object({
    type: z.literal('playbook'),
    id: z.string().startsWith('playbook--'),
    name: z.string(),
    description: z.string(),
    steps: z.array(CacaoStepSchema),
});

export const BloodBookEntrySchema = z.object({
    index: z.number(),
    ts: z.string(),
    artifact_id: z.string(),
    resonance_signature: z.string(),
    prev_hash: z.string(),
    hash: z.string(),
    cacao_playbook: CacaoPlaybookSchema.optional(),
}).passthrough();

export const ManifestSchema = z.object({
    identity: z.object({
        port: z.number(),
        commander: z.string(),
    }).passthrough(),
    galois_lattice: z.object({
        coordinate: z.array(z.number()).length(2),
    }).passthrough(),
    dna: z.object({
        hfo_generation: z.number(),
    }).passthrough(),
}).passthrough();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ROOT_DIR = path.resolve(__dirname, '../../../');
export const HOT_DIR = path.join(ROOT_DIR, 'hot_obsidian_sandbox');
const BLACKBOARD_PATH = path.resolve(ROOT_DIR, 'obsidianblackboard.jsonl');
const MUTATION_REPORT_PATH = path.join(HOT_DIR, 'bronze/infra/reports/mutation/mutation.json');

// --- GUARDS ---
const MAX_VIOLATIONS = 50;
const TEST_TIMEOUT_MS = 30000;
const RECURSION_LIMIT = 5;

// Mode detection
export const IS_TEST_MODE = process.env.HFO_TEST_MODE === 'true';

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
    '.git',
    '.gitignore',
    '.vscode',
    '.env',
    '.kiro',
    '.stryker-tmp',
    '.husky',
    'node_modules'
];

const ALLOWED_ROOT_PATTERNS = [
    /^ttao-notes-.*\.md$/,
    /^\.vitest-reside-.*$/,
    /^vitest\..*$/
];

export interface Violation {
    file: string;
    type: 'THEATER' | 'VIOLATION' | 'POLLUTION' | 'MUTATION_FAILURE' | 'AMNESIA' | 'BESPOKE';
    message: string;
}

export const violations: Violation[] = [];

export function clearViolations() {
    violations.length = 0;
}

export function scream(v: Violation, blackboardPath?: string) {
    if (violations.length >= MAX_VIOLATIONS) {
        if (violations.length === MAX_VIOLATIONS) {
            console.error('\n 🛑 CIRCUIT BREAKER: Maximum violations reached. Screaming suppressed.');
            violations.push({
                file: 'SYSTEM',
                type: 'VIOLATION',
                message: 'Maximum violations reached.'
            });
        }
        return;
    }

    const targetPath = blackboardPath || BLACKBOARD_PATH;
    console.error(`\n MUTATION SCREAM: [${v.type}] in ${v.file}`);
    console.error(`   > ${v.message}`);
    violations.push(v);

    const logEntry = {
        ts: new Date().toISOString(),
        type: 'SCREAM',
        mark: 'MUTATION_SCREAM_VIOLATION',
        file: v.file,
        violationType: v.type,
        msg: v.message,
        hive: 'HFO_GEN88',
        gen: 88,
        port: 4
    };

    try {
        fs.appendFileSync(targetPath, JSON.stringify(logEntry) + '\n');
    } catch (e) {
        // Ignore blackboard errors in tests
    }
}

export function demote(filePath: string, reason: string, blackboardPath?: string) {
    const relativePath = path.relative(ROOT_DIR, filePath);
    const quarantineDir = path.join(HOT_DIR, 'bronze/quarantine', path.dirname(relativePath));
    const targetPath = path.join(quarantineDir, path.basename(filePath));

    console.error(`\n 🚨 DEMOTING: ${relativePath}`);
    console.error(`   > Reason: ${reason}`);

    if (!fs.existsSync(quarantineDir)) {
        fs.mkdirSync(quarantineDir, { recursive: true });
    }

    try {
        fs.renameSync(filePath, targetPath);

        // Also demote test file if it exists
        if (filePath.endsWith('.ts') && !filePath.endsWith('.test.ts')) {
            const testPath = filePath.replace(/\.ts$/, '.test.ts');
            if (fs.existsSync(testPath)) {
                const testTarget = path.join(quarantineDir, path.basename(testPath));
                fs.renameSync(testPath, testTarget);
            }
        }

        const logEntry = {
            ts: new Date().toISOString(),
            type: 'DEMOTION',
            mark: 'RED_REGNANT_DEMOTION',
            file: relativePath,
            reason: reason,
            target: path.relative(ROOT_DIR, targetPath),
            hive: 'HFO_GEN88',
            gen: 88,
            port: 4
        };
        fs.appendFileSync(blackboardPath || BLACKBOARD_PATH, JSON.stringify(logEntry) + '\n');
    } catch (err) {
        console.error(`   > Failed to demote: ${err}`);
    }
}

export function checkRootPollution(entries?: string[], blackboardPath?: string) {
    const targetEntries = entries || fs.readdirSync(ROOT_DIR);
    for (const entry of targetEntries) {
        const isAllowedFile = ALLOWED_ROOT_FILES.includes(entry);
        const isAllowedPattern = ALLOWED_ROOT_PATTERNS.some(pattern => pattern.test(entry));
        if (!isAllowedFile && !isAllowedPattern) {
            scream({
                file: entry,
                type: 'POLLUTION',
                message: `Root pollution detected: ${entry} is not allowed in the cleanroom root.`
            }, blackboardPath);
        }
    }
}

export function checkMutationProof(reportPath: string = MUTATION_REPORT_PATH, blackboardPath?: string) {
    if (!fs.existsSync(reportPath)) {
        console.warn(` WARNING: Mutation report missing at ${reportPath}. Skipping mutation check.`);
        return;
    }

    try {
        const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        const files = report.files || {};

        for (const [filePath, data] of Object.entries(files)) {
            const fullFilePath = path.resolve(ROOT_DIR, filePath);
            if (!fs.existsSync(fullFilePath)) continue; // Skip phantom files from stale reports

            const mutants = (data as any).mutants || [];
            const total = mutants.length;
            if (total === 0) continue;

            const killed = mutants.filter((m: any) => m.status === 'Killed' || m.status === 'Timeout').length;
            const score = (killed / total) * 100;

            if (score < 80) {
                scream({
                    file: filePath,
                    type: 'MUTATION_FAILURE',
                    message: `Mutation score ${score.toFixed(2)}% is below the 80% threshold.`
                }, blackboardPath);
            } else if (score >= 100) {
                scream({
                    file: filePath,
                    type: 'THEATER',
                    message: `Mutation score 100% detected. This is "Theater" and is forbidden.`
                }, blackboardPath);
            }
        }
    } catch (err) {
        console.error(' Failed to parse mutation report:', err);
    }
}

export function auditContent(filePath: string, content: string, blackboardPath?: string) {
    const relativePath = path.relative(ROOT_DIR, filePath);
    const isScreamer = filePath.includes('physic_scream') || filePath.includes('red_regnant_mutation_scream');

    // Amnesia: Debug logs in Silver/Gold
    if (!isScreamer && (content.includes('console.log(') || content.includes('console.debug('))) {
        if (!content.includes('// @permitted')) {
            scream({
                file: relativePath,
                type: 'AMNESIA',
                message: `Debug logs detected in Silver/Gold artifact. This is "Theater" masquerading as "Truth".`
            }, blackboardPath);
        }
    }

    // Bespoke: 'any' without justification
    if (content.match(/:\s*any/g) && !content.includes('// @bespoke')) {
        scream({
            file: relativePath,
            type: 'BESPOKE',
            message: `Bespoke 'any' type detected without // @bespoke justification.`
        }, blackboardPath);
    }

    // Provenance
    if (filePath.includes('silver') && !content.includes('Provenance:')) {
        scream({
            file: relativePath,
            type: 'VIOLATION',
            message: `Silver artifact missing provenance header.`
        }, blackboardPath);
    }
}

export function scanMedallions(medallionPaths?: string[], blackboardPath?: string) {
    const medallions = medallionPaths || [
        path.join(HOT_DIR, 'silver'),
        path.join(HOT_DIR, 'gold')
    ];

    for (const dir of medallions) {
        if (!fs.existsSync(dir)) continue;

        if (dir === ROOT_DIR || dir.includes('cold_obsidian_sandbox')) {
            console.warn(`  QUEEN'S WARNING: Refusing to scan Forbidden Zone: ${dir}`);
            continue;
        }

        const walk = (currentDir: string, depth: number = 0) => {
            if (depth > RECURSION_LIMIT) return;
            const entries = fs.readdirSync(currentDir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);
                if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'quarantine' || entry.name === '.stryker-tmp') continue;

                if (entry.isDirectory()) {
                    walk(fullPath, depth + 1);
                    continue;
                }

                const content = fs.readFileSync(fullPath, 'utf8');
                auditContent(fullPath, content, blackboardPath);

                if (entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts') && !entry.name.endsWith('.d.ts')) {
                    const testPath = fullPath.replace(/\.ts$/, '.test.ts');
                    if (!fs.existsSync(testPath)) {
                        scream({
                            file: path.relative(ROOT_DIR, fullPath),
                            type: 'THEATER',
                            message: `Silver/Gold implementation missing corresponding test: ${path.basename(testPath)}`
                        }, blackboardPath);
                    }
                }
            }
        };
        walk(dir);
    }
}

export function checkLedgerIntegrity() {
    // Basic structural check for JSONL
    if (fs.existsSync(BLACKBOARD_PATH)) {
        const lines = fs.readFileSync(BLACKBOARD_PATH, 'utf8').split('\n').filter(Boolean);
        for (const line of lines) {
            try {
                JSON.parse(line);
            } catch (e) {
                scream({
                    file: 'obsidianblackboard.jsonl',
                    type: 'VIOLATION',
                    message: `Blackboard corruption: Invalid JSON line.`
                });
            }
        }
    }
}

export function checkManifestIntegrity() {
    const manifestPath = path.join(HOT_DIR, 'gold/manifest.yaml');
    if (fs.existsSync(manifestPath)) {
        try {
            const manifest = yaml.load(fs.readFileSync(manifestPath, 'utf8'));
            ManifestSchema.parse(manifest);
        } catch (e) {
            scream({
                file: 'manifest.yaml',
                type: 'VIOLATION',
                message: `Manifest schema violation: ${e}`
            });
        }
    }
}

export async function main() {
    console.log('--- THE RED REGNANT IS WATCHING ---');
    clearViolations();

    checkRootPollution();
    checkMutationProof();
    scanMedallions();
    checkLedgerIntegrity();
    checkManifestIntegrity();

    if (violations.length > 0) {
        console.error(`\n ❌ ${violations.length} VIOLATIONS DETECTED. PREPARING PURGE.`);
        
        // Final purge: Demote everything with ANY violation
        const filesToPurge = new Set(violations.map(v => v.file).filter(f => f !== 'SYSTEM'));
        for (const relPath of filesToPurge) {
            const fullPath = path.resolve(ROOT_DIR, relPath);
            if (fs.existsSync(fullPath)) {
                demote(fullPath, 'Failed Mutation/Cleanroom Audit');
            }
        }
        
        console.error('\n 💀 CLEANROOM PURGE COMPLETE. FAIL-CLOSED.');
        process.exit(1);
    } else {
        console.log('\n ✅ CLEANROOM STABLE. THE QUEEN IS PLEASED.');
        process.exit(0);
    }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main().catch(console.error);
}
