import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const P4_PATH = 'c:/Dev/active/hfo_gen88/hot_obsidian_sandbox/silver/P4_RED_REGNANT/BLOOD_BOOK_OF_GRUDGES.jsonl';
const MANIFEST_PATH = 'c:/Dev/active/hfo_gen88/hot_obsidian_sandbox/silver/P4_RED_REGNANT/MANIFEST.json';

async function mintRedRegnant() {
    console.log("MINTING: The Resonant Blood Book of Grudges (Port 4)");

    if (!fs.existsSync(P4_PATH)) {
        console.error("Source ledger not found at " + P4_PATH);
        return;
    }

    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    const lines = fs.readFileSync(P4_PATH, 'utf8').split('\n').filter(l => l.trim());
    
    const updatedEntries = [];
    let prevHash = "0000000000000000000000000000000000000000000000000000000000000000";

    for (let i = 0; i < lines.length; i++) {
        const entry = JSON.parse(lines[i]);
        
        // Update entry with Resonant branding and CACAO-style metadata
        const updatedEntry = {
            ...entry,
            artifact_id: manifest.id,
            resonance_signature: `ZHÈN-THUNDER-${i}`,
            cacao_playbook: {
                type: "playbook",
                id: `playbook--${crypto.randomUUID()}`,
                name: `Resonant Response: ${entry.title}`,
                steps: [
                    { type: "action", name: "Sense Vibration", description: "Detect the resonance of the grudge in the telemetry." },
                    { type: "action", name: "Isolate Frequency", description: "Identify the specific attack vector frequency." },
                    { type: "action", name: "Dampen Resonance", description: "Apply the Port 5 immunization to neutralize the shock." }
                ]
            },
            prev_hash: prevHash
        };

        // Re-calculate hash for integrity
        const hash = crypto.createHash('sha256').update(JSON.stringify(updatedEntry)).digest('hex');
        updatedEntry.hash = hash;
        prevHash = hash;

        updatedEntries.push(updatedEntry);
    }

    const output = updatedEntries.map(e => JSON.stringify(e)).join('\n');
    fs.writeFileSync(P4_PATH, output);
    
    console.log(`SUCCESS: Minted 64 entries for The Resonant Blood Book of Grudges.`);
}

mintRedRegnant();
