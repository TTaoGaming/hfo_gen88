
import { auditContent, violations, clearViolations } from './RED_REGNANT.js';
import * as path from 'node:path';

clearViolations();
auditContent('test.ts', '// TODO: something');
console.log('VIOLATIONS:', JSON.stringify(violations, null, 2));
