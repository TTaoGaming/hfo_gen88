/**
 * P7_ENFORCEMENT_TRIPWIRE - HFO Gen 88
 * @commander Spider Sovereign (Port 7)
 * @verb NAVIGATE / ORCHESTRATE
 * 
 * TRIPWIRE RULE: Any direct movement from Hot Bronze to Hot Silver is a CRITICAL VIOLATION.
 * All code MUST cool in Cold Bronze first and generate a Tamper-Evident Receipt.
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../../../../');

const RECEIPTS_DIR = path.join(ROOT_DIR, 'cold_obsidian_sandbox/bronze/3_resources/receipts');

function getStagedFiles(): string[] {
    try {
        const output = execSync('git diff --cached --name-only', { encoding: 'utf8' });
        return output.split('\n').filter(Boolean);
    } catch (e) {
        return [];
    }
}

function checkTripwire() {
    console.log('🕷️ SPIDER SOVEREIGN: Inspecting the web for tripwire violations...');
    
    const stagedFiles = getStagedFiles();
    const violations: string[] = [];

    for (const file of stagedFiles) {
        // We only care about promotions to Silver
        if (file.includes('hot_obsidian_sandbox/silver/')) {
            console.log(`🔍 Inspecting promotion: ${file}`);
            
            // Map silver path back to its bronze origin to check the receipt
            const bronzeOrigin = file.replace('hot_obsidian_sandbox/silver/', 'hot_obsidian_sandbox/bronze/');
            
            // Search all receipts for evidence of this file
            if (!hasCoolingEvidence(bronzeOrigin, file)) {
                violations.push(file);
            }
        }
    }

    if (violations.length > 0) {
        console.error('\n❌ CRITICAL ARCHITECTURAL VIOLATION (Port 7)');
        console.error('The following files are moving to SILVER without "Cooling" in COLD BRONZE:');
        violations.forEach(v => console.error(`  - ${v}`));
        console.error('\nERROR: No Tamper-Evident Receipt found in cold_obsidian_sandbox/bronze/3_resources/receipts/');
        process.exit(1);
    }

    console.log('✅ Port 7: Tripwire clear. No Hot-to-Hot skips detected.');
}

function hasCoolingEvidence(bronzePath: string, silverPath: string): boolean {
    if (!fs.existsSync(RECEIPTS_DIR)) return false;

    const receipts = fs.readdirSync(RECEIPTS_DIR).filter(f => f.endsWith('.json'));
    
    for (const receiptFile of receipts) {
        const receiptPath = path.join(RECEIPTS_DIR, receiptFile);
        try {
            const data = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
            
            // Case 1: Receipt mentions the bronze origin
            if (data.files && data.files[bronzePath]) {
                return true;
            }
            
            // Case 2: Multi-agent/Project-level receipt (checks if filename is in project list)
            if (data.project_files && data.project_files.includes(bronzePath)) {
                return true;
            }

            // Case 3: Receipt name matches the file base name (fallback)
            const baseName = path.basename(silverPath, path.extname(silverPath));
            if (receiptFile.toUpperCase().includes(baseName.toUpperCase())) {
                return true;
            }
        } catch (e) {
            // Skip malformed receipts
        }
    }

    return false;
}

checkTripwire();
