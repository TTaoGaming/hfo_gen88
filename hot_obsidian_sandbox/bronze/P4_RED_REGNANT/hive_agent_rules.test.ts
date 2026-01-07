import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const BLACKBOARD_PATH = path.resolve(process.cwd(), 'obsidianblackboard.jsonl');

describe('HFO HIVE AGENT Enforcement', () => {
    it('should have a recent SEARCH_GROUNDING event on the blackboard', () => {
        const content = fs.readFileSync(BLACKBOARD_PATH, 'utf-8');
        const lines = content.trim().split('\n');
        const searchGrounding = lines.some(line => {
            const entry = JSON.parse(line);
            return entry.type === 'SEARCH_GROUNDING' && (new Date().getTime() - new Date(entry.ts).getTime() < 3600000);
        });
        expect(searchGrounding).toBe(true);
    });

    it('should have a recent THINKING_GROUNDING event on the blackboard', () => {
        const content = fs.readFileSync(BLACKBOARD_PATH, 'utf-8');
        const lines = content.trim().split('\n');
        const thinkingGrounding = lines.some(line => {
            const entry = JSON.parse(line);
            return entry.type === 'THINKING_GROUNDING' && (new Date().getTime() - new Date(entry.ts).getTime() < 3600000);
        });
        expect(thinkingGrounding).toBe(true);
    });

    it('should have a recent MEMORY_GROUNDING event on the blackboard', () => {
        const content = fs.readFileSync(BLACKBOARD_PATH, 'utf-8');
        const lines = content.trim().split('\n');
        const memoryGrounding = lines.some(line => {
            const entry = JSON.parse(line);
            return entry.type === 'MEMORY_GROUNDING' && (new Date().getTime() - new Date(entry.ts).getTime() < 3600000);
        });
        expect(memoryGrounding).toBe(true); // THIS SHOULD FAIL
    });
});
