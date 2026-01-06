import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT_DIR = path.resolve(process.cwd(), '../../..');
const SILVER_DIR = path.join(ROOT_DIR, 'hot_obsidian_sandbox/silver');
const INFRA_DIR = path.join(ROOT_DIR, 'hot_obsidian_sandbox/bronze/infra');

const testFile = path.join(SILVER_DIR, 'mutation_test_artifact.ts');

function runScream() {
    try {
        execSync('npm run scream', { cwd: INFRA_DIR, stdio: 'pipe' });
        return true;
    } catch (e) {
        return false;
    }
}

console.log('🧪 STARTING SCREAMER MUTATION TESTING...');

// Test 1: Missing Provenance
fs.writeFileSync(testFile, 'export const x = 1;');
if (runScream()) {
    console.error('❌ FAILED: Screamer missed missing provenance!');
    process.exit(1);
} else {
    console.log('✅ PASSED: Screamer caught missing provenance.');
}

// Test 2: Broken Provenance Link
fs.writeFileSync(testFile, '/**\n * Topic: System Disruption & Testing\n * Provenance: bronze/nonexistent.md\n */\nexport const x = 1;');
if (runScream()) {
    console.error('❌ FAILED: Screamer missed broken provenance link!');
    process.exit(1);
} else {
    console.log('✅ PASSED: Screamer caught broken provenance link.');
}

// Test 3: Topic Mismatch
fs.writeFileSync(testFile, '/**\n * Topic: Wrong Topic\n * Provenance: bronze/P4_DISRUPTION_KINETIC.md\n */\nexport const x = 1;');
if (runScream()) {
    console.error('❌ FAILED: Screamer missed topic mismatch!');
    process.exit(1);
} else {
    console.log('✅ PASSED: Screamer caught topic mismatch.');
}

// Cleanup
if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
console.log('🎉 ALL MUTATION TESTS PASSED. THE RED REGNANT IS NOT A PAPER TIGER.');
