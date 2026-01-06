/**
 * Validates: SENTINEL_GROUNDING_SEARCH
 * @provenance hot_obsidian_sandbox/bronze/infra/tavily_search.ts
 */
import { TavilyClient } from 'tavily';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../../');
const BLACKBOARD_PATH = path.join(ROOT_DIR, 'obsidianblackboard.jsonl');

dotenv.config({ path: path.join(ROOT_DIR, '.env') });

const tvly = new TavilyClient({ apiKey: process.env.TAVILY_API_KEY });

async function search(query: string) {
    console.log(`\n--- LIDLESS LEGION (PORT 0) SENSING: "${query}" ---`); // @permitted
    
    try {
        const response = await tvly.search(query, {
            searchDepth: "advanced",
            maxResults: 5
        });

        // Log to Blackboard for Sentinel Grounding Requirement
        const logEntry = {
            ts: new Date().toISOString(),
            type: 'SEARCH_GROUNDING',
            agent: 'GitHub Copilot',
            query: query,
            results_count: response.results.length,
            hive: 'HFO_GEN88',
            port: 0
        };
        fs.appendFileSync(BLACKBOARD_PATH, JSON.stringify(logEntry) + '\n');

        console.log(`   > Received ${response.results.length} results.`); // @permitted
        response.results.forEach((r, i) => {
            console.log(`   [${i+1}] ${r.title}\n       ${r.url}`); // @permitted
        });

        return response;
    } catch (err) {
        console.error(`   > Search failed: ${err}`); // @permitted
        throw err;
    }
}

if (process.argv[2]) {
    search(process.argv.slice(2).join(' ')).catch(console.error);
} else {
    console.log("Usage: npx tsx tavily_search.ts <query>");
}
