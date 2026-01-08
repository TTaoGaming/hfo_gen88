import fs from 'node:fs';
import path from 'node:path';

function getStats(dir) {
    let stats = { files: 0, size: 0, errors: 0 };
    if (!fs.existsSync(dir)) return stats;

    function walk(current) {
        try {
            const items = fs.readdirSync(current, { withFileTypes: true });
            for (const item of items) {
                const fullPath = path.join(current, item.name);
                if (item.isDirectory()) {
                    // Skip known bad apples
                    if (item.name === 'node_modules' || item.name === '.stryker-tmp' || item.name === '.git') continue;
                    walk(fullPath);
                } else if (item.isFile()) {
                    stats.files++;
                    stats.size += fs.statSync(fullPath).size;
                }
            }
        } catch (e) {
            stats.errors++;
        }
    }

    walk(dir);
    return stats;
}

const hotDirs = ['bronze', 'silver', 'gold'].map(m => path.join('hot_obsidian_sandbox', m));
const coldDirs = ['bronze', 'silver', 'gold'].map(m => path.join('cold_obsidian_sandbox', m));

console.log('--- HOT DATALAKE ---');
hotDirs.forEach(d => {
    const s = getStats(d);
    console.log(`${d.padEnd(30)}: ${s.files} files | ${(s.size / 1024 / 1024).toFixed(2)} MB`);
});

console.log('\n--- COLD DATALAKE ---');
coldDirs.forEach(d => {
    const s = getStats(d);
    console.log(`${d.padEnd(30)}: ${s.files} files | ${(s.size / 1024 / 1024).toFixed(2)} MB`);
});
