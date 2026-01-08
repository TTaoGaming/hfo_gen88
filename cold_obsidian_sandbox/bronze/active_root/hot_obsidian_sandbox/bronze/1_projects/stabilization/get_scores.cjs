const fs = require('fs');
const path = require('path');
const base = 'hot_obsidian_sandbox/bronze/infra/reports/mutation/';
['mutation-p1.json', 'mutation-p4.json', 'mutation-p5.json', 'mutation.json'].forEach(f => {
  const filePath = path.join(process.cwd(), base, f);
  if (fs.existsSync(filePath)) {
    const c = fs.readFileSync(filePath, 'utf8');
    const m = c.match(/"mutationScore":\s*([\d\.]+)/);
    console.log(f + ': ' + (m ? m[1] : 'NOT FOUND'));
  } else {
    console.log(f + ': FILE MISSING');
  }
});
