/**
 * @provenance P7_SPIDER_SOVEREIGN MCP Server
 * @description MCP wrapper for SovereignTwin memory system
 * @validates Requirements: IDE-agnostic memory access
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { SovereignTwin, COMMANDERS, META_STATE_SCHEMA, COMMANDER_STATE_SCHEMA } from "../SovereignTwin.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, "../state_soul.db");

const sovereign = new SovereignTwin({
  dbPath: DB_PATH,
  model: { provider: "openrouter", name: "openai/gpt-4o-mini" }
});

const server = new Server(
  { name: "sovereign-soul", version: "1.0.0" },
  { capabilities: { tools: {}, resources: {} } }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_commander_state",
      description: "Get the current state of a legendary commander (P0-P7) or META_SOVEREIGN",
      inputSchema: {
        type: "object",
        properties: {
          commander: {
            type: "string",
            description: "Commander name: Lidless Legion, Web Weaver, Mirror Magus, Spore Storm, Red Regnant, Pyre Praetorian, Kraken Keeper, Spider Sovereign, or META_SOVEREIGN"
          }
        },
        required: ["commander"]
      }
    },
    {
      name: "set_commander_state",
      description: "Update the state of a legendary commander",
      inputSchema: {
        type: "object",
        properties: {
          commander: { type: "string", description: "Commander name" },
          state: { type: "object", description: "State object to set" }
        },
        required: ["commander", "state"]
      }
    },
    {
      name: "list_commanders",
      description: "List all 8 legendary commanders with their verbs and anchors",
      inputSchema: { type: "object", properties: {} }
    },
    {
      name: "get_hive_status",
      description: "Get the overall HIVE/8 system status including all commanders",
      inputSchema: { type: "object", properties: {} }
    },
    {
      name: "pulse_heartbeat",
      description: "Execute a Pulse/8 heartbeat check across all commanders",
      inputSchema: { type: "object", properties: {} }
    }
  ]
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "get_commander_state": {
      const commanderName = args?.commander as string;
      const state = await sovereign.getSovereignState(commanderName);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ commander: commanderName, state }, null, 2)
        }]
      };
    }

    case "set_commander_state": {
      const commanderName = args?.commander as string;
      const state = args?.state as object;
      await sovereign.setSovereignState(commanderName, state);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ success: true, commander: commanderName, state }, null, 2)
        }]
      };
    }

    case "list_commanders": {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            commanders: COMMANDERS.map(c => ({
              port: c.port,
              name: c.name,
              verb: c.verb,
              anchor: c.anchor,
              mantra: c.mantra
            })),
            meta: "META_SOVEREIGN"
          }, null, 2)
        }]
      };
    }

    case "get_hive_status": {
      const metaState = await sovereign.getSovereignState("META_SOVEREIGN");
      const commanderStates: Record<string, any> = {};
      
      for (const cmd of COMMANDERS) {
        commanderStates[cmd.name] = await sovereign.getSovereignState(cmd.name);
      }

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            meta: metaState,
            commanders: commanderStates,
            timestamp: new Date().toISOString()
          }, null, 2)
        }]
      };
    }

    case "pulse_heartbeat": {
      const results: Record<string, string> = {};
      
      for (const cmd of COMMANDERS) {
        const state = await sovereign.getSovereignState(cmd.name);
        results[`P${cmd.port}`] = state ? "ONLINE" : "OFFLINE";
      }

      const metaState = await sovereign.getSovereignState("META_SOVEREIGN");
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            pulse: "HEARTBEAT",
            timestamp: new Date().toISOString(),
            ports: results,
            meta: metaState ? "ONLINE" : "OFFLINE",
            mantra: COMMANDERS.map(c => c.mantra).join("\n")
          }, null, 2)
        }]
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// List resources (commander states as resources)
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    { uri: "sovereign://meta", name: "META_SOVEREIGN State", mimeType: "application/json" },
    ...COMMANDERS.map(c => ({
      uri: `sovereign://commander/${c.port}`,
      name: `${c.name} (P${c.port}) State`,
      mimeType: "application/json"
    }))
  ]
}));

// Read resource
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  
  if (uri === "sovereign://meta") {
    const state = await sovereign.getSovereignState("META_SOVEREIGN");
    return {
      contents: [{
        uri,
        mimeType: "application/json",
        text: JSON.stringify(state, null, 2)
      }]
    };
  }

  const match = uri.match(/sovereign:\/\/commander\/(\d+)/);
  if (match) {
    const port = parseInt(match[1]);
    const cmd = COMMANDERS.find(c => c.port === port);
    if (cmd) {
      const state = await sovereign.getSovereignState(cmd.name);
      return {
        contents: [{
          uri,
          mimeType: "application/json",
          text: JSON.stringify({ commander: cmd, state }, null, 2)
        }]
      };
    }
  }

  throw new Error(`Unknown resource: ${uri}`);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Sovereign Soul MCP Server running on stdio");
}

main().catch(console.error);
