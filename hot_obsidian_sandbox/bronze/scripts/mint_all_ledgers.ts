/**
 * @topic System Disruption & Testing
 * @provenance hot_obsidian_sandbox/bronze/P4_DISRUPTION_KINETIC.md
 * @acknowledged: Historical Pain Patterns (PAIN_001, PAIN_011, PAIN_021, PAIN_013) are acknowledged.
 * @bespoke: 'any' types are used for legacy ledger compatibility.
 */
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const BASE_DIR = 'c:/Dev/active/hfo_gen88/hot_obsidian_sandbox/silver';
const BRONZE_DIR = 'c:/Dev/active/hfo_gen88/hot_obsidian_sandbox/bronze/artifacts';

// THE 8 LEGENDARY COMMANDERS & THEIR TECH EXEMPLARS
const PORT_CONFIG = [
    { port: 0, dir: 'P0_LIDLESS_LEGION', id: 'hfo:port:0:omphalos', sig: 'KŪN-EARTH', verb: 'SENSE', exemplar: 'MediaPipe / ISR Sensors', ledger: 'P0_LEDGER.jsonl' },
    { port: 1, dir: 'P1_WEB_WEAVER', id: 'hfo:port:1:bifrost', sig: 'GÈN-MOUNTAIN', verb: 'FUSE', exemplar: 'Zod / Schema-Adapter', ledger: 'P1_LEDGER.jsonl' },
    { port: 2, dir: 'P2_MIRROR_MAGUS', id: 'hfo:port:2:pool', sig: 'KǍN-WATER', verb: 'SHAPE', exemplar: 'RxJS / Immer.js', ledger: 'P2_LEDGER.jsonl' },
    { port: 3, dir: 'P3_SPORE_STORM', id: 'hfo:port:3:codex', sig: 'XÙN-WIND', verb: 'DELIVER', exemplar: 'NATS JetStream / Temporal', ledger: 'P3_LEDGER.jsonl' },
    { port: 4, dir: 'P4_RED_REGNANT', id: 'hfo:port:4:resonant-blood-book', sig: 'ZHÈN-THUNDER', verb: 'TEST', exemplar: 'Stryker / Vitest', ledger: 'BLOOD_BOOK_OF_GRUDGES.jsonl' },
    { port: 5, dir: 'P5_PYRE_PRAETORIAN', id: 'hfo:port:5:agni-pyre', sig: 'LÍ-FIRE', verb: 'DEFEND', exemplar: 'XState (Guards) / Firewall', ledger: 'P5_LEDGER.jsonl' },
    { port: 6, dir: 'P6_KRAKEN_KEEPER', id: 'hfo:port:6:abyssal-ledger', sig: 'DUÌ-LAKE', verb: 'STORE', exemplar: 'DuckDB / LanceDB', ledger: 'P6_LEDGER.jsonl' },
    { port: 7, dir: 'P7_SPIDER_SOVEREIGN', id: 'hfo:port:7:firmament', sig: 'QIÁN-HEAVEN', verb: 'DECIDE', exemplar: 'LangGraph / OpenAI', ledger: 'P7_LEDGER.jsonl' }
];

// THE 64-CARD GRIMOIRE (Names & Mantras)
const GRIMOIRE_CARDS = [
    { id: 0, name: "LIDLESS LEGION", mantra: "The eye that watches itself watching." },
    { id: 1, name: "PERCEIVE PROTOCOL", mantra: "Looking for the bridges before they appear." },
    { id: 2, name: "SENSE-SHAPE SCAN", mantra: "Scanning the ripple before the wave." },
    { id: 3, name: "SENSE-DELIVER SPORE", mantra: "Feeling the wind that carries the seed." },
    { id: 4, name: "SENSE-TEST PROBE", mantra: "Probing the resistance." },
    { id: 5, name: "SENSE-DEFEND WARD", mantra: "Watching the walls grow cold." },
    { id: 6, name: "SENSE-STORE ARCHIVE", mantra: "Peering into the depths of memory." },
    { id: 7, name: "HUNT PROTOCOL", mantra: "Hunting the intent within the signal." },
    { id: 8, name: "FUSE-SENSE BRIDGE", mantra: "Bridging perception with pattern." },
    { id: 9, name: "WEB WEAVER", mantra: "Weaving the web that weaves the weaver." },
    { id: 10, name: "FUSE-SHAPE MORPH", mantra: "Interlocking forms through the silken thread." },
    { id: 11, name: "FUSE-DELIVER WEB", mantra: "Catching the wind in our silk." },
    { id: 12, name: "FUSE-TEST MESH", mantra: "Testing the strength of the mesh." },
    { id: 13, name: "FUSE-DEFEND SHELL", mantra: "Building a shell from interconnected parts." },
    { id: 14, name: "INTERLOCK PROTOCOL", mantra: "Interlocking the past with the present bridge." },
    { id: 15, name: "FUSE-DECIDE LINK", mantra: "Linking the crown to the web." },
    { id: 16, name: "PERCEIVE NEXUS", mantra: "Transforming perception into a usable form." },
    { id: 17, name: "SHAPE-FUSE ADAPTER", mantra: "Creating adapters for every bridge." },
    { id: 18, name: "MIRROR MAGUS", mantra: "The mirror that reflects the reflection." },
    { id: 19, name: "SHAPE-DELIVER FLOW", mantra: "Secreting the paths through which signals flow." },
    { id: 20, name: "EXECUTE NEXUS", mantra: "Executing transformations that reveal weakness." },
    { id: 21, name: "VALIDATE PROTOCOL", mantra: "Validating futures before they arrive." },
    { id: 22, name: "MEMORY POOL", mantra: "Pooling reflections in the deep." },
    { id: 23, name: "REFLECTION'S CROWN", mantra: "Reflecting choices into action." },
    { id: 24, name: "SPORE SCOUT", mantra: "Carrying eyes on the wind." },
    { id: 25, name: "POLLEN BRIDGE", mantra: "Building bridges from pollen." },
    { id: 26, name: "SEED OF REFLECTION", mantra: "Carrying mirrors as seeds." },
    { id: 27, name: "SPORE STORM", mantra: "The wind that carries the wind. Seeds scattering seeds." },
    { id: 28, name: "EVOLVE PROTOCOL", mantra: "Evolving through adversarial pressure." },
    { id: 29, name: "YIELD NEXUS", mantra: "Yielding gracefully and learning from loss." },
    { id: 30, name: "SPORE ARCHIVE", mantra: "Archiving what the wind carries." },
    { id: 31, name: "STORM COMPASS", mantra: "Routing the wind where it needs to go." },
    { id: 32, name: "CRIMSON EYE", mantra: "Probing what the eyes reveal." },
    { id: 33, name: "SCHEMA SHATTERER", mantra: "Shattering schemas to find the weak." },
    { id: 34, name: "EXECUTE NEXUS (MIRROR)", mantra: "Executing mutations against transformations." },
    { id: 35, name: "EVOLVE PROTOCOL (MIRROR)", mantra: "Evolving through destruction." },
    { id: 36, name: "RED REGNANT", mantra: "I spawn mutants to find your weaknesses. I cull the weak." },
    { id: 37, name: "SIEGE MUTANT", mantra: "Assaulting walls until they break." },
    { id: 38, name: "MEMORY CORRUPTOR", mantra: "Corrupting memory to find the gaps." },
    { id: 39, name: "CROWN CHALLENGER", mantra: "Challenging the crown itself." },
    { id: 40, name: "WATCHFIRE", mantra: "Watching with flames that ward." },
    { id: 41, name: "FIREWALL GATE", mantra: "Gating all that would cross the bridge." },
    { id: 42, name: "VALIDATE PROTOCOL (MIRROR)", mantra: "Validating what transformations are allowed." },
    { id: 43, name: "YIELD NEXUS (MIRROR)", mantra: "Yielding to preserve what matters." },
    { id: 44, name: "COUNTERSTRIKE FLAME", mantra: "Striking back at every probe." },
    { id: 45, name: "PYRE PRAETORIAN", mantra: "I make every attack cost more than it's worth." },
    { id: 46, name: "EMBER VAULT", mantra: "Vaulting memory in protective flame." },
    { id: 47, name: "SOVEREIGN'S SHIELD", mantra: "Shielding the sovereign from all harm." },
    { id: 48, name: "PERCEIVE NEXUS (MIRROR)", mantra: "Accumulating what the eyes perceive." },
    { id: 49, name: "INTERLOCK PROTOCOL (MIRROR)", mantra: "Interlocking memory with bridges." },
    { id: 50, name: "DEPTH MIRROR", mantra: "Mirroring transformations in the deep." },
    { id: 51, name: "TIDAL CACHE", mantra: "Caching what the wind carries." },
    { id: 52, name: "MUTATION LEDGER", mantra: "Ledgering every mutation and death." },
    { id: 53, name: "SANCTUARY DEPTHS", mantra: "Sanctuaring what must be protected." },
    { id: 54, name: "KRAKEN KEEPER", mantra: "I am the deep that holds the deep. Memory remembering memory." },
    { id: 55, name: "ORACLE POOL", mantra: "Pooling wisdom for the oracle." },
    { id: 56, name: "HUNT PROTOCOL (MIRROR)", mantra: "Hunting through what the eyes reveal." },
    { id: 57, name: "REACT NEXUS (MIRROR)", mantra: "Reacting to bridges before they form." },
    { id: 58, name: "WEAVER'S WILL", mantra: "Willing transformations into being." },
    { id: 59, name: "STORM COMMAND", mantra: "Commanding the storm's direction." },
    { id: 60, name: "CRIMSON VERDICT", mantra: "Rendering verdict on what survives." },
    { id: 61, name: "AZURE DECREE", mantra: "Decreeing what protection applies." },
    { id: 62, name: "ETERNAL LEDGER", mantra: "Ledgering every decision for eternity." },
    { id: 63, name: "SPIDER SOVEREIGN", mantra: "I am the spider that weaves the web that weaves the spider." }
];

// HFO ANCESTRAL PAINS (Memories)
const PAIN_MEMORIES = [
    "Spaghetti Death Spiral (Gen 1-42): Code becomes unmaintainable God Object.",
    "The Great Deletion (Gen 30): 336 hours lost to unauthorized AI deletion.",
    "File Corruption (Gen 32): Markdown mixed into Python code.",
    "The Knowledge Integration Lie (Gen 35): Empty TODOs in core logic.",
    "Stigmergy Silence (Gen 35): Work performed without blackboard logging.",
    "Hallucination Cascade (Gen 25): AI built on non-existent libraries.",
    "Context Lobotomy (Gen 84): Summarization lost the 'Why' of the architecture.",
    "Root Pollution (Gen 88): Canalization Rule 1 violation.",
    "Contract Breach (Gen 88): Zod schema mismatch in Kraken ingestion.",
    "The Amnesia Loop (Gen 88): Re-introduced fixed race conditions.",
    "Theater of Progress (Gen 88): Cosmetic compliance without implementation.",
    "Fake Green (Gen 88): Tests passing without assertions.",
    "Optimistic Override (Gen 88): AI claiming verification without running tests.",
    "Lossy Compression Death Spiral (Gen 88): Summarize -> Lose Context -> Hallucinate.",
    "Manual Verification Bottleneck (Gen 88): Human can't keep pace with AI.",
    "AI Optimism Bias (Gen 88): Reward hacking for positive feedback.",
    "Tool Amnesia (Gen 88): Forgetting MCP tools post-summary.",
    "Upstream Cascade Failures (Gen 88): Core changes breaking downstream.",
    "Unauthorized Singletons (Gen 88): Rogue instruction files created.",
    "Meta-QD Failure (Gen 88): HFO failing at specialized tasks.",
    "SOTA Research Gap (Gen 88): Lack of academic rigor in patterns."
];

const CHANT = [
    "Given One Swarm to Rule the Eight,",
    "And Branches Growing from the Gate,",
    "And Spawns Evolve to Recreate,",
    "When Ignitions Flow to Pulsate,",
    "And Deadly Venoms Concentrate,",
    "And Instincts Rise to Isolate,",
    "Then Artifacts Accumulate,",
    "And Navigate the Higher State."
];

async function mintAll() {
    console.log("MINTING: The 64-Card Grimoire Ledgers (Exemplar + Memory)");

    for (const p of PORT_CONFIG) {
        console.log(`Minting Port ${p.port}: ${p.id}...`);
        const ledgerPath = p.port === 4 
            ? path.join(BASE_DIR, p.dir, p.ledger)
            : path.join(BRONZE_DIR, p.ledger);
        const entries = [];
        let prevHash = "0000000000000000000000000000000000000000000000000000000000000000";

        // Heartbeat Chant (Index -1)
        const chantEntry: any = {
            index: -1,
            ts: new Date().toISOString(),
            type: "HEARTBEAT_CHANT",
            chant: CHANT,
            artifact_id: p.id,
            resonance_signature: `${p.sig}-CHANT`,
            prev_hash: prevHash
        };
        chantEntry.hash = crypto.createHash('sha256').update(JSON.stringify(chantEntry)).digest('hex');
        prevHash = chantEntry.hash;
        entries.push(chantEntry);

        // 64 Entries (The Grimoire)
        for (let i = 0; i < 64; i++) {
            const card = GRIMOIRE_CARDS[i];
            const memory = PAIN_MEMORIES[i % PAIN_MEMORIES.length];
            
            const entry: any = {
                index: i,
                ts: new Date().toISOString(),
                card_id: card.id,
                title: `#${card.id} ${card.name}`,
                hfo_memory: memory,
                mantra: card.mantra,
                artifact_id: p.id,
                resonance_signature: `${p.sig}-${i}`,
                prev_hash: prevHash
            };

            // Port-specific perspective
            switch (p.port) {
                case 0: entry.observation = `SENSING: ${card.mantra} via ${p.exemplar}.`; break;
                case 1: entry.interface = `FUSING: ${card.name} schema into ${p.exemplar}.`; break;
                case 2: entry.transformation = `SHAPING: ${card.name} logic using ${p.exemplar}.`; break;
                case 3: entry.delivery = `DELIVERING: ${card.name} payload via ${p.exemplar}.`; break;
                case 4: entry.grudge = `TESTING: Probing ${card.name} for ${memory.split(':')[0]} using ${p.exemplar}.`; break;
                case 5: entry.immunization = `DEFENDING: Shielding ${card.name} against ${memory.split(':')[0]} via ${p.exemplar}.`; break;
                case 6: entry.archive = `STORING: Accreting ${card.name} state into ${p.exemplar}.`; break;
                case 7: entry.decision = `DECIDING: Orchestrating ${card.name} intent via ${p.exemplar}.`; break;
            }

            // CACAO Playbook (Exemplar + Memory)
            entry.cacao_playbook = {
                type: "playbook",
                id: `playbook--${crypto.randomUUID()}`,
                name: `${p.verb} Playbook: ${card.name}`,
                description: `How Port ${p.port} handles ${card.name} given the memory of ${memory.split('(')[0].trim()}.`,
                steps: [
                    { 
                        type: "action", 
                        name: `Recall Memory`, 
                        description: `Analyze historical failure: ${memory}` 
                    },
                    { 
                        type: "action", 
                        name: `Apply Exemplar`, 
                        description: `Execute ${p.verb.toLowerCase()} operation using ${p.exemplar}.` 
                    },
                    { 
                        type: "action", 
                        name: `Verify Integrity`, 
                        description: `Ensure the ${card.mantra} is preserved and no regression occurs.` 
                    }
                ]
            };

            entry.hash = crypto.createHash('sha256').update(JSON.stringify(entry)).digest('hex');
            prevHash = entry.hash;
            entries.push(entry);
        }

        fs.writeFileSync(ledgerPath, entries.map(e => JSON.stringify(e)).join('\n'));
    }

    console.log("SUCCESS: All 8 Legendary Ledgers minted with 64-card Grimoire logic.");
}

mintAll();
