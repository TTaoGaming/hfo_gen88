
import { it, expect } from 'vitest';
import { auditContent, violations, clearViolations } from './RED_REGNANT.js';

it('debug audit', () => {
    clearViolations();
    auditContent('test.ts', '// TODO: something');
    console.log('VIOLATIONS:', JSON.stringify(violations, null, 2));
    expect(violations[0].type).toBe('AMNESIA');
});
