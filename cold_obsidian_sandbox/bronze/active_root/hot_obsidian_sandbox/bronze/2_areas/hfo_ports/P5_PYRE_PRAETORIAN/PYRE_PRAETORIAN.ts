/**
 *  PYRE PRAETORIAN (PORT 0x05: DEFENSE & AUDIT)
 * 
 * "None shall pass unless they are pure. The fire cleanses the weak."
 * 
 * Authority: Pyre Praetorian (Immunological Oversight)
 * Architecture: Fail-Closed Medallion Lockdown
 * Profile: Hard-Gated Quality Enforcement
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { z } from 'zod';
import * as yaml from 'js-yaml';

// --- SCHEMAS (Autonomous Integrity) ---

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

// --- INFRASTRUCTURE ---

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const ROOT_DIR = path.resolve(__dirname, '../../../'); 
export const HOT_DIR = path.join(ROOT_DIR, 'hot_obsidian_sandbox');
export const BRONZE_DIR = path.join(HOT_DIR, 'bronze');
export const BLACKBOARD_PATH = path.join(ROOT_DIR, 'obsidianblackboard.jsonl');
export const RED_BOOK_PATH = path.join(BRONZE_DIR, 'P5_PYRE_PRAETORIAN/RED_BOOK_OF_BLOOD_GRUDGES.jsonl');
export const BLOOD_BOOK_PATH = path.join(BRONZE_DIR, 'P5_PYRE_PRAETORIAN/BLOOD_BOOK_OF_GRUDGES.jsonl');

// --- THE WHITE LISTS ---

export const ALLOWED_ROOT_FILES = [
    'hot_obsidian_sandbox', 'cold_obsidian_sandbox', 'AGENTS.md', 'llms.txt',
    'obsidianblackboard.jsonl', 'package.json', 'package-lock.json',
    'stryker.root.config.mjs', 'stryker.silver.config.mjs', 'vitest.root.config.ts', 
    'vitest.silver.config.ts', 'vitest.harness.config.ts', 'vitest.mutation.config.ts',
    'stryker.config.mjs', 'vitest.config.ts', '.git', '.github', '.gitignore', '.vscode', '.env',
    '.kiro', '.venv', 'tsconfig.json', '.stryker-tmp', '.husky', 'node_modules',
    'LICENSE', 'output.txt', 'reports', 'ttao-notes-2026-01-06.md', 'ttao-notes-2026-01-07.md',
    '.vitest-results.json', 'vitest.root.config.ts.timestamp-*'
];

export const ALLOWED_ROOT_PATTERNS = [
    /^ttao-notes-.*\.md$/,
    /^\.vitest-reside-.*$/,
    /^vitest\..*\.ts$/,
    /^\.stryker-tmp.*$/,
    /^vitest\.root\.config\.ts\.timestamp-.*$/
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
export const IS_TEST_MODE = process.env.HFO_TEST_MODE === 'true';

export function clearViolations() { violations.length = 0; }

/**
 * Pyre Praetorian's Scream.
 * Centralized reporting for all immunological failures.
 */
export function scream(v: { file: string | object, type: ViolationType, message: string }) {
    const file = typeof v.file === 'string' ? v.file : (v.file ? (v.file as any).name || String(v.file) : 'UNKNOWN');
    const violation: Violation = { ...v, file };
    violations.push(violation);
    if (!IS_TEST_MODE) {
        console.error(`🛡️ PYRE PRAETORIAN SCREAM: [${violation.type}] ${violation.file} - ${violation.message}`);
    }
}

// --- CHECKS ---

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

export function auditContent(filePath: string, content: string) {
    const relPath = path.relative(ROOT_DIR, filePath);
    const fileName = path.basename(filePath);
    const isStrict = filePath.includes('/silver/') || filePath.includes('/gold/') || 
                     filePath.includes('\\silver\\') || filePath.includes('\\gold\\') || 
                     filePath.includes('2_areas');

    // Global: No Debt
    if (content.includes('TODO') || content.includes('FIXME')) {
        scream({ file: relPath, type: 'DEBT', message: 'TODO/FIXME detected.' });
    }

    // Strict: No Amnesia
    if (isStrict && !filePath.includes('PYRE_PRAETORIAN')) {
        if ((content.includes('console.log') || content.includes('console.debug')) && !content.includes('// @permitted')) {
            scream({ file: relPath, type: 'AMNESIA', message: 'Unauthorized debug logs.' });
        }
        if (content.match(/:\s*any/g) && !content.includes('// @bespoke')) {
            scream({ file: relPath, type: 'BESPOKE', message: 'Bespoke "any" type without justification.' });
        }
        if (!content.includes('Provenance:')) {
            scream({ file: relPath, type: 'VIOLATION', message: 'Missing provenance header.' });
        }
        if (!content.includes('Validates:') && !content.includes('@provenance')) {
            scream({ file: relPath, type: 'BDD_MISALIGNMENT', message: 'Implementation file missing requirement traceability (Validates: or @provenance).' });
        }
    }

    // Phantom dependencies (CDNs)
    if (fileName.endsWith('.html') || fileName.endsWith('.ts') || fileName.endsWith('.js')) {
        if (content.includes('https://cdn.') || content.includes('http://cdn.')) {
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

export function checkMutationProof(scoreThreshold: number = 80) {
    const reportPath = path.join(BRONZE_DIR, 'infra/reports/mutation/mutation.json');
    if (!fs.existsSync(reportPath)) {
        scream({ file: 'mutation.json', type: 'MUTATION_GAP', message: 'Mutation report missing.' });
        return;
    }

    try {
        const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        
        // Handle Stryker format (metrics)
        if (report.metrics) {
            const score = report.metrics.mutationScore;
            if (typeof score !== 'number') {
                scream({ file: 'mutation.json', type: 'MUTATION_GAP', message: 'Invalid score format in metrics.' });
                return;
            }
            if (score < scoreThreshold) {
                scream({ file: 'repository', type: 'MUTATION_FAILURE', message: `Global score ${score.toFixed(2)}% < ${scoreThreshold}%` });
            } else if (score >= 99) {
                scream({ file: 'repository', type: 'THEATER', message: `Mutation score ${score.toFixed(2)}% suggests mock-poisoning.` });
            }
            return;
        }

        if (!report.files) {
            scream({ file: 'mutation.json', type: 'MUTATION_GAP', message: 'Mutation report is missing metrics.' });
            return;
        }

        const files = report.files;
        let foundAny = false;
        for (const [filePath, data] of Object.entries(files)) {
            const mutants = (data as any).mutants || [];
            if (mutants.length === 0) continue;
            foundAny = true;
            
            const killed = mutants.filter((m: any) => m.status === 'Killed' || m.status === 'Timeout').length;
            const score = (killed / mutants.length) * 100;

            if (score < scoreThreshold) {
                scream({ file: filePath, type: 'MUTATION_FAILURE', message: `Score ${score.toFixed(2)}% below threshold.` });
            } else if (score >= 99) {
                scream({ file: filePath, type: 'THEATER', message: `Mutation score ${score.toFixed(2)}% suggests mock-poisoning.` });
            }
        }

        if (!foundAny) {
            scream({ file: 'mutation.json', type: 'MUTATION_GAP', message: 'Invalid progress detected in metrics.' });
        }
    } catch (e) { 
        scream({ file: 'mutation.json', type: 'MUTATION_GAP', message: 'Failed to parse mutation report.' });
    }
}

export function scanMedallions() {
    const targets = [path.join(HOT_DIR, 'silver'), path.join(HOT_DIR, 'gold'), path.join(BRONZE_DIR, '2_areas')];
    
    for (const target of targets) {
        if (!fs.existsSync(target)) continue;
        
        const walk = (currentDir: string) => {
            const entries = fs.readdirSync(currentDir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);
                if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'quarantine') continue;

                if (entry.isDirectory()) {
                    walk(fullPath);
                } else {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    auditContent(fullPath, content);

                    // Hard Gate: No test = Demote
                    if (entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts') && !entry.name.endsWith('.d.ts')) {
                        const testPath = fullPath.replace(/\.ts$/, '.test.ts');
                        if (!fs.existsSync(testPath)) {
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
 * PYRE PRAETORIAN AUDIT
 * Executes the full cosmological defense cycle.
 * Returning the results for P5 (Immunizer) to enforce.
 */
export async function executePyreAudit(): Promise<{ success: boolean; violations: Violation[] }> {
    console.log('\n--- 🛡️ PYRE PRAETORIAN IS RUNNING ---');
    clearViolations();

    checkRootPollution();
    checkMutationProof();
    scanMedallions();

    if (violations.length > 0) {
        console.error(`\n 💀 ${violations.length} IMMUNOLOGICAL FAILURES DETECTED.`);
        return { success: false, violations: [...violations] };
    } else {
        console.log('\n ✅ THE CLEANROOM IS PURE. THE PRAETORIAN IS PLEASED.');
        return { success: true, violations: [] };
    }
}


if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const { purge } = await import('../P5_PYRE_PRAETORIAN/PYRE_DANCE.js');
    executePyreAudit().then(res => {
        if (!res.success) {
            purge(res.violations);
            if (!IS_TEST_MODE) process.exit(1);
        } else {
            if (!IS_TEST_MODE) process.exit(0);
        }
    }).catch(console.error);
}
