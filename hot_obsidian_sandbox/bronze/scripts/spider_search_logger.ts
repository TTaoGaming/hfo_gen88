/**
 * 🕷️ SCRIPT: Spider Search Logger
 * Purpose: Execute a search and log the validated envelope to a timestamped file in bronze/ for review.
 * 
 * Usage: npx tsx spider_search_logger.ts "your query"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fuseSearch } from '../../silver/P1_WEB_WEAVER/bridger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const query = process.argv[2] || "social spider optimization algorithm";
    console.log(`🕸️  Spider Sovereign initiating logged search: "${query}"...`);
    
    try {
        const envelope = await fuseSearch(query);
        
        // Generate timestamped filename
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-');
        const dateStr = now.toISOString().split('T')[0];
        
        const logDir = path.resolve(__dirname, '../search_logs');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        
        const filename = `search_${timestamp}.json`;
        const filePath = path.join(logDir, filename);
        
        const output = {
            metadata: {
                query,
                timestamp: now.toISOString(),
                commander: "Spider Sovereign",
                port: 1
            },
            payload: envelope
        };
        
        fs.writeFileSync(filePath, JSON.stringify(output, null, 2));
        
        console.log(`\n✅ SEARCH LOGGED TO: hot_obsidian_sandbox/bronze/search_logs/${filename}`);
        console.log(`🎯 Found ${envelope.results?.length || 0} results.`);
        
    } catch (error) {
        console.error("\n❌ SEARCH FAILED:");
        console.error(error);
        process.exit(1);
    }
}

main();
