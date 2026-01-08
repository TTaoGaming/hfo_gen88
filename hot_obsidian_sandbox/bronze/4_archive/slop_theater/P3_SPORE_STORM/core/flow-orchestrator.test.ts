/**
 * P3 Sub 5: Flow Orchestrator Test
 * @provenance hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P3_SPORE_STORM/core/flow-orchestrator.test.ts
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { FlowOrchestrator } from './flow-orchestrator.js';

describe('FlowOrchestrator', () => {
    const testFile = path.resolve(process.cwd(), 'flow_test.txt');

    beforeEach(() => {
        fs.writeFileSync(testFile, 'TARGET');
    });

    afterEach(() => {
        if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
    });

    it('should coordinate event to injection', () => {
        const orchestrator = new FlowOrchestrator();
        orchestrator.setupTriggeredInjection('DEPLOY', testFile, {
            id: 'f1',
            data: 'FLOW_DATA',
            type: 'DATA'
        });

        orchestrator.process({
            type: 'DEPLOY',
            payload: {},
            timestamp: new Date().toISOString()
        });

        const content = fs.readFileSync(testFile, 'utf8');
        expect(content).toContain('FLOW_DATA');
    });
});
