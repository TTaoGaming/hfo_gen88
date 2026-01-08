import duckdb from 'duckdb';
import { promisify } from 'util';
import fs from 'fs';

const DB_PATH = 'C:/Dev/active/hfo_gen88/cold_obsidian_sandbox/silver/active_root/portable_hfo_memory_pre_hfo_to_gen84_2025-12-27T21-46-52/hfo_memory.duckdb';
const LOG_PATH = 'C:/Dev/active/hfo_gen88/hot_obsidian_sandbox/bronze/duckdb_query_log.txt';

async function query() {
    console.log('Starting DuckDB query...');
    const db = new duckdb.Database(DB_PATH, { "access_mode": "READ_ONLY" });
    const connection = db.connect();
    const all = promisify(connection.all.bind(connection));

    try {
        const tables = await all('SELECT table_name FROM information_schema.tables');
        fs.appendFileSync(LOG_PATH, `TABLES: ${JSON.stringify(tables, null, 2)}\n\n`);

        for (const table of tables as any[]) {
            const tableName = table.table_name;
            const count = await all(`SELECT COUNT(*) as count FROM ${tableName}`);
            fs.appendFileSync(LOG_PATH, `Table ${tableName} count: ${JSON.stringify(count)}\n`);
            
            // Try to find columns
            const columns = await all(`PRAGMA table_info('${tableName}')`);
            fs.appendFileSync(LOG_PATH, `Columns for ${tableName}: ${JSON.stringify(columns)}\n\n`);
        }

        // Search for NATS and Temporal patterns in any artifacts/content tables
        // Assuming there is an 'artifacts' or 'content' table from previous notes
        const searchTerms = ['Temporal', 'NATS', 'Orchestration', 'Pipeline'];
        for (const term of searchTerms) {
            fs.appendFileSync(LOG_PATH, `SEARCHING FOR: ${term}\n`);
            // Check if 'artifacts' table exists (common in HFO memory)
            const result = await all(`SELECT * FROM artifacts WHERE content LIKE ? OR filename LIKE ? LIMIT 5`, `%${term}%`, `%${term}%`);
            fs.appendFileSync(LOG_PATH, `RESULTS for ${term}: ${JSON.stringify(result, null, 2)}\n\n`);
        }

    } catch (error: any) {
        fs.appendFileSync(LOG_PATH, `ERROR: ${error.message}\n`);
    } finally {
        connection.close();
    }
}

query();
