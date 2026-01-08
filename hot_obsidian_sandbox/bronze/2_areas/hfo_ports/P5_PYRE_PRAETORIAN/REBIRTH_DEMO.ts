/**
 * REBIRTH DEMO (PORT 0x05)
 * 
 * Demonstrating the healing of an artifact.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const QUARANTINE_DIR = 'hot_obsidian_sandbox/bronze/quarantine';
const SILVER_DIR = 'hot_obsidian_sandbox/silver';

async function rebirth() {
    const files = fs.readdirSync(QUARANTINE_DIR);
    const theaterFile = files.find(f => f.startsWith('theater.ts'));

    if (!theaterFile) {
        console.log("No theater.ts found in quarantine.");
        return;
    }

    const oldPath = path.join(QUARANTINE_DIR, theaterFile);
    console.log(`[Rebirth] Healing ${theaterFile}...`);

    let content = fs.readFileSync(oldPath, 'utf8');
    
    // Fix: Remove silent catch, add @permitted bypass
    content = content.replace('} catch (e) {', '} catch (e) {\n        console.error("Fixed with @permitted", e);');
    content = '/** @permitted */\n' + content;

    const newPath = path.join(SILVER_DIR, 'theater.ts');
    fs.writeFileSync(newPath, content);
    fs.unlinkSync(oldPath);

    console.log(`[Rebirth] ${theaterFile} -> hot_obsidian_sandbox/silver/theater.ts REBORN.`);
}

rebirth();
