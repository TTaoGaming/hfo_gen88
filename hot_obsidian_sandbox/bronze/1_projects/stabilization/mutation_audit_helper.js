const fs = require('fs');
const path = require('path');

const reportsDir = 'c:/Dev/active/hfo_gen88/hot_obsidian_sandbox/bronze/infra/reports/mutation';
const files = fs.readdirSync(reportsDir).filter(f => f.endsWith('.json'));

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
