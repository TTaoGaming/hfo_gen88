/**
 * Quick script to scan the real codebase for BLINDSPOT violations
 * Run with: npx tsx hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P4_RED_REGNANT/scripts/scan-real-codebase.ts
 */

import { BlindspotDetector } from '../detectors/blindspot.js';
import { verifyScreamReceipt } from '../contracts/screams.js';

async function main() {
  const detector = new BlindspotDetector();
  
  console.log('🔍 BLINDSPOT Detector - Real Codebase Scan');
  console.log('==========================================\n');
  
  const targetPath = 'hot_obsidian_sandbox/bronze';
  console.log(`Target: ${targetPath}\n`);
  
  const result = await detector.detect(targetPath);
  
  console.log(`📊 SCAN RESULTS:`);
  console.log(`   Files Scanned: ${result.filesScanned}`);
  console.log(`   Violations Found: ${result.violationsFound}`);
  console.log(`   Duration: ${result.duration}ms\n`);
  
  if (result.receipts.length > 0) {
    console.log('📋 VIOLATIONS BY PATTERN:\n');
    
    // Group by pattern
    const byPattern = new Map<string, typeof result.receipts>();
    for (const receipt of result.receipts) {
      const pattern = receipt.details.patternName as string;
      if (!byPattern.has(pattern)) {
        byPattern.set(pattern, []);
      }
      byPattern.get(pattern)!.push(receipt);
    }
    
    for (const [pattern, receipts] of byPattern) {
      console.log(`  ${pattern}: ${receipts.length} violation(s)`);
      for (const receipt of receipts.slice(0, 3)) { // Show first 3
        const lines = (receipt.details.lineNumbers as number[]).slice(0, 5).join(', ');
        console.log(`    - ${receipt.file}`);
        console.log(`      Lines: ${lines}${(receipt.details.lineNumbers as number[]).length > 5 ? '...' : ''}`);
        console.log(`      Severity: ${receipt.details.severity}`);
        console.log(`      Hash Valid: ${verifyScreamReceipt(receipt) ? '✅' : '❌'}`);
      }
      if (receipts.length > 3) {
        console.log(`    ... and ${receipts.length - 3} more`);
      }
      console.log();
    }
  } else {
    console.log('✅ No BLINDSPOT violations found in the codebase!');
  }
  
  console.log('==========================================');
  console.log('Scan complete. This is NOT cosmetic theater.');
}

main().catch(console.error);
