const fs = require('fs');
const path = require('path');

const reportsDir = path.join(process.cwd(), 'hot_obsidian_sandbox', 'bronze', 'infra', 'reports', 'mutation');
console.log('Scanning Directory:', reportsDir);
const files = fs.readdirSync(reportsDir).filter(f => f.endsWith('.json'));
console.log('Found files:', files);

console.log('--- RAW MUTATION SCORE AUDIT ---');

files.forEach(file => {
    const filePath = path.join(reportsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = content.match(/"mutationScore":\s*([\d\.]+)/g);
    if (matches) {
        console.log(`\nFile: ${file}`);
        matches.forEach(m => {
            const val = parseFloat(m.split(':')[1]);
            const status = (val >= 88 && val < 99) ? '🌟 GOLDILOCKS' : (val >= 80 ? '✅ SILVER' : '❌ THEATER');
            console.log(`- ${val.toFixed(2)}% [${status}]`);
        });
    }
});
