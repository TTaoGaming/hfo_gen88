import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { KrakenKeeperAdapter } from '../../silver/P6_KRAKEN_KEEPER/kraken-adapter.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PAIN_PATH = path.join(__dirname, '..', 'exemplars', 'dev_pain_2025.json');
const DB_PATH = path.join(__dirname, '../../../hot_obsidian_sandbox/silver/P6_KRAKEN_KEEPER/kraken.db');

async function seed() {
    const painData = JSON.parse(fs.readFileSync(PAIN_PATH, 'utf-8'));
    const kraken = new KrakenKeeperAdapter(DB_PATH);
    await kraken.initialize();

    console.log('Seeding Kraken with 12 months of historical pain...');

    for (const pain of painData) {
        await kraken.addGrudge({
            type: 'HISTORICAL_PAIN',
            message: `${pain.name}: ${pain.description} (Vector: ${pain.vector})`,
            file: 'ARCHIVE_2025',
            playbook: pain.id
        });
    }

    console.log('Seeding complete.');
    kraken.close();
}

seed().catch(console.error);
