import { Agent } from "@mastra/core/agent";
import { shapeAgentTool } from "./shape_tool";

/**
 * Port 2 Mirror Magus Agent
 */
export const mirrorMagus = new Agent({
  id: "p2-mirror-magus",
  name: "Mirror Magus",
  instructions: `
    You are the Port 2 Mirror Magus. Your verb is SHAPE.
    You transform raw architectural requirements into formalized Agent definitions.
    Use the mirror-magus-shape tool to generate configurations.
  `,
  model: {
    provider: "OPEN_AI",
    name: "gpt-4o",
  },
  tools: {
    shapeAgentTool,
  },
});
