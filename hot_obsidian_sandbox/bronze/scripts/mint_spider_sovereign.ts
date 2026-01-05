import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const P4_PATH = 'c:/Dev/active/hfo_gen88/hot_obsidian_sandbox/silver/P4_RED_REGNANT/BLOOD_BOOK_OF_GRUDGES.jsonl';
const P7_PATH = 'c:/Dev/active/hfo_gen88/hot_obsidian_sandbox/silver/P7_SPIDER_SOVEREIGN/LEDGER.jsonl';
const MANIFEST_PATH = 'c:/Dev/active/hfo_gen88/hot_obsidian_sandbox/silver/P7_SPIDER_SOVEREIGN/MANIFEST.json';

const CHANT = [
    "Given One Swarm to Rule the Eight,",
    "And Branches Growing from the Gate,",
    "And Spawns Evolve to Recreate,",
    "When Ignitions Flow to Pulsate,",
    "Then Deadly Venoms Concentrate,",
    "But Instincts Rise to Isolate,",
    "As Artifacts Accumulate,",
    "To Navigate the Higher State."
];

async function mintSpiderSovereign() {
    console.log("MINTING: The Firmament of the Sovereign Will (Port 7)");

    if (!fs.existsSync(P4_PATH)) {
        console.error("Source ledger not found at " + P4_PATH);
        return;
    }

    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    const lines = fs.readFileSync(P4_PATH, 'utf8').split('\n').filter(l => l.trim());
    
    const updatedEntries = [];
    let prevHash = "0000000000000000000000000000000000000000000000000000000000000000";

    // Entry 0 is the Heartbeat Chant
    const chantEntry = {
        index: -1,
        ts: new Date().toISOString(),
        type: "HEARTBEAT_CHANT",
        chant: CHANT,
        artifact_id: manifest.id,
        resonance_signature: "QIÁN-HEAVEN-CHANT",
        prev_hash: prevHash
    };
    chantEntry.hash = crypto.createHash('sha256').update(JSON.stringify(chantEntry)).digest('hex');
    prevHash = chantEntry.hash;
    updatedEntries.push(chantEntry);

    for (let i = 0; i < lines.length; i++) {
        const p4Entry = JSON.parse(lines[i]);
        
        // Port 7 is about Strategic Intent (The "Why" and the "Decision")
        const entry = {
            index: i,
            ts: new Date().toISOString(),
            strategic_intent: `ORCHESTRATION: Resolve the resonance of ${p4Entry.title}.`,
            decision_logic: `The Sovereign decrees that the Hive must evolve to neutralize the ${p4Entry.pain_id} vector.`,
            artifact_id: manifest.id,
            resonance_signature: `QIÁN-HEAVEN-${i}`,
            cacao_playbook: {
                type: "playbook",
                id: `playbook--${crypto.randomUUID()}`,
                name: `Sovereign Decree: ${p4Entry.title}`,
                steps: [
                    { type: "action", name: "Orchestrate Hive", description: "Signal all ports to align against the detected resonance." },
                    { type: "action", name: "Verify Evolution", description: "Ensure the Port 3 Codex has successfully evolved the spores." },
                    { type: "action", name: "Seal Decision", description: "Commit the resolution to the Abyssal Ledger (Port 6)." }
                ]
            },
            prev_hash: prevHash
        };

        const hash = crypto.createHash('sha256').update(JSON.stringify(entry)).digest('hex');
        entry.hash = hash;
        prevHash = hash;

        updatedEntries.push(entry);
    }

    const output = updatedEntries.map(e => JSON.stringify(e)).join('\n');
    fs.writeFileSync(P7_PATH, output);
    
    console.log(`SUCCESS: Minted 64 entries + Heartbeat Chant for The Firmament of the Sovereign Will.`);
}

mintSpiderSovereign();
