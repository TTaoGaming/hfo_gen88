import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 🚀 HFO GEN 88: PROMOTION ENGINE (PORT 4)
 * "How do we TEST the TEST?"
 * 
 * This tool enforces the Medallion Flow by requiring successful test execution
 * before moving artifacts from Bronze to Silver.
 */

interface PromotionConfig {
    files: string[];
    tests: string[];
    destination: string;
    mutationThreshold: { min: number; max: number };
}

function scream(message: string) {
    console.error('\n' + '═'.repeat(60));
    console.error('🚨 CRITICAL PROMOTION FAILURE: SCREAMING 🚨');
    console.error('═'.repeat(60));
    console.error(`MESSAGE: ${message}`);
    console.error('═'.repeat(60) + '\n');

    // Log to Blackboard
    const blackboardPath = path.resolve(__dirname, '../../../obsidianblackboard.jsonl');
    const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'CRITICAL',
        port: 4,
        event: 'PROMOTION_FAILURE',
        message: message,
        status: 'SCREAMING'
    };

    try {
        fs.appendFileSync(blackboardPath, JSON.stringify(logEntry) + '\n');
    } catch (e) {
        console.error('Failed to log to blackboard:', e);
    }

    process.exit(1);
}

async function run() {
    const args = process.argv.slice(2);
    const config: PromotionConfig = {
        files: [],
        tests: [],
        destination: '',
        mutationThreshold: { min: 80, max: 99.99 }
    };

    // Simple parser
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--files') {
            // Handle both comma-separated and space-separated (if quoted)
            const rawFiles = args[i + 1];
            config.files = rawFiles.split(/[,\s]+/).map(f => f.trim()).filter(f => f.length > 0);
            i++;
        } else if (args[i] === '--tests') {
            const rawTests = args[i + 1];
            config.tests = rawTests.split(/[,\s]+/).map(t => t.trim()).filter(t => t.length > 0);
            i++;
        } else if (args[i] === '--dest') {
            config.destination = args[i + 1].trim();
            i++;
        }
    }

    if (!config.files.length || !config.tests.length || !config.destination) {
        console.log('Usage: npx tsx promotion_engine.ts --files <f1,f2> --tests <t1,t2> --dest <dir>');
        process.exit(1);
    }

    console.log(`\n📦 PROMOTION REQUEST: [${config.files.join(', ')}] -> ${config.destination}`);
    console.log(`🧪 ASSOCIATED TESTS: [${config.tests.join(', ')}]\n`);

    // 1. Verify files exist
    for (const f of config.files) {
        if (!fs.existsSync(path.resolve(f))) {
            scream(`Source file not found: ${f}`);
        }
    }

    // 2. Run Tests
    console.log('🧪 Step 1: Running Vitest (Isolated)...');
    try {
        const configPath = path.resolve(__dirname, 'vitest.config.ts');
        const testFiles = config.tests.map(t => path.resolve(t)).join(' ');
        const testCommand = `npx vitest run --config ${configPath} ${testFiles}`;
        console.log(`Executing: ${testCommand}`);
        execSync(testCommand, { stdio: 'inherit' });
        console.log('\n✅ Tests passed.');
    } catch (error) {
        scream(`Tests failed for promotion of [${config.files.join(', ')}]. Promotion aborted.`);
    }

    // 3. Run Mutation Testing
    console.log('\n🧬 Step 2: Running Mutation Testing (Stryker)...');
    const localStrykerConfig = path.resolve(__dirname, 'stryker.config.mjs');
    const reportPath = path.resolve(__dirname, 'mutation.json');
    
    try {
        // Run Stryker using the local config
        const strykerCommand = `npx stryker run ${localStrykerConfig}`;
        console.log(`Executing: ${strykerCommand}`);
        execSync(strykerCommand, { stdio: 'inherit', cwd: __dirname });
        
        if (!fs.existsSync(reportPath)) {
            scream('Mutation report not found after Stryker run.');
        }

        const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
        
        // Calculate mutation score manually from the report
        let totalMutants = 0;
        let killedMutants = 0;

        if (report.files) {
            for (const fileData of Object.values(report.files)) {
                const mutants = (fileData as any).mutants || [];
                totalMutants += mutants.length;
                killedMutants += mutants.filter((m: any) => m.status === 'Killed' || m.status === 'Timeout').length;
            }
        }

        const score = totalMutants > 0 ? (killedMutants / totalMutants) * 100 : 0;

        console.log(`\n📊 Mutation Score: ${score.toFixed(2)}% (${killedMutants}/${totalMutants} mutants killed)`);

        if (score < config.mutationThreshold.min) {
            scream(`WEAK ENFORCEMENT: Mutation score ${score.toFixed(2)}% is below threshold (${config.mutationThreshold.min}%).`);
        }
        if (score >= 100) {
            scream(`MUTATION THEATER DETECTED: Mutation score is exactly 100%. This is statistically impossible in a non-trivial system. Promotion denied.`);
        }

        console.log('✅ Mutation score validated.');
    } catch (error: any) {
        scream(`Mutation testing failed or score was invalid: ${error.message}`);
    }

    // 4. Promote Files
    console.log(`\n🚚 Step 3: Promoting files to ${config.destination}...`);
    const resultsMatrix: Record<string, string> = {};

    if (!fs.existsSync(config.destination)) {
        fs.mkdirSync(config.destination, { recursive: true });
    }

    for (const f of config.files) {
        const fileName = path.basename(f);
        const destPath = path.join(config.destination, fileName);
        
        try {
            fs.copyFileSync(path.resolve(f), destPath);
            resultsMatrix[fileName] = 'PROMOTED';
        } catch (e: any) {
            scream(`Failed to copy ${f} to ${destPath}: ${e.message}`);
        }
    }

    // 5. Final Report
    console.log('\n' + '═'.repeat(60));
    console.log('🏆 PROMOTION SUCCESSFUL');
    console.log('═'.repeat(60));
    console.table(resultsMatrix);
    console.log('═'.repeat(60) + '\n');

    // Log to Blackboard
    const blackboardPath = path.resolve(__dirname, '../../../obsidianblackboard.jsonl');
    const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'INFO',
        port: 4,
        event: 'PROMOTION_SUCCESS',
        message: `Promoted ${config.files.length} files to ${config.destination}`,
        files: config.files.map(f => path.basename(f))
    };
    fs.appendFileSync(blackboardPath, JSON.stringify(logEntry) + '\n');
}

run().catch(e => {
    console.error(e);
    process.exit(1);
});
