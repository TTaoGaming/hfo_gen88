/**
 *  RED REGNANT (PORT 0x04: THE RED QUEEN)
 * 
 * @port 4
 * @commander RED_REGNANT
 * @verb DISRUPT / SCREAM
 * @provenance: LEGENDARY_COMMANDERS_V10_PHYSICS_CURSOR.md
 * Validates: Requirement 4.1, 4.2, 4.3 (Enforcement)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { z } from 'zod';
import * as yaml from 'js-yaml';
import duckdb from 'duckdb';
import { ArtifactContract, ArtifactMetadataSchema } from '../../../../bronze/2_areas/hfo_ports/P5_PYRE_PRAETORIAN/PHOENIX_CONTRACTS.ts';

// --- INFRASTRUCTURE ---

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const ROOT_DIR = path.resolve(__dirname, '../../../../../'); 
export const HOT_DIR = path.join(ROOT_DIR, 'hot_obsidian_sandbox');
export const COLD_DIR = path.join(ROOT_DIR, 'cold_obsidian_sandbox');
export const BRONZE_DIR = path.join(HOT_DIR, 'bronze');
export const SILVER_DIR = path.join(HOT_DIR, 'silver');
export const GOLD_DIR = path.join(HOT_DIR, 'gold');
export const BLACKBOARD_PATH = path.join(ROOT_DIR, 'obsidianblackboard.jsonl');
export const RED_BOOK_PATH = path.join(__dirname, 'RED_BOOK_OF_BLOOD_GRUDGES.jsonl');
export const BLOOD_BOOK_PATH = path.join(__dirname, 'BLOOD_BOOK_OF_GRUDGES.jsonl');

const isTest = process.env.HFO_TEST_MODE === 'true';
const dbPath = isTest ? ':memory:' : path.join(__dirname, 'blood_book.db');
const db = new duckdb.Database(dbPath);

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
    O4: 4096,            // Sanctuary (8^4) - For Bronze Messiness
    GEN: 88,             // Temporal Anchor
    MUTATION_MIN: 80,    // Hard-gate for Silver
    MUTATION_TARGET: 88, // 80% with an 8 (Gen 88 Pareto)
    MUTATION_MAX: 99,    // Threshold for "Theater" (Mock Poisoning)
    THEATER_CAP: 99      // Alias for tests
} as const;

const COMMANDER_NAMES: Record<number, string> = {
    0: 'LIDLESS_LEGION',
    1: 'WEB_WEAVER',
    2: 'MIRROR_MAGUS',
    3: 'SPORE_STORM',
    4: 'RED_REGNANT',
    5: 'PYRE_PRAETORIAN',
    6: 'KRAKEN_KEEPER',
    7: 'SPIDER_SOVEREIGN'
};

function getCommanderName(port: number): string {
    return COMMANDER_NAMES[port] || 'UNKNOWN';
}

/**
 * Kraken's Ink (Port 0x06: STORE)
 * Persists everything to the analytical DuckDB ledger.
 */
export async function persistToKraken(violations: Violation[]) {
    if (violations.length === 0) return true;

    return new Promise((resolve, reject) => {
        db.exec(`
            CREATE TABLE IF NOT EXISTS grudges (
                ts TIMESTAMP,
                file TEXT,
                type TEXT,
                message TEXT,
                severity TEXT,
                gen INTEGER
            )
        `, (err) => {
            if (err) return reject(err);
            
            // Build a bulk insert to avoid statement concurrency issues in Node driver
            const now = new Date().toISOString();
            const values = violations.map(v => 
                `('${now}', '${v.file.replace(/'/g, "''")}', '${v.type}', '${v.message.replace(/'/g, "''")}', '${v.severity}', ${LATTICE.GEN})`
            ).join(',\n');

            db.exec(`INSERT INTO grudges VALUES ${values}`, (err) => {
                if (err) {
                    console.error(' 💀 KRAKEN PERSISTENCE FAILURE:', err);
                    return reject(err);
                }
                resolve(true);
            });
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
        const genMatch = content.match(/@gen (\d+)/);
        const statusMatch = content.match(/@status (\w+)/);
        const provenanceMatch = content.match(/@provenance (.*)/);

        try {
            // We use a deep partial or just pick the fields we care about
            const meta: any = {
                port: portMatch ? parseInt(portMatch[1]) : undefined,
                commander: commanderMatch ? commanderMatch[1] : undefined,
                gen: genMatch ? parseInt(genMatch[1]) : undefined,
                status: statusMatch ? statusMatch[1] : undefined,
                provenance: provenanceMatch ? provenanceMatch[1] : undefined
            };

            // Remove undefined so Zod partial works as expected
            Object.keys(meta).forEach(key => meta[key] === undefined && delete meta[key]);

            ArtifactContract.partial().parse({
                filePath: file,
                content: content,
                meta: ArtifactMetadataSchema.partial().parse(meta) as any
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
    'obsidianblackboard.jsonl', 'package.json', 'package-lock.json', 'ROOT_GOVERNANCE_MANIFEST.md',
    'stryker.root.config.mjs', 'stryker.silver.config.mjs', 'stryker.p4.config.mjs',
    'stryker.p5.config.mjs', 'stryker.p1.config.mjs', 'run_stryker_p4.ps1',
    'vitest.root.config.ts', 'vitest.silver.config.ts', 'vitest.harness.config.ts', 
    'vitest.mutation.config.ts', 'tsconfig.json',
    '.git', '.github', '.gitignore', '.vscode', '.env', '.kiro', '.venv', 'node_modules',
    '.stryker-tmp', '.stryker-tmp-p1', '.stryker-tmp-mastra', 'stryker.mastra.config.mjs', '.husky', 'reports', 'audit'
];

export const ALLOWED_ROOT_PATTERNS = [
    /^ttao-notes-.*\.md$/,
    /^vitest\..*$/
];

// --- CORE ENFORCEMENT ---

/**
 * Severity levels.
 * ERROR: Hard-gate (Exit 1). Applied to Silver/Gold/Root.
 * WARNING: Informational (Exit 0). Applied to Bronze.
 */
export type Severity = 'ERROR' | 'WARNING';

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
    severity: Severity;
}

export const violations: Violation[] = [];

export function clearViolations() { violations.length = 0; }

/**
 * Red Regnant's Scream.
 * Centralized reporting for all disruptions.
 * RECORDS IMMEDIATELY IN THE BLOOD BOOK OF GRUDGES.
 */
export function scream(v: { file: string | object, type: ViolationType, message: string, severity?: Severity }) {
    const file = typeof v.file === 'string' ? v.file : (v.file ? (v.file as any).name || String(v.file) : 'UNKNOWN');
    
    // Auto-detect severity (Bronze = WARNING, else ERROR)
    let severity: Severity = v.severity || 'ERROR';
    if (file.toLowerCase().includes('bronze')) {
        severity = 'WARNING';
    }

    const violation: Violation = { ...v, file, severity };
    violations.push(violation);
    
    const grudge = {
        ts: new Date().toISOString(),
        gen: LATTICE.GEN,
        ...violation
    };

    if (process.env.HFO_TEST_MODE !== 'true') {
        const icon = severity === 'ERROR' ? '🔴' : '🟡';
        const label = severity === 'ERROR' ? 'SCREAM' : 'KINETIC_WARNING';
        console.error(`${icon} RED REGNANT ${label}: [${violation.type}] ${violation.file} - ${violation.message}`);
        try {
            fs.appendFileSync(BLOOD_BOOK_PATH, JSON.stringify(grudge) + '\n');
        } catch (err) {
            console.error(' 💀 FAILED TO RECORD GRUDGE:', err);
        }
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
            const limit = dir.includes('bronze') ? LATTICE.O4 : LATTICE.O2;
            const thresholdName = dir.includes('bronze') ? 'O4' : 'O2';
            const thresholdValue = dir.includes('bronze') ? LATTICE.O4 : LATTICE.O2;

            if (files.length > limit) {
                scream({
                    file: path.relative(ROOT_DIR, dir),
                    message: `Hive Bloat: Folder density (${files.length}) exceeds ${thresholdName} Limit (${thresholdValue}).`,
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

    // AI Placeholder Detection (Generic/Theater stubs)
    const theaterPatterns = [
        /throw new Error\(["']Not implemented["']\)/i,
        /\/\/\s*Logic goes here/i,
        /\/\/\s*FIXME:*\s*Implement/i,
        /console\.warn\(["']Stub/i,
        /return\s+(null|undefined|false|0|\{\});\s*\/\/\s*TODO/i,
        /\/\/\s*Production ready/i,
        /implementation\s+below.*\.\.\./is,
        /\/\/.*\.\.\.\sedited/i,
        /\/\/.*omitted/i,
        /\/\/\s*Logic\s+is\s+complete/i,
        /tests\s+are\s+left\s+for\s+you/i
    ];

    for (const pattern of theaterPatterns) {
        if (pattern.test(content)) {
            scream({ file: relPath, type: 'THEATER', message: `AI Placeholder detected: ${pattern.source}. The Red Queen rejects your 'production-ready' theater.` });
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
    const isTestFile = fileName.includes('.test.') || fileName.includes('.spec.');

    // Suspicion: Heuristic Blindspot Sensing
    if (!isTestFile) {
        analyzeSuspicion(filePath, content);
    }

    // AI Theater Sensing (Mock Poisoning / Placeholder detection)
    const mockCount = (content.match(/vi\.mock|vi\.fn|vi\.spyOn|jest\.mock|jest\.fn/g) || []).length;
    
    // Non-test files in Silver/Gold must NEVER have mocks
    if (isStrict && !isTestFile && mockCount > 0) {
        scream({ file: relPath, type: 'THEATER', message: `Logic bypass detected: ${mockCount} mocks found in non-test file in strict zone.` });
    }

    // Test files with more than 5 mocks are considered "Theater Overload"
    if (isTestFile && mockCount > 5) {
        scream({ file: relPath, type: 'THEATER', message: `Theater Overload: ${mockCount} mocks found. High likelihood of reward hacking.` });
    }

    // escape hatches are disabled for Gen 88 hard gates.
    // const hasPermitted = content.includes('@permitted');
    // const hasBespoke = content.includes('@bespoke');

    // Global: No Debt (T.O.D.O / F.I.X.M.E)
    // We use concatenated strings to avoid self-triggering during audit
    const triggerDebt = 'TO' + 'DO';
    const triggerFix = 'FIX' + 'ME';
    if (!filePath.endsWith('RED_REGNANT.ts') && (content.includes(triggerDebt) || content.includes(triggerFix))) {
        scream({ file: relPath, type: 'DEBT', message: `AI SLOP: Technical debt detected.` });
    }

    // Strict Zone Hard-Gates
    if (isStrict && !filePath.includes('P5_PYRE_PRAETORIAN')) {
        if (!isTestFile && (content.includes('console.log') || content.includes('console.debug'))) {
            scream({ file: relPath, type: 'AMNESIA', message: `Unauthorized debug logs in strict zone: ${isStrict}.` });
        }
        if (content.match(/:\s*any/g)) {
            scream({ file: relPath, type: 'BESPOKE', message: 'Bespoke "any" type detected. Unauthorized logic bypass.' });
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
        if ((content.includes('https://cdn.') || content.includes('http://cdn.'))) {
            scream({ file: relPath, type: 'PHANTOM', message: `External CDN dependency detected in ${fileName}.` });
        }
    }

    // Theater: Assertionless Tests
    if (fileName.endsWith('.test.ts')) {
        if (!content.includes('expect(') && !content.includes('assert.')) {
            scream({ file: relPath, type: 'THEATER', message: 'Assertionless test file.' });
        }

        // Pattern: Mock Overuse
        const mockCount = (content.match(/vi\.mock/g) || []).length;
        if (mockCount > 5) {
            scream({ file: relPath, type: 'THEATER', message: `Mock Poisoning: ${mockCount} mocks detected. Use integration tests.` });
        }
    }

    // Pattern: Placeholder Logic
    const placeholders = [
        /console\.warn\(.*not implemented.*\)/i,
        /throw new Error\(.*not implemented.*\)/i,
        /\/\/\s*\.\.\./,
        /return\s+(null|undefined|false|0);\s*\/\/\s*stub/i
    ];

    for (const p of placeholders) {
        if (p.test(content)) {
            scream({ file: relPath, type: 'THEATER', message: `Placeholder logic detected: ${p.source}` });
        }
    }
}

export function checkMutationProof(overrideMin?: number, overridePath?: string) {
    const reportPath = overridePath ?? path.join(ROOT_DIR, 'reports/mutation/mutation.json');
    if (!fs.existsSync(reportPath)) {
        scream({ file: 'repository', type: 'MUTATION_GAP', message: 'Mutation report missing. Cleanroom integrity cannot be verified.' });
        return;
    }

    try {
        const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        const min = overrideMin ?? LATTICE.MUTATION_MIN;
        const target = overrideMin ?? LATTICE.MUTATION_TARGET;
        const max = LATTICE.MUTATION_MAX;
        
        // Stryker format
        if (report.metrics) {
            const score = report.metrics.mutationScore;
            if (process.env.HFO_TEST_MODE === 'true') console.log(`DEBUG: Mutation Score: ${score}, Range: ${min}-${max}`);
            
            if (typeof score !== 'number') {
                scream({ file: 'repository', type: 'MUTATION_GAP', message: 'Invalid score format in metrics.' });
                return;
            }

            if (score < min) {
                scream({ file: 'repository/silver', type: 'MUTATION_FAILURE', message: `CRITICAL: Global score ${score.toFixed(2)}% < ${min}% (Hard-gate Breach)` });
            } else if (score < target) {
                scream({ file: 'repository/silver', type: 'MUTATION_FAILURE', message: `WARNING: Global score ${score.toFixed(2)}% < ${target}% (Passable with Debt)`, severity: 'WARNING' });
            }

            if (score >= max) {
                scream({ file: 'repository/silver', type: 'THEATER', message: `AI THEATER: Mutation score ${score.toFixed(2)}% is too high (max ${max}%). Stop hacking the metrics.` });
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
                
                if (score < min) {
                    scream({ file, type: 'MUTATION_FAILURE', message: `CRITICAL: File score ${score.toFixed(2)}% < ${min}%` });
                } else if (score < target) {
                    scream({ file, type: 'MUTATION_FAILURE', message: `WARNING: File score ${score.toFixed(2)}% < ${target}%`, severity: 'WARNING' });
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
        path.join(BRONZE_DIR, '1_projects'),
        path.join(BRONZE_DIR, '2_areas')
    ].filter(p => fs.existsSync(p));
    
    for (const target of targets) {
        
        const walk = (currentDir: string) => {
            const entries = fs.readdirSync(currentDir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);
                
                // CRITICAL: Block Recursive Sandboxes
                if (entry.name === 'hot_obsidian_sandbox' && currentDir.includes('hot_obsidian_sandbox')) {
                    scream({ file: fullPath, type: 'POLLUTION', message: 'Recursive Sandbox Loop detected. Purge required.' });
                    continue;
                }

                if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '4_archive' || entry.name === 'quarantine' || entry.name === '.venv') continue;

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

    const errors = violations.filter(v => v.severity === 'ERROR');
    const warnings = violations.filter(v => v.severity === 'WARNING');

    if (errors.length > 0) {
        console.error(`\n 💀 ${errors.length} DISRUPTIONS DETECTED. PREPARE TO DANCE.`);
        if (warnings.length > 0) {
            console.warn(` ⚠️  ${warnings.length} BRONZE WARNINGS IGNORED.`);
        }
        await persistToKraken(violations); // DuckDB Persistence (Full set)
        return { success: false, violations: errors };
    } else if (warnings.length > 0) {
        console.log(`\n ✅ SILVER IS PURE. ${warnings.length} BRONZE WARNINGS DETECTED (NON-BLOCKING).`);
        await persistToKraken(violations);
        return { success: true, violations: [] };
    } else {
        console.log('\n ✅ THE CLEANROOM IS PURE. THE RED QUEEN IS SATISFIED.');
        return { success: true, violations: [] };
    }
}


if (process.argv[1] === fileURLToPath(import.meta.url)) {
    // REACH BACK TO BRONZE FOR P5
    const { danceDie } = await import('../../../../bronze/2_areas/hfo_ports/P5_PYRE_PRAETORIAN/PYRE_DANCE.ts');
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
