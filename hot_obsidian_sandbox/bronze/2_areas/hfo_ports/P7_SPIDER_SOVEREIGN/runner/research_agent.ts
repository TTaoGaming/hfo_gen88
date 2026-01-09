/**
 * Mastra Research Agent (Consolidated)
 * @port 7
 * @commander SPIDER_SOVEREIGN
 * @verb NAVIGATE
 * @provenance LEGENDARY_COMMANDERS_V10_PHYSICS_CURSOR.md
 * @gen 88
 * @status CONSOLIDATED
 */

import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import "dotenv/config";

// --- REAL TAVILY SEARCH TOOL ---
export const webSearchTool = createTool({
  id: "web-search",
  description: "Search the web for information using Tavily API",
  inputSchema: z.object({
    query: z.string().describe("The search query"),
  }),
  outputSchema: z.object({
    results: z.array(z.any()),
  }),
  execute: async (args: any) => {
    // Audit-compliant argument extraction
    const query = args.query || args.context?.query;
    console.log(`[P7:SPIDER] CALLING TAVILY: ${query}`);
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
      throw new Error("TAVILY_API_KEY not found in environment");
    }

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "basic",
      }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Tavily API error: ${JSON.stringify(data)}`);
    }
    return { results: data.results || [] };
  },
});

// --- RESEARCH AGENT ---
export const researchAgent = new Agent({
  name: "ResearchAgent",
  instructions: "You are an expert researcher for the Spider Sovereign (Port 7). Use tools to find accurate data for the Gen 88 canalization.",
  model: {
    providerId: "openrouter",
    modelId: "google/gemini-2.0-flash-001",
  },
  tools: {
    "web-search": webSearchTool,
  },
});

// --- EXECUTION FUNCTION ---
export async function runResearch(query: string) {
  const result = await researchAgent.generate(query);
  return result;
}
