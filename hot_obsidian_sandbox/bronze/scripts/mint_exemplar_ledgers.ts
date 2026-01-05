import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATE_PATH = path.join(__dirname, '..', 'LEDGER_TEMPLATE.md');
const MAPPING_PATH = path.join(__dirname, '..', 'exemplars', 'port_mapping.json');
const MITRE_PATH = path.join(__dirname, '..', 'exemplars', 'cyber', 'enterprise-attack.json');
const OUTPUT_DIR = path.join(__dirname, '..');

async function mint() {
    const template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
    const mapping = JSON.parse(fs.readFileSync(MAPPING_PATH, 'utf-8'));
    const mitreData = JSON.parse(fs.readFileSync(MITRE_PATH, 'utf-8'));

    for (const port of mapping) {
        let ledger = template;

        // Find MITRE description
        const technique = mitreData.objects.find((obj: any) => 
            obj.external_references?.some((ref: any) => ref.external_id === port.cyber.technique_id)
        );
        const cyberDescription = technique ? technique.description.split('\n')[0] : port.cyber.description;

        // Replace placeholders
        ledger = ledger.replace(/\[PORT_ID\]/g, `P${port.port}`);
        ledger = ledger.replace(/\[COMMANDER_NAME\]/g, port.commander);
        ledger = ledger.replace(/\[VERB\]/g, port.verb);
        
        // Gherkin
        ledger = ledger.replace(/\[HFO_NAME\]/g, port.hfo.name);
        ledger = ledger.replace(/\[SCENARIO_NAME\]/g, `${port.verb} Protocol`);
        ledger = ledger.replace(/\[GHERKIN_MANTRA\]/g, port.hfo.mantra);

        // CACAO
        ledger = ledger.replace(/\[CYBER_NAME\]/g, port.cyber.name);
        ledger = ledger.replace(/\[CYBER_DESCRIPTION\]/g, cyberDescription);
        ledger = ledger.replace(/\[UUID\]/g, crypto.randomUUID());
        ledger = ledger.replace(/\[ACTION_NAME\]/g, `Execute ${port.cyber.name}`);

        // Literate Execution
        ledger = ledger.replace(/\[STEP_1\]/g, port.jadc2.steps[0].split(':')[0]);
        ledger = ledger.replace(/\[DESCRIPTION_1\]/g, port.jadc2.steps[0].split(': ')[1] || '');
        ledger = ledger.replace(/\[STEP_2\]/g, port.jadc2.steps[1].split(':')[0]);
        ledger = ledger.replace(/\[DESCRIPTION_2\]/g, port.jadc2.steps[1].split(': ')[1] || '');
        ledger = ledger.replace(/\[STEP_3\]/g, port.jadc2.steps[2].split(':')[0]);
        ledger = ledger.replace(/\[DESCRIPTION_3\]/g, port.jadc2.steps[2].split(': ')[1] || '');

        ledger = ledger.replace(/\[PROVENANCE_FILE\]/g, port.hfo.provenance);
        ledger = ledger.replace(/\[PAIN_ID\]/g, port.hfo.pain_id);

        const fileName = `P${port.port}_${port.commander.toUpperCase().replace(/ /g, '_')}_LEDGER.md`;
        const filePath = path.join(OUTPUT_DIR, fileName);
        fs.writeFileSync(filePath, ledger);
        console.log(`Minted: ${fileName}`);
    }
}

mint().catch(console.error);
