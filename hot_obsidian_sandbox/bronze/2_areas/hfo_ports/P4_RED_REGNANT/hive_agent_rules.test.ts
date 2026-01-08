import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const BLACKBOARD_PATH = path.resolve(process.cwd(), 'hot_obsidian_sandbox/hot_obsidianblackboard.jsonl');

describe('HFO HIVE AGENT Enforcement', () => {
    it('should have a recent SEARCH_GROUNDING event on the blackboard', () => {
        const content = fs.readFileSync(BLACKBOARD_PATH, 'utf-8');
        const lines = content.trim().split('\n');
        const searchGrounding = lines.some(line => {
            if (!line) return false;
            try {
                const entry = JSON.parse(line);
                const type = entry.type || entry.event;
                const ts = entry.ts || entry.timestamp || entry.time;
                return type === 'SEARCH_GROUNDING' && (new Date().getTime() - new Date(ts).getTime() < 86400000); // 24 hours
            } catch (err) {
                return false;
            }
        });
        expect(searchGrounding).toBe(true);
    });

    it('should have a recent THINKING_GROUNDING event on the blackboard', () => {
        const content = fs.readFileSync(BLACKBOARD_PATH, 'utf-8');
        const lines = content.trim().split('\n');
        const thinkingGrounding = lines.some(line => {
            if (!line) return false;
            try {
                const entry = JSON.parse(line);
                const type = entry.type || entry.event;
                const ts = entry.ts || entry.timestamp || entry.time;
                return type === 'THINKING_GROUNDING' && (new Date().getTime() - new Date(ts).getTime() < 86400000); // 24 hours
            } catch (err) {
                return false;
            }
        });
        expect(thinkingGrounding).toBe(true);
    });

    it('should have a recent MEMORY_GROUNDING event on the blackboard', () => {
        const content = fs.readFileSync(BLACKBOARD_PATH, 'utf-8');
        const lines = content.trim().split('\n');
        const memoryGrounding = lines.some(line => {
            if (!line) return false;
            try {
                const entry = JSON.parse(line);
                const type = entry.type || entry.event;
                const ts = entry.ts || entry.timestamp || entry.time;
                return type === 'MEMORY_GROUNDING' && (new Date().getTime() - new Date(ts).getTime() < 86400000); // 24 hours
            } catch (err) {
                return false;
            }
        });
        expect(memoryGrounding).toBe(true);
    });
});
