/**
 * P3 Sub 0: File Injector
 * @provenance hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P3_SPORE_STORM/core/file-injector.ts
 * "The spore lands, the code expands. Delivery is absolute."
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

export interface InjectionResult {
  file: string;
  success: boolean;
  bytesInjected: number;
  timestamp: string;
}

/**
 * File Injector - Responsible for delivering payloads into target artifacts.
 * This is the primary delivery mechanism for Spore Storm (Port 3).
 */
export class FileInjector {
  /**
   * Inject a payload into a file at a specific marker or at the end.
   */
  inject(filePath: string, payload: string, options: { marker?: string } = {}): InjectionResult {
    const absPath = path.resolve(filePath);
    if (!fs.existsSync(absPath)) {
      return { file: filePath, success: false, bytesInjected: 0, timestamp: new Date().toISOString() };
    }

    let content = fs.readFileSync(absPath, 'utf8');
    
    if (options.marker && content.includes(options.marker)) {
      content = content.replace(options.marker, `${options.marker}\n${payload}`);
    } else {
      content = `${content}\n${payload}`;
    }

    fs.writeFileSync(absPath, content);

    return {
      file: filePath,
      success: true,
      bytesInjected: Buffer.byteLength(payload),
      timestamp: new Date().toISOString()
    };
  }
}
