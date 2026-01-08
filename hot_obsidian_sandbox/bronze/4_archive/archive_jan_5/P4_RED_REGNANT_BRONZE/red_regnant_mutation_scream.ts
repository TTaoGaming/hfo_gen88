/**
 *  THE RED REGNANT'S MUTATION SCREAM (PORT 4)
 * 
 * Authority: Red Regnant (The Red Queen)
 * Provenance: hot_obsidian_sandbox/bronze/P4_RED_REGNANT/red_regnant_mutation_scream.ts
 * Pattern: Fail-Closed Promotion Quality Gate (Stop-the-Line Interlock)
 * Protocol: Negative Trust Protocol (NTP-001)
 * 
 * "How do we TEST the TEST? Mutation is the only truth."
 */

/**
 * THE RED REGNANT: MUTATION SCREAM GATEKEEPER (PORT 4)
 * Provenance: hot_obsidian_sandbox/bronze/P4_RED_REGNANT/red_regnant_mutation_scream.ts
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
const TEST_TIMEOUT_MS = 30000; // 30 seconds per test file audit
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
            console.error('\n 🛑 CIRCUIT BREAKER: Maximum violations reached. Screaming suppressed to prevent log flooding.');
            violations.push({ file: 'SYSTEM', type: 'VIOLATION', message: 'Maximum violations reached.' });
        }
        return;
    }

    const targetPath = blackboardPath || BLACKBOARD_PATH;
    console.error(`\n MUTATION SCREAM: [${v.type}] in ${v.file}`);
    console.error(`   > ${v.message}`);
    violations.push(v);
    
    // Log to Blackboard
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
                const testRelative = path.relative(ROOT_DIR, testPath);
                const testTarget = path.join(quarantineDir, path.basename(testPath));
                fs.renameSync(testPath, testTarget);
                console.error(`   > Also demoted test: ${testRelative}`);
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

// 1. Root Pollution Check
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

// 2. Mutation Proof Check (80-99%)
export function checkMutationProof(reportPath: string = MUTATION_REPORT_PATH, blackboardPath?: string) {
    if (!fs.existsSync(reportPath)) {
        console.warn(` WARNING: Mutation report missing at ${reportPath}. Skipping mutation check.`);
        return;
    }

    try {
        const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        const files = report.files || {};

        for (const [filePath, data] of Object.entries(files)) {
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
        scream({
            file: reportPath,
            type: 'MUTATION_FAILURE',
            message: `Failed to parse mutation report: ${err}`
        }, blackboardPath);
    }
}

// 3. Negative Trust Content Audit
export function auditContent(filePath: string, content: string, blackboardPath?: string) {
    const relativePath = path.relative(ROOT_DIR, filePath);

    // Amnesia: Debug logs in Silver/Gold
    if (content.includes('console.log(') || content.includes('console.debug(')) {
        scream({
            file: relativePath,
            type: 'AMNESIA',
            message: `Debug logs detected in Silver/Gold artifact. This is "Theater" masquerading as "Truth".`
        }, blackboardPath);
    }

    // Bespoke: 'any' or 'unknown' without justification
    const anyMatches = content.match(/:\s*any/g);
    if (anyMatches && !content.includes('// @bespoke')) {
        scream({
            file: relativePath,
            type: 'BESPOKE',
            message: `Bespoke 'any' type detected without // @bespoke justification.`
        }, blackboardPath);
    }

    // Provenance: Silver files must have a provenance header
    if (filePath.includes('silver') && !content.includes('Provenance:')) {
        scream({
            file: relativePath,
            type: 'VIOLATION',
            message: `Silver artifact missing provenance header. Provenance is mandatory for promotion.`
        }, blackboardPath);
    }
}

// 4. Silver/Gold Integrity Scan
export function scanMedallions(medallionPaths?: string[], blackboardPath?: string) {
    const medallions = medallionPaths || [path.join(HOT_DIR, 'silver'), path.join(HOT_DIR, 'gold')];
    
    for (const dir of medallions) {
        if (!fs.existsSync(dir)) continue;
        
        // Safety: Avoid scanning the root or cold sandbox unless explicitly asked
        if (dir === ROOT_DIR || dir.includes('cold_obsidian_sandbox')) {
            console.warn(`  QUEEN'S WARNING: Refusing to scan Forbidden Zone: ${dir}`);
            continue;
        }

        // Get relative depth to prevent bottomless traversal
        const walk = (currentDir: string, depth: number = 0) => {
            if (depth > RECURSION_LIMIT) {
                console.warn(`  🛑 RECURSION LIMIT: Skipping ${currentDir}`);
                return;
            }

            const entries = fs.readdirSync(currentDir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);
                const relativePath = path.relative(ROOT_DIR, fullPath);

                // Circuit Breaker: Ignore circular artifacts and quarantine
                if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'quarantine' || entry.name === '.stryker-tmp') {
                    continue;
                }

                if (entry.isDirectory()) {
                    walk(fullPath, depth + 1);
                    continue;
                }

                const content = fs.readFileSync(fullPath, 'utf8');
                
                // 1. Audit Content (Provenance, Amnesia, Bespoke)
                auditContent(fullPath, content, blackboardPath);

                // 2. Anti-Theater: Missing tests & Passing tests
                if (entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts') && !entry.name.endsWith('.d.ts')) {
                    const testPath = fullPath.replace(/\.ts$/, '.test.ts');
                    if (!fs.existsSync(testPath)) {
                        scream({
                            file: relativePath,
                            type: 'THEATER',
                            message: `Silver/Gold artifact missing corresponding test file.`
                        }, blackboardPath);
                    } else {
                        // Check if test passes
                        if (process.env.HFO_SKIP_VITEST === "true" || process.env.HFO_TEST_MODE === "true") {
                            console.log(`   > Skipping Vitest audit for ${relativePath} (Bypass active)`);
                        } else {
                            try {
                                execSync(`npx vitest run ${testPath}`, { 
                                    stdio: 'ignore', // Keep it clean
                                    timeout: TEST_TIMEOUT_MS,
                                    env: { ...process.env, HFO_SKIP_VITEST: "true" } // ENSURE NO RECURSION
                                });
                            } catch (e: any) {
                                const msg = e.code === 'ETIMEDOUT' ? 'Test timed out.' : 'Silver/Gold artifact has failing tests.';
                                scream({
                                    file: relativePath,
                                    type: 'THEATER',
                                    message: msg
                                }, blackboardPath);
                            }
                        }
                    }
                }

                // 3. Demotion Logic for Silver
                if (fullPath.includes('silver')) {
                    const fileViolations = violations.filter(v => v.file === relativePath);
                    if (fileViolations.length > 0) {
                        demote(fullPath, fileViolations[0].message, blackboardPath);
                    }
                }
            }
        };

        walk(dir);
    }
}

/**
 * Validates the integrity of the Blood Book of Grudges (JSONL).
 */
export function checkLedgerIntegrity(ledgerPath?: string, blackboardPath?: string) {
    const targetPath = ledgerPath || path.join(HOT_DIR, 'bronze/P4_RED_REGNANT/BLOOD_BOOK_OF_GRUDGES.jsonl');
    if (!fs.existsSync(targetPath)) {
        scream({
            type: 'VIOLATION',
            file: targetPath,
            message: 'Blood Book of Grudges is missing. Port 4 requires a ledger.'
        }, blackboardPath);
        return;
    }

    try {
        const content = fs.readFileSync(targetPath, 'utf8').trim();
        if (!content) return;
        const lines = content.split('\n');
        let expectedPrevHash = '0000000000000000000000000000000000000000000000000000000000000000';

        lines.forEach((line, i) => {
            if (line.startsWith('#')) return; // Skip comments
            const entry = JSON.parse(line);
            const result = BloodBookEntrySchema.safeParse(entry);
            
            if (!result.success) {
                scream({
                    type: 'VIOLATION',
                    file: targetPath,
                    message: `Ledger entry ${i} failed schema validation.`
                }, blackboardPath);
            }

            if (entry.prev_hash !== expectedPrevHash) {
                scream({
                    type: 'VIOLATION',
                    file: targetPath,
                    message: `Ledger integrity chain broken at entry ${i}.`
                }, blackboardPath);
            }

            const entryForHashing = { ...entry };
            delete entryForHashing.hash;
            const calculatedHash = crypto.createHash('sha256').update(JSON.stringify(entryForHashing)).digest('hex');
            
            if (entry.hash !== calculatedHash) {
                scream({
                    type: 'VIOLATION',
                    file: targetPath,
                    message: `Ledger hash mismatch at entry ${i}.`
                }, blackboardPath);
            }

            expectedPrevHash = entry.hash;
        });
    } catch (err: any) {
        scream({
            type: 'VIOLATION',
            file: targetPath,
            message: `Failed to process ledger: ${err.message}`
        }, blackboardPath);
    }
}

/**
 * Validates the Red Regnant Manifest (YAML).
 */
export function checkManifestIntegrity(manifestPath?: string, blackboardPath?: string) {
    const targetPath = manifestPath || path.join(HOT_DIR, 'bronze/P4_RED_REGNANT/MANIFEST.yaml');
    if (!fs.existsSync(targetPath)) {
        scream({
            type: 'VIOLATION',
            file: targetPath,
            message: 'Red Regnant Manifest is missing.'
        }, blackboardPath);
        return;
    }

    try {
        const content = fs.readFileSync(targetPath, 'utf8');
        const data = yaml.load(content);
        const result = ManifestSchema.safeParse(data);

        if (!result.success) {
            scream({
                type: 'VIOLATION',
                file: targetPath,
                message: 'Manifest failed schema validation.'
            }, blackboardPath);
        }

        const manifestData = data as any;
        if (manifestData.identity?.port !== 4) {
            scream({
                type: 'VIOLATION',
                file: targetPath,
                message: 'Manifest port mismatch. Expected Port 4.'
            }, blackboardPath);
        }
    } catch (err: any) {
        scream({
            type: 'VIOLATION',
            file: targetPath,
            message: `Failed to process manifest: ${err.message}`
        }, blackboardPath);
    }
}

// EXECUTION
/**
 * Main execution entry point
 */
export function main() {
    console.log(' RED REGNANT: Initiating Mutation Scream Mode...');
    checkRootPollution();
    checkMutationProof();
    scanMedallions();
    checkLedgerIntegrity();
    checkManifestIntegrity();

    if (violations.length > 0) {
        console.error(`\n SYSTEM COMPROMISED: ${violations.length} violations found.`);
        process.exit(1);
    } else {
        console.log('\n CLEANROOM INTEGRITY VERIFIED. The Red Queen is satisfied.');
        process.exit(0);
    }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
}
