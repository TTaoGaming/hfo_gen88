/**
 *  RED REGNANT (PORT 0x04: THE RED QUEEN)
 * 
 * "It takes all the running you can do, to keep in the same place."
 * 
 * Identity: The Red Queen (Crimson Robes of Office)
 * Verb: SING (Purity) / SCREAM (Violations)
 * Artifact: THE BLOOD BOOK OF GRUDGES (JSONL Failure Ledger)
 * Profile: Strange Loop Disruption / Behavioral Sensing / Anti-Theater
 * 
 * Pair: PYRE PRAETORIAN (Port 0x05) - The co-evolutionary dance of fire and thunder.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { z } from 'zod';
import * as yaml from 'js-yaml';
import duckdb from 'duckdb';
import { ArtifactContract } from '../P5_PYRE_PRAETORIAN/PHOENIX_CONTRACTS.js';

// --- INFRASTRUCTURE ---

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const ROOT_DIR = path.resolve(__dirname, '../../../'); 
export const HOT_DIR = path.join(ROOT_DIR, 'hot_obsidian_sandbox');
export const COLD_DIR = path.join(ROOT_DIR, 'cold_obsidian_sandbox');
export const BRONZE_DIR = path.join(HOT_DIR, 'bronze');
export const SILVER_DIR = path.join(HOT_DIR, 'silver');
export const GOLD_DIR = path.join(HOT_DIR, 'gold');
export const BLACKBOARD_PATH = path.join(ROOT_DIR, 'obsidianblackboard.jsonl');
export const RED_BOOK_PATH = path.join(BRONZE_DIR, 'P4_RED_REGNANT/RED_BOOK_OF_BLOOD_GRUDGES.jsonl');
export const BLOOD_BOOK_PATH = path.join(BRONZE_DIR, 'P4_RED_REGNANT/BLOOD_BOOK_OF_GRUDGES.jsonl');

const db = new duckdb.Database(path.join(BRONZE_DIR, 'P4_RED_REGNANT/blood_book.db'));

// --- HFO GALOIS LATTICE (Cognitive Anchoring) ---

/**
 * Registry of Powers (Octal Governance)
 * Enforcing semantic consistency across the Medallion architecture.
 */
export const LATTICE = {
    O0: 1,               // Unity (8^0)
    O1: 8,               // Hive (8^1)
    O2: 64,              // Swarm (8^2)
    O3: 512,             // Legion (8^3)
    GEN: 88,             // Temporal Anchor
    MUTATION_TARGET: 88, // 80% with an 8 (Gen 88 Pareto)
    THEATER_CAP: 99      // Threshold for "Theater" (Mock Poisoning)
} as const;

/**
 * Kraken's Ink (Port 0x06: STORE)
 * Persists everything to the analytical DuckDB ledger.
 */
export async function persistToKraken(violations: Violation[]) {
    return new Promise((resolve, reject) => {
        db.exec(`
            CREATE TABLE IF NOT EXISTS grudges (
                ts TIMESTAMP,
                file TEXT,
                type TEXT,
                message TEXT,
                gen INTEGER
            )
        `, (err) => {
            if (err) return reject(err);
            const stmt = db.prepare('INSERT INTO grudges VALUES (?, ?, ?, ?, ?)');
            const now = new Date().toISOString();
            for (const v of violations) {
                stmt.run(now, v.file, v.type, v.message, LATTICE.GEN);
            }
            stmt.finalize(() => resolve(true));
        });
    });
}

/**
 * Strict Silver Shroud.
 * Enforces Zod Contract Law on all Silver artifacts.
 */
export function checkSilverShroud() {
    if (!fs.existsSync(SILVER_DIR)) return;
    const files = fs.readdirSync(SILVER_DIR);
    for (const file of files) {
        if (!file.endsWith('.ts')) continue;
        const filePath = path.join(SILVER_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');

        // Extract metadata from headers
        const portMatch = content.match(/@port (\d+)/);
        const commanderMatch = content.match(/@commander (\w+)/);

        try {
            ArtifactContract.partial().parse({
                filePath: file,
                content: content,
                meta: {
                    port: portMatch ? parseInt(portMatch[1]) : 0,
                    commander: commanderMatch ? commanderMatch[1] : 'UNKNOWN'
                }
            });
        } catch (err) {
            scream({
                file: file,
                type: 'VIOLATION',
                message: `Zod Shroud Breach: ${(err as Error).message}`
            });
        }
    }
}

const CacaoStepSchema = z.object({
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

// --- THE WHITE LISTS ---

export const ALLOWED_ROOT_FILES = [
    'hot_obsidian_sandbox', 'cold_obsidian_sandbox', 'AGENTS.md', 'llms.txt',
    'obsidianblackboard.jsonl', 'package.json', 'package-lock.json',
    'stryker.root.config.mjs', 'stryker.silver.config.mjs', 'vitest.root.config.ts', 
    'vitest.silver.config.ts', 'vitest.harness.config.ts', 'vitest.mutation.config.ts',
    'stryker.config.mjs', 'vitest.config.ts', '.git', '.github', '.gitignore', '.vscode', '.env',
    '.kiro', '.venv', 'tsconfig.json', '.stryker-tmp', '.husky', 'node_modules',
    'LICENSE', 'output.txt', 'reports', 'ttao-notes-2026-01-06.md', 'ttao-notes-2026-01-07.md'
];

export const ALLOWED_ROOT_PATTERNS = [
    /^ttao-notes-.*\.md$/,
    /^\.vitest-reside-.*$/,
    /^vitest\..*\.ts$/,
    /^\.stryker-tmp.*$/
];

// --- CORE ENFORCEMENT ---

export type ViolationType = 
    | 'THEATER'          // 100% scores, assertionless tests, mock-overuse
    | 'POLLUTION'        // Illegal files in root/bronze
    | 'AMNESIA'          // Debug logs in Strict Zones
    | 'BESPOKE'          // 'any' without // @bespoke
    | 'VIOLATION'        // Missing provenance or headers
    | 'MUTATION_FAILURE' // Score < 88% (Gen 88)
    | 'MUTATION_GAP'     // Mutation report missing or malformed
    | 'LATTICE_BREACH'   // Octal governance violations (counts/complexity)
    | 'BDD_MISALIGNMENT' // Missing traceability
    | 'OMISSION'         // Silent success/catch blocks
    | 'PHANTOM'          // External/CDN dependencies
    | 'SUSPICION'        // Behavioral anomalies, blindspot detection, heuristic red-flags
    | 'DEBT';            // TODO/FIXME in codebase

export interface Violation {
    file: string;
    type: ViolationType;
    message: string;
}

export const violations: Violation[] = [];

export function clearViolations() { violations.length = 0; }

/**
 * Red Regnant's Scream.
 * Centralized reporting for all disruptions.
 */
export function scream(v: { file: string | object, type: ViolationType, message: string }) {
    const file = typeof v.file === 'string' ? v.file : (v.file ? (v.file as any).name || String(v.file) : 'UNKNOWN');
    const violation: Violation = { ...v, file };
    violations.push(violation);
    if (process.env.HFO_TEST_MODE !== 'true') {
        console.error(`🔴 RED REGNANT SCREAM: [${violation.type}] ${violation.file} - ${violation.message}`);
    }
}

/**
 * Lattice Governance: Octal Consistency
 * Enforces that file counts and structural density align with powers of eight.
 */
export function checkLatticeHealth() {
    const medallions = [
        path.resolve(BRONZE_DIR),
        path.resolve(HOT_DIR, 'silver'), path.resolve(HOT_DIR, 'gold'),
        path.resolve(COLD_DIR, 'silver'), path.resolve(COLD_DIR, 'gold')
    ];
    for (const dir of medallions) {
        if (fs.existsSync(dir)) {
            const files = fs.readdirSync(dir);
            if (files.length > LATTICE.O2) {
                scream({
                    file: path.relative(ROOT_DIR, dir),
                    message: `Hive Bloat: Folder density (${files.length}) exceeds O2 Limit (64).`,
                    type: "LATTICE_BREACH"
                });
            }
        }
    }
}

export function checkRootPollution() {
    if (!fs.existsSync(ROOT_DIR)) return;
    const entries = fs.readdirSync(ROOT_DIR, { withFileTypes: true });
    for (const entry of entries) {
        const name = typeof entry === 'string' ? entry : entry.name;
        const isAllowed = ALLOWED_ROOT_FILES.includes(name) || 
                          ALLOWED_ROOT_PATTERNS.some(p => p.test(name));
        if (!isAllowed) {
            scream({ file: name, type: 'POLLUTION', message: `Unauthorized root file detected.` });
        }
    }
}

/**
 * Heuristic Suspicion Analysis
 * "The Red Queen senses what the human eye misses."
 */
export function analyzeSuspicion(filePath: string, content: string) {
    const relPath = path.relative(ROOT_DIR, filePath);
    
    // Pattern: Empty catch blocks (Silent failure / Omission)
    if (content.match(/catch\s*\(?.*\)?\s*\{\s*\}/g)) {
        scream({ file: relPath, type: 'OMISSION', message: 'Silent catch block detected. Potential reward-hacking pattern.' });
    }

    // Pattern: Manual bypasses of the Galois Lattice
    const suspicionPatterns = [
        /@ignore-regnant/i,
        /@bypass-praetorian/i,
        /@theater-mode/i,
        /@ignore-audit/i
    ];

    for (const pattern of suspicionPatterns) {
        if (pattern.test(content)) {
            scream({ file: relPath, type: 'SUSPICION', message: `Manual bypass detected (${pattern.source}). The Red Queen sees your cowardice.` });
        }
    }
}

const VENV_SEMGREP = path.join(ROOT_DIR, '.venv/Scripts/semgrep.exe');
const RULES_PATH = path.join(BRONZE_DIR, 'P4_RED_REGNANT/red_queen_rules.yml');

/**
 * AST-Based Sensing (Semgrep)
 * The Red Queen's psychic vision into the code's structure.
 */
export function runSemgrepAudit() {
    if (!fs.existsSync(VENV_SEMGREP)) {
        console.warn(' ⚠️  Red Queen blindfolded: Semgrep not found at ' + VENV_SEMGREP);
        return;
    }

    try {
        console.log(' 👁️  RED QUEEN: Scanning for AST Theater...');
        // Focus Semgrep on Silver and Gold medallions primarily
        const targets = [
            `"${path.join(HOT_DIR, 'silver')}"`,
            `"${path.join(HOT_DIR, 'gold')}"`,
            `"${path.join(COLD_DIR, 'silver')}"`,
            `"${path.join(COLD_DIR, 'gold')}"`
        ].filter(t => fs.existsSync(t.replace(/"/g, ''))).join(' ');

        if (!targets) return;

        const cmd = `"${VENV_SEMGREP}" --config "${RULES_PATH}" --json ${targets} --exclude "node_modules" --exclude ".venv" --exclude ".stryker-tmp" --exclude "quarantine"`;
        const output = execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' });
        const results = JSON.parse(output);

        if (results.results && results.results.length > 0) {
            for (const issue of results.results) {
                scream({
                    file: issue.path,
                    type: "THEATER",
                    message: `[Semgrep] ${issue.extra.message} (Line ${issue.start.line})`
                });
            }
        }
    } catch (err) {
        // Semgrep exits with non-zero if issues found, but we handle via scream
        if ((err as any).stdout) {
            try {
                const results = JSON.parse((err as any).stdout);
                for (const issue of results.results) {
                    scream({
                        file: issue.path,
                        type: "THEATER",
                        message: `[Semgrep] ${issue.extra.message} (Line ${issue.start.line})`
                    });
                }
            } catch (pErr) {
                console.error('   > Semgrep Parse Error: ' + pErr);
            }
        }
    }
}

export function auditContent(filePath: string, content: string) {
    const relPath = path.relative(ROOT_DIR, filePath);
    const fileName = path.basename(filePath);
    
    // Strict zones: Silver and Gold in both Hot and Cold sandboxes
    const isStrict = filePath.toLowerCase().includes('silver') || 
                     filePath.toLowerCase().includes('gold') || 
                     filePath.toLowerCase().includes('2_areas');
    
    const isBronze = filePath.toLowerCase().includes('bronze');

    // Suspicion: Heuristic Blindspot Sensing
    analyzeSuspicion(filePath, content);

    // Escape hatch check: Silver/Gold have ZERO escape hatches.
    const hasPermitted = content.includes('@permitted');
    const hasBespoke = content.includes('@bespoke');

    // Global: No Debt (TODO/FIXME)
    if ((content.includes('TO' + 'DO') || content.includes('FIX' + 'ME')) && !hasPermitted) {
        scream({ file: relPath, type: 'DEBT', message: 'TODO/FIXME detected. Unpermitted in Silver/Gold.' });
    }

    // Strict Zone Hard-Gates
    if (isStrict && !filePath.includes('P5_PYRE_PRAETORIAN')) {
        if ((content.includes('console.log') || content.includes('console.debug')) && !hasPermitted) {
            scream({ file: relPath, type: 'THEATER', message: 'Console logging in strict zone without @permitted.' });
        }
        if (content.match(/:\s*any/g) && !hasBespoke) {
            scream({ file: relPath, type: 'BESPOKE', message: 'Bespoke "any" type without justification.' });
        }
        if (!content.includes('Validates:') && !content.includes('@provenance')) {
            scream({ 
                file: relPath, 
                type: 'BDD_MISALIGNMENT', 
                message: 'Implementation file missing requirement traceability (Validates: or @provenance).' 
            });
        }
    }

    // Phantom dependencies (CDNs)
    if (fileName.endsWith('.html') || fileName.endsWith('.ts') || fileName.endsWith('.js')) {
        if ((content.includes('https://cdn.') || content.includes('http://cdn.')) && !hasPermitted) {
            scream({ file: relPath, type: 'PHANTOM', message: 'External CDN dependency detected.' });
        }
    }

    // Theater: Assertionless Tests
    if (fileName.endsWith('.test.ts')) {
        if (!content.includes('expect(') && !content.includes('assert.')) {
            scream({ file: relPath, type: 'THEATER', message: 'Assertionless test file.' });
        }
    }
}

export function checkMutationProof(scoreThreshold: number = LATTICE.MUTATION_TARGET) {
    const reportPath = path.join(BRONZE_DIR, 'infra/reports/mutation/mutation.json');
    if (!fs.existsSync(reportPath)) {
        scream({ file: 'repository', type: 'MUTATION_GAP', message: 'Mutation report missing. Cleanroom integrity cannot be verified.' });
        return;
    }

    try {
        const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        
        // Stryker format
        if (report.metrics) {
            const score = report.metrics.mutationScore;
            if (typeof score !== 'number') {
                scream({ file: 'repository', type: 'MUTATION_GAP', message: 'Invalid score format in metrics.' });
                return;
            }
            if (score < scoreThreshold) {
                scream({ file: 'repository', type: 'MUTATION_FAILURE', message: `Global score ${score.toFixed(2)}% < ${scoreThreshold}%` });
            }
            // THEATER: Prevent 100% or "perfect" theater
            if (score >= 99.0) {
                scream({ file: 'repository', type: 'THEATER', message: `Mutation score ${score.toFixed(2)}% indicates potential deceptive testing (Theater).` });
            }
            return;
        }

        // Mutation-by-file detail checking
        if (report.files) {
            for (const [file, data] of Object.entries(report.files)) {
                const mutants = (data as any).mutants || [];
                const total = mutants.length;
                if (total === 0) continue;
                const killed = mutants.filter((m: any) => m.status === 'Killed' || m.status === 'Timeout').length;
                const score = (killed / total) * 100;
                if (score < scoreThreshold) {
                    scream({ file, type: 'MUTATION_FAILURE', message: `File score ${score.toFixed(2)}% < ${scoreThreshold}%` });
                }
            }
        }
    } catch (e) { 
        scream({ file: 'repository', type: 'MUTATION_GAP', message: 'Failed to parse mutation report. Corruption suspected.' });
    }
}

export function scanMedallions() {
    const targets = [
        path.join(HOT_DIR, 'silver'), 
        path.join(HOT_DIR, 'gold'), 
        path.join(COLD_DIR, 'silver'), 
        path.join(COLD_DIR, 'gold'),
        path.join(BRONZE_DIR, '2_areas')
    ];
    
    for (const target of targets) {
        if (!fs.existsSync(target)) continue;
        
        const walk = (currentDir: string) => {
            const entries = fs.readdirSync(currentDir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);
                if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'quarantine' || entry.name === '.venv') continue;

                if (entry.isDirectory()) {
                    walk(fullPath);
                } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.js') || entry.name.endsWith('.md')) {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    auditContent(fullPath, content);

                    // Hard Gate: No test = Demote (Only in Silver/Gold)
                    const isStrict = target.includes('silver') || target.includes('gold');
                    const isTestFile = entry.name.endsWith('.test.ts') || entry.name.endsWith('.property.ts');
                    if (isStrict && entry.name.endsWith('.ts') && !isTestFile && !entry.name.endsWith('.d.ts')) {
                        const testPath = fullPath.replace(/\.ts$/, '.test.ts');
                        const propertyPath = fullPath.replace(/\.ts$/, '.property.ts');
                        if (!fs.existsSync(testPath) && !fs.existsSync(propertyPath)) {
                            scream({ file: path.relative(ROOT_DIR, fullPath), type: 'THEATER', message: 'Strict artifact missing test file.' });
                        }
                    }
                }
            }
        };
        walk(target);
    }
}

/**
 * RED REGNANT SCREAM AUDIT
 * Executes the full cosmological disruption cycle.
 * Passing the "Scream" to P5 (Pyre Praetorian) for the "Dance of Shiva" (Enforcement).
 */
export async function performScreamAudit(): Promise<{ success: boolean; violations: Violation[] }> {
    console.log('\n--- 🔴 RED REGNANT IS SCREAMING ---');
    console.log(`[Cognitive Alignment: Gen ${LATTICE.GEN} | Target: ${LATTICE.MUTATION_TARGET}%]`);
    clearViolations();

    checkLatticeHealth();
    checkRootPollution();
    checkMutationProof();
    checkSilverShroud(); // Zod Shroud
    runSemgrepAudit(); // Integrated AST Sensing
    scanMedallions();

    if (violations.length > 0) {
        console.error(`\n 💀 ${violations.length} DISRUPTIONS DETECTED. PREPARE TO DANCE.`);
        await persistToKraken(violations); // DuckDB Persistence
        return { success: false, violations: [...violations] };
    } else {
        console.log('\n ✅ THE CLEANROOM IS PURE. THE RED QUEEN IS SATISFIED.');
        return { success: true, violations: [] };
    }
}


if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const { danceDie } = await import('../P5_PYRE_PRAETORIAN/PYRE_DANCE.js');
    performScreamAudit().then(res => {
        if (!res.success) {
            console.log('\n 🔥 PYRE PRAETORIAN: THE DANCE BEGINS.');
            danceDie(res.violations);
            if (process.env.HFO_TEST_MODE !== 'true') process.exit(1);
        } else {
            if (process.env.HFO_TEST_MODE !== 'true') process.exit(0);
        }
    }).catch(console.error);
}
