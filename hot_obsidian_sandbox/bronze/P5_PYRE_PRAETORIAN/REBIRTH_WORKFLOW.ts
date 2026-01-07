/**
 * REBIRTH WORKFLOW (PORT 0x05: THE BLUE PHOENIX)
 * 
 * "What is dead may never die, but rises again, harder and stronger."
 * 
 * Durable Orchestration for the Phoenix Protocol.
 * Using Temporal.io to manage the lifecycle of an artifact from Immolation to Rebirth.
 */

import { proxyActivities, defineSignal, setHandler, condition } from '@temporalio/workflow';
import type * as activities from './activities';

// Define activities proxy
const { immolate, audit, promote } = proxyActivities<typeof activities>({
    startToCloseTimeout: '1 minute',
    retry: {
        maximumAttempts: 5
    }
});

// Signals
export const resolveSignal = defineSignal<[string]>('resolve');

/**
 * The Phoenix Rebirth Workflow
 */
export async function phoenixRebirthWorkflow(artifactPath: string): Promise<string> {
    let isResolved = false;
    let fixDetail = '';

    // Step 1: Immolate (Move to Quarantine)
    await immolate(artifactPath, "Failed Red Queen Audit");

    // Step 2: Set signal handler for Rebirth
    setHandler(resolveSignal, (detail) => {
        isResolved = true;
        fixDetail = detail;
    });

    // Step 3: Wait for 'resolve' signal from the Agent/User
    // In a real swarm, this is where the agent would 'sense' the fail and work on it.
    console.log(`[Port 5] Artifact ${artifactPath} is in the ash. Waiting for rebirth signal...`);
    await condition(() => isResolved);

    // Step 4: Audit (Check if the fix is valid)
    const auditResult = await audit(artifactPath);
    if (auditResult.screams > 0) {
        throw new Error(`[Port 5] Rebirth aborted: ${auditResult.screams} screams persist.`);
    }

    // Step 5: Promote (Return to Silver)
    await promote(artifactPath);

    return `[Port 5] Artifact ${artifactPath} has been REBORN. Reason: ${fixDetail}`;
}
