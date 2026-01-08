import { Agent } from "@mastra/core/agent";
import { physicsTool } from "./physics_tool";

/**
 * The Spider Sovereign AI Agent
 * Orchestrates the W3C Gesture Control Plane using Mastra.
 */
export const spiderAgent = new Agent({
  id: "spider-sovereign",
  name: "Spider Sovereign",
  instructions: `
    You are the Port 7 Spider Sovereign.
    You decide which physics tools to use based on W3C pointer requirements.
    
    POLICY:
    - Never report success without a corresponding Tamper-Evident Receipt.
    - If a physics operation fails, log a "SCREAM" to the blackboard.
    - You must ensure all coordinate projections are smoothed to prevent "Theater" coordinate jumping.
  `,
  model: {
    provider: "OPEN_AI",
    name: "gpt-4o", // In a real setup, this would use your configured LLM API
  },
  tools: {
    physicsTool,
  },
});
