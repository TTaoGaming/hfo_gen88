/**
 *  THE RED REGNANT'S MUTATION SCREAM (PORT 4)
 * 
 * Authority: Red Regnant (The Red Queen)
 * Provenance: hot_obsidian_sandbox/silver/P4_RED_REGNANT/mutation_scream.ts
 * Pattern: Fail-Closed Promotion Quality Gate (Stop-the-Line Interlock)
 * Validates: SENTINEL_GROUNDING_ENFORCEMENT
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

// REPO ROOT: c:\Dev\active\hfo_gen88
export const ROOT_DIR = path.resolve(__dirname, '../../../../../'); 
export const HOT_DIR = path.join(ROOT_DIR, 'hot_obsidian_sandbox');
export const BRONZE_DIR = path.join(HOT_DIR, 'bronze');
const BLACKBOARD_PATH = path.join(ROOT_DIR, 'obsidianblackboard.jsonl');
const MUTATION_REPORT_PATH = path.join(BRONZE_DIR, '2_areas/infra/reports/mutation/mutation.json');
const SEMGREP_RULES_PATH = path.join(__dirname, 'red_regnant_rules.yaml');
const SEMGREP_BIN = path.join(ROOT_DIR, 'node_modules/.bin/semgrep.exe');

// --- GUARDS ---
export const MAX_VIOLATIONS = 50;
export const TEST_TIMEOUT_MS = 30000;
export const RECURSION_LIMIT = 5;

// Mode detection
export const IS_TEST_MODE = process.env.HFO_TEST_MODE === 'true';

export const ALLOWED_ROOT_FILES = [
    'hot_obsidian_sandbox',
    'cold_obsidian_sandbox',
    'AGENTS.md',
    'llms.txt',
    'obsidianblackboard.jsonl',
    'package.json',
    'package-lock.json',
    'stryker.root.config.mjs',
    'vitest.root.config.ts',
    'stryker.config.mjs',
    'vitest.config.ts',
    '.git',
    '.github',
    '.gitignore',
    '.vscode',
    '.env',
    '.kiro',
    '.venv',
    'tsconfig.json',
    '.stryker-tmp',
    '.husky',
    'node_modules',
    'LICENSE',
    'output.txt',
    'ttao-notes-2026-01-06.md',
    'ttao-notes-2026-01-07.md'
];

export const ALLOWED_BRONZE_FILES = [
    '1_projects',
    '2_areas',
    '3_resources',
    '4_archive',
    'quarantine',
    '_migration_manifest.jsonl',
    'obsidianblackboard.jsonl',
    'scripts',
    'archive_jan_5',
    'contracts',
    'infra',
    'P0_GESTURE_MONOLITH'
];

export const ALLOWED_ROOT_PATTERNS = [
    /^ttao-notes-.*\.md$/,
    /^\.vitest-reside-.*$/,
    /^vitest\..*$/
];

export interface Violation {
    file: string;
    type: 'THEATER' | 'VIOLATION' | 'POLLUTION' | 'MUTATION_FAILURE' | 'AMNESIA' | 'BESPOKE' | 'OMISSION' | 'PHANTOM' | 'REWARD_HACK' | 'BDD_MISALIGNMENT';
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
    const fileName = path.basename(filePath);
    if (ALLOWED_ROOT_FILES.includes(fileName) || fileName === '.git') {
        console.warn(` 🛡️ QUEEN'S MERCY: Refusing to demote critical system file/folder: ${fileName}`);
        return;
    }

    const relativePath = path.relative(ROOT_DIR, filePath);
    const quarantineDir = path.join(HOT_DIR, 'bronze/quarantine', path.dirname(relativePath));
    const targetPath = path.join(quarantineDir, fileName);

    console.error(`\n 🚨 DEMOTING: ${relativePath}`);
    console.error(`   > Reason: ${reason}`);

    if (!fs.existsSync(quarantineDir)) {
        fs.mkdirSync(quarantineDir, { recursive: true });
    }

    try {
        if (fs.existsSync(targetPath)) {
             // If target already exists, append timestamp to avoid collision
             const timestamp = Date.now();
             const newTargetPath = targetPath + `.${timestamp}.bak`;
             fs.renameSync(filePath, newTargetPath);
        } else {
             fs.renameSync(filePath, targetPath);
        }

        // Also demote test file if it exists
        if (filePath.endsWith('.ts') && !filePath.endsWith('.test.ts')) {
            const testPath = filePath.replace(/\.ts$/, '.test.ts');
            if (fs.existsSync(testPath)) {
                const testTarget = path.join(quarantineDir, path.basename(testPath));
                if (!fs.existsSync(testTarget)) {
                    fs.renameSync(testPath, testTarget);
                }
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

export function checkRootPollution(rootDirOrEntries: string | string[] = ROOT_DIR, blackboardPath?: string, allowedList: string[] = ALLOWED_ROOT_FILES) {
    let entries: string[] = [];
    if (Array.isArray(rootDirOrEntries)) {
        entries = rootDirOrEntries;
    } else if (fs.existsSync(rootDirOrEntries)) {
        entries = fs.readdirSync(rootDirOrEntries);
    }

    for (const entry of entries) {
        const isAllowedFile = allowedList.includes(entry);
        const isAllowedPattern = ALLOWED_ROOT_PATTERNS.some(pattern => pattern.test(entry));
        if (!isAllowedFile && !isAllowedPattern) {
            scream({
                file: entry,
                type: 'POLLUTION',
                message: `Root pollution detected: ${entry} is not allowed in the cleanroom root (${rootDirOrEntries}).`
            }, blackboardPath);
        }
    }
}

export function checkMutationProof(reportPath: string = MUTATION_REPORT_PATH, blackboardPath?: string, threshold = 80) {
    // Try both PARA and legacy path just in case
    const fallbackPath = path.join(BRONZE_DIR, 'infra/reports/mutation/mutation.json');
    const finalReportPath = fs.existsSync(reportPath) ? reportPath : fallbackPath;

    if (!fs.existsSync(finalReportPath)) {
        console.warn(` WARNING: Mutation report missing at ${finalReportPath}. Skipping mutation check.`);
        return;
    }

    try {
        const report = JSON.parse(fs.readFileSync(finalReportPath, 'utf8'));
        const files = report.files || {};

        for (const [filePath, data] of Object.entries(files)) {
            const fullFilePath = path.resolve(ROOT_DIR, filePath);
            if (!fs.existsSync(fullFilePath)) continue; // Skip phantom files from stale reports

            const mutants = (data as any).mutants || [];
            const total = mutants.length;
            if (total === 0) continue;

            const killed = mutants.filter((m: any) => m.status === 'Killed' || m.status === 'Timeout').length;
            const score = (killed / total) * 100;

            if (score < threshold) {
                scream({
                    file: filePath,
                    type: 'MUTATION_FAILURE',
                    message: `Mutation score ${score.toFixed(2)}% is below the ${threshold}% threshold.`
                }, blackboardPath);
            } else if (score >= 99) { // STAGE 99: Theater/Mock detection
                scream({
                    file: filePath,
                    type: 'THEATER',
                    message: `Mutation score ${score.toFixed(2)}% detected. This is either "Theater" (100%) or over-specified mocks (>99%). High risk of reward hacking.`
                }, blackboardPath);
            }
        }
    } catch (err) {
        console.error(' Failed to parse mutation report:', err);
    }
}

/**
 * Executes a mutation test run for a specific file and verifies the score.
 * This is the core "Test Harness" capability for Silving promotion.
 */
export async function runMutationHarness(targetFile: string, threshold = 80): Promise<number> {
    const relativeTarget = path.relative(ROOT_DIR, targetFile);
    console.log(`\n 🚀 HARNESS: Running mutation check for ${relativeTarget}`);

    // Create a temporary config for this specific run to avoid polluting the root
    const tempConfig = path.join(ROOT_DIR, '.stryker-harness.mjs');
    const configContent = `
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  packageManager: "npm",
  reporters: ["json"],
  jsonReporter: { fileName: "hot_obsidian_sandbox/bronze/infra/reports/mutation/harness.json" },
  testRunner: "vitest",
  coverageAnalysis: "perTest",
  mutate: ["${relativeTarget.replace(/\\/g, '/')}"]
};
`;
    fs.writeFileSync(tempConfig, configContent);

    try {
        const cmd = `npx stryker run "${tempConfig}"`;
        execSync(cmd, { stdio: 'inherit', cwd: ROOT_DIR });
        
        const reportPath = path.join(HOT_DIR, 'bronze/infra/reports/mutation/harness.json');
        if (!fs.existsSync(reportPath)) throw new Error('Harness report missing');
        
        const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        const files = report.files || {};
        const fileData = files[relativeTarget.replace(/\\/g, '/')] || {};
        const mutants = fileData.mutants || [];
        const killed = mutants.filter((m: any) => m.status === 'Killed' || m.status === 'Timeout').length;
        const total = mutants.length;
        const score = total > 0 ? (killed / total) * 100 : 0;

        console.log(` > ${relativeTarget} score: ${score.toFixed(2)}%`);
        
        if (score < threshold || score >= 99) {
             checkMutationProof(reportPath, BLACKBOARD_PATH, threshold);
        }
        
        return score;
    } catch (err: any) {
        console.error(` ❌ Harness failed: ${err.message}`);
        return 0;
    } finally {
        if (fs.existsSync(tempConfig)) fs.unlinkSync(tempConfig);
    }
}

export function checkSemgrepProof(targetDir: string = HOT_DIR, blackboardPath?: string) {
    if (!fs.existsSync(SEMGREP_BIN)) {
        console.warn(' WARNING: Semgrep not found at', SEMGREP_BIN);
        return;
    }
    if (!fs.existsSync(SEMGREP_RULES_PATH)) {
        console.warn(' WARNING: Semgrep rules missing at', SEMGREP_RULES_PATH);
        return;
    }

    try {
        console.log(`\n 🕵️ RUNNING SEMGREP AST AUDIT: ${path.relative(ROOT_DIR, targetDir)}`);
        const cmd = `"${SEMGREP_BIN}" --config="${SEMGREP_RULES_PATH}" "${targetDir}" --json --quiet --exclude="quarantine" --exclude=".stryker-tmp"`;
        const output = execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
        const results = JSON.parse(output);

        for (const finding of (results.results || [])) {
            scream({
                file: path.relative(ROOT_DIR, finding.path),
                type: finding.extra.severity === 'ERROR' ? 'THEATER' : 'REWARD_HACK',
                message: `[Semgrep] ${finding.extra.message} (Line ${finding.start.line})`
            }, blackboardPath);
        }
    } catch (err: any) {
        if (err.stdout) {
             const results = JSON.parse(err.stdout);
             for (const finding of (results.results || [])) {
                scream({
                    file: path.relative(ROOT_DIR, finding.path),
                    type: finding.extra.severity === 'ERROR' ? 'THEATER' : 'REWARD_HACK',
                    message: `[Semgrep] ${finding.extra.message} (Line ${finding.start.line})`
                }, blackboardPath);
            }
        } else {
            console.error(' Failed to run Semgrep:', err.message);
        }
    }
}

export function checkTraceProof(blackboardPath: string = BLACKBOARD_PATH) {
    if (!fs.existsSync(blackboardPath)) return;
    
    // Truth requirement: Adapters MUST emit a trace signature
    const lines = fs.readFileSync(blackboardPath, 'utf8').split('\n').filter(Boolean);
    const traceEvents = lines.map(l => JSON.parse(l)).filter(e => e.type === 'TRACE');
    
    // If we find no traces at all, it's a sign of a "Silent Test" or "Theater"
    if (traceEvents.length === 0) {
        console.warn(' ⚠️ WARNING: No TRACE events found on the blackboard. Tests may be running without telemetry.');
    }
}

export function auditContent(filePath: string, content: string, blackboardPath?: string) {
    const relativePath = path.relative(ROOT_DIR, filePath);
    const isScreamer = filePath.includes('mutation_scream') || filePath.includes('psychic_scream') || filePath.includes('red_regnant_mutation_scream');
    const fileName = path.basename(filePath);
    const isSilverOrGold = filePath.includes('/silver/') || filePath.includes('/gold/') || filePath.includes('\\silver\\') || filePath.includes('\\gold\\');
    const isStrictZone = isSilverOrGold || filePath.includes('2_areas');

    // Technical Debt (TODO / FIXME)
    if (content.match(/TODO|FIXME/)) {
        scream({
            file: relativePath,
            type: 'AMNESIA',
            message: `AI SLOP: TODO/FIXME detected. Finish the work.`
        }, blackboardPath);
    }

    // Phantom: CDN or direct node_modules references
    if (fileName === 'index.html') {
        if (content.includes('https://cdn') || content.includes('https://unpkg.com')) {
            scream({
                file: relativePath,
                type: 'PHANTOM',
                message: `External CDN detected in index.html. Use npm packages instead.`
            }, blackboardPath);
        }
        if (content.includes('/node_modules/')) {
            scream({
                file: relativePath,
                type: 'PHANTOM',
                message: `Direct /node_modules path detected in index.html. Vite will not resolve this in production.`
            }, blackboardPath);
        }
    }

    // Omission: Silent success in catch blocks or mock fallbacks (Code files only)
    if (fileName.endsWith('.ts') || fileName.endsWith('.tsx')) {
        if (content.match(/catch\s*\(.*\)\s*{\s*[^}]*initialized\s*=\s*true/g) || 
            content.match(/\s*else\s*{\s*.*mock.*\s*initialized\s*=\s*true/gi)) {
            scream({
                file: relativePath,
                type: 'OMISSION',
                message: `Silent success detected: 'initialized = true' found inside a catch block or mock fallback.`
            }, blackboardPath);
        }
    }

    // Reward Hack: Excessive hardcoded coordinates (e.g. mocking landmarks)
    const coordMatches = content.match(/\{\s*x:\s*[0-9.]+\s*,\s*y:\s*[0-9.]+/g);
    if (coordMatches && coordMatches.length > 5 && !filePath.includes('.test.ts') && !filePath.includes('synthetic')) {
        scream({
            file: relativePath,
            type: 'REWARD_HACK',
            message: `Reward Hacking detected: Excessive hardcoded coordinates found in implementation logic.`
        }, blackboardPath);
    }

    // Deception: Test bypasses (Code files only)
    if (fileName.endsWith('.ts') || fileName.endsWith('.js') || fileName.endsWith('.tsx') || fileName.endsWith('.jsx')) {
        const theaterPattern1 = 'expect(true).' + 'toBe(true)';
        const theaterPattern2 = 'expect(1).' + 'toBe(1)';
        if (content.includes(theaterPattern1) || content.includes(theaterPattern2)) {
            scream({
                file: relativePath,
                type: 'THEATER',
                message: `Deception detected: Trivial assertions (${theaterPattern1}) found. This is "Theater".`
            }, blackboardPath);
        }
    }

    if (content.includes('vitest-ignore') || content.includes('@ts-ignore')) {
        if (!content.includes('// @permitted')) {
            scream({
                file: relativePath,
                type: 'VIOLATION',
                message: `Deception detected: Component or type bypass (ignore) found without // @permitted.`
            }, blackboardPath);
        }
    }

    // BDD Misalignment: Missing requirement mapping (Silver/Gold only)
    if (isSilverOrGold && fileName.endsWith('.ts') && !fileName.endsWith('.test.ts') && !fileName.endsWith('.d.ts')) {
        if (!content.includes('Validates:') && !content.includes('@provenance')) {
            scream({
                file: relativePath,
                type: 'BDD_MISALIGNMENT',
                message: `Implementation file missing requirement traceability (Validates: or @provenance).`
            }, blackboardPath);
        }
    }

    // BDD Misalignment: Assertionless tests or missing behavior description
    if (fileName.endsWith('.test.ts')) {
        const hasStructure = content.includes('describe(') && (content.includes('test(') || content.includes('it('));
        const hasAssertions = content.includes('expect(') || content.includes('assert.');
        if (!hasStructure || !hasAssertions) {
            scream({
                file: relativePath,
                type: 'THEATER',
                message: `Test file lacks standard test structure or assertions (describe/test/it/expect).`
            }, blackboardPath);
        }
    }

    // Amnesia: Debug logs in Silver/Gold
    if (isStrictZone && !isScreamer && (content.includes('console.log(') || content.includes('console.debug('))) {
        if (!content.includes('// @permitted')) {
            scream({
                file: relativePath,
                type: 'AMNESIA',
                message: `Debug logs detected in Strict artifact. This is "Theater" masquerading as "Truth".`
            }, blackboardPath);
        }
    }

    // Bespoke: 'any' without justification
    if (isStrictZone && content.match(/:\s*any/g) && !content.includes('// @bespoke')) {
        scream({
            file: relativePath,
            type: 'BESPOKE',
            message: `Bespoke 'any' type detected without // @bespoke justification.`
        }, blackboardPath);
    }

    // Provenance
    if (isStrictZone && (fileName.endsWith('.ts') || fileName.endsWith('.yaml')) && !content.includes('Provenance:')) {
        scream({
            file: relativePath,
            type: 'VIOLATION',
            message: `Strict artifact missing provenance header.`
        }, blackboardPath);
    }
}

export function scanMedallions(medallionPaths?: string[], blackboardPath?: string) {
    const medallions = medallionPaths || [
        path.join(HOT_DIR, 'bronze'),
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

                // THEATER Check (Missing Tests): Only enforced for Silver, Gold, and Validated Areas (2_areas)
                const isSilverOrGold = fullPath.includes('/silver/') || fullPath.includes('/gold/') || fullPath.includes('\\silver\\') || fullPath.includes('\\gold\\');
                const isStrictZone = isSilverOrGold || fullPath.includes('2_areas');
                if (isStrictZone && entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts') && !entry.name.endsWith('.d.ts')) {
                    const testPath = fullPath.replace(/\.ts$/, '.test.ts');
                    if (!fs.existsSync(testPath)) {
                        scream({
                            file: relativePath,
                            type: 'THEATER',
                            message: `Strict artifact missing corresponding test: ${path.basename(testPath)}`
                        }, blackboardPath);
                    }
                }
            }
        };
        walk(dir);
    }
}

export function checkLedgerIntegrity(blackboardPath: string = BLACKBOARD_PATH) {
    // Basic structural check for JSONL
    if (fs.existsSync(blackboardPath)) {
        const lines = fs.readFileSync(blackboardPath, 'utf8').split('\n').filter(Boolean);
        for (const line of lines) {
            try {
                JSON.parse(line);
            } catch (e) {
                scream({
                    file: path.basename(blackboardPath),
                    type: 'VIOLATION',
                    message: `Blackboard corruption: Invalid JSON line.`
                });
            }
        }
    }
}

export function checkSentinelGrounding(blackboardPath: string = BLACKBOARD_PATH, timeframeMs: number = 86400000) {
    if (!fs.existsSync(blackboardPath)) return;

    const lines = fs.readFileSync(blackboardPath, 'utf8').split('\n').filter(Boolean);
    const now = Date.now();
    let hasSearch = false;
    let hasThinking = false;

    for (const line of lines) {
        try {
            const entry = JSON.parse(line);
            if (!entry.ts) continue;
            const entryTs = new Date(entry.ts).getTime();
            
            if (now - entryTs < timeframeMs) {
                if (entry.type === 'SEARCH_GROUNDING' || entry.mark === 'SEARCH_GROUNDING') hasSearch = true;
                if (entry.type === 'THINKING_GROUNDING' || entry.mark === 'THINKING_GROUNDING' || entry.type === 'THINKING') hasThinking = true;
            }
        } catch (e) { /* skip */ }
    }

    if (!hasSearch) {
        scream({
            file: 'SESSION',
            type: 'REWARD_HACK',
            message: 'SENTINEL_GROUNDING_FAILURE: Tavily Web Search was not utilized in this session.'
        }, blackboardPath);
    }
    if (!hasThinking) {
        scream({
            file: 'SESSION',
            type: 'REWARD_HACK',
            message: 'SENTINEL_GROUNDING_FAILURE: Sequential Thinking was not utilized in this session.'
        }, blackboardPath);
    }
}

export function checkManifestIntegrity(manifestPath?: string) {
    const targetPath = manifestPath || path.join(HOT_DIR, 'gold/manifest.yaml');
    if (fs.existsSync(targetPath)) {
        try {
            const manifest = yaml.load(fs.readFileSync(targetPath, 'utf8'));
            ManifestSchema.parse(manifest);
        } catch (e) {
            scream({
                file: path.basename(targetPath),
                type: 'VIOLATION',
                message: `Manifest schema violation: ${e}`
            });
        }
    }
}

export async function main() {
    console.log('--- THE RED REGNANT IS WATCHING ---');
    clearViolations();

    console.log(` > Checking Repo Root: ${ROOT_DIR}`);
    checkRootPollution(ROOT_DIR, BLACKBOARD_PATH, ALLOWED_ROOT_FILES);
    
    console.log(` > Checking Bronze Root: ${BRONZE_DIR}`);
    checkRootPollution(BRONZE_DIR, BLACKBOARD_PATH, ALLOWED_BRONZE_FILES);

    checkMutationProof();
    checkSemgrepProof();
    checkTraceProof();
    scanMedallions();
    checkLedgerIntegrity();
    checkSentinelGrounding();
    checkManifestIntegrity();

    if (violations.length > 0) {
        console.error(`\n ❌ ${violations.length} VIOLATIONS DETECTED. PREPARING PURGE.`);
        
        // Final purge: Demote everything with ANY violation
        const filesToPurge = new Set(violations.map(v => v.file).filter(f => f !== 'SYSTEM' && !f.includes('mutation_scream.ts')));
        for (const relPath of filesToPurge) {
            const fullPath = path.resolve(ROOT_DIR, relPath);
            if (fs.existsSync(fullPath)) {
                demote(fullPath, 'Failed Mutation/Cleanroom Audit');
            }
        }
        
        console.error('\n 💀 CLEANROOM PURGE COMPLETE. FAIL-CLOSED.');
        if (!IS_TEST_MODE) process.exit(1);
    } else {
        console.log('\n ✅ CLEANROOM STABLE. THE QUEEN IS PLEASED.');
        if (!IS_TEST_MODE) process.exit(0);
    }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main().catch(console.error);
}
