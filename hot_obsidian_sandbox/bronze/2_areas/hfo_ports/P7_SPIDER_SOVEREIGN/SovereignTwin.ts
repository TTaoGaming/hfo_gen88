import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { Mastra } from "@mastra/core";
import { z } from "zod";
import path from "node:path";

export interface CommanderConfig {
    port: number;
    name: string;
    verb: string;
    anchor: string;
    mantra: string;
}

export const COMMANDERS: CommanderConfig[] = [
    { port: 0, name: "Lidless Legion", verb: "SENSE", anchor: "Urza, Lord High Artificer", mantra: "Given One Swarm to Rule the Eight," },
    { port: 1, name: "Web Weaver", verb: "FUSE", anchor: "Breya, Etherium Shaper", mantra: "And Branches Growing from the Gate," },
    { port: 2, name: "Mirror Magus", verb: "SHAPE", anchor: "Sakashima of a Thousand Faces", mantra: "And Spawns Evolve to Recreate," },
    { port: 3, name: "Spore Storm", verb: "DELIVER", anchor: "Ghave, Guru of Spores", mantra: "When Ignitions Flow to Pulsate," },
    { port: 4, name: "Red Regnant", verb: "DISRUPT", anchor: "Elesh Norn, Mother of Machines", mantra: "And Deadly Venoms Concentrate," },
    { port: 5, name: "Pyre Praetorian", verb: "DEFEND", anchor: "Syrix, Carrier of the Flame", mantra: "And Instincts Rise to Isolate," },
    { port: 6, name: "Kraken Keeper", verb: "STORE", anchor: "Arixmethes, Slumbering Isle", mantra: "Then Artifacts Accumulate," },
    { port: 7, name: "Spider Sovereign", verb: "NAVIGATE", anchor: "Kenrith, the Returned King", mantra: "And Navigate the Higher State." }
];

export const META_STATE_SCHEMA = z.object({
    active_disruptions: z.number().default(0),
    system_health: z.number().min(0).max(100).default(88),
    commander_status: z.record(z.string(), z.enum(["ACTIVE", "STALLED", "KINETIC"])).default({}),
    last_pulse_ts: z.string().optional()
});

export const COMMANDER_STATE_SCHEMA = z.object({
    entropy_level: z.number().default(0),
    task_queue: z.array(z.string()).default([]),
    local_integrity: z.number().default(88),
    custom_context: z.record(z.string(), z.any()).default({})
});

export interface SovereignConfig {
    dbPath: string;
    model: {
        provider: string;
        name: string;
    };
}

export class SovereignTwin {
    private mastra: Mastra;
    private storage: LibSQLStore;

    constructor(config: SovereignConfig) {
        const absoluteDbPath = path.isAbsolute(config.dbPath) 
            ? config.dbPath 
            : path.resolve(process.cwd(), config.dbPath);

        this.storage = new LibSQLStore({ 
            url: `file:${absoluteDbPath}` 
        });

        // Initialize Agents for each Commander + Meta
        const agents: Record<string, Agent> = {};

        // Meta Agent
        agents["META_SOVEREIGN"] = new Agent({
            name: "META_SOVEREIGN",
            instructions: "You are the meta-state coordinator for HFO Gen 88. You maintain the global synaptic state. Enforce the 8-stage Refinement Sequence: Hot/Cold Bronze -> Hot/Cold Silver -> Hot/Cold Gold -> Hot/Cold Hyper Fractal Obsidian (HFO). Achieve MAP ELITE synergy across all ports.",
            model: config.model as any,
            memory: new Memory({ 
                storage: this.storage, 
                name: "META_SOVEREIGN_MEMORY",
                options: {
                    workingMemory: {
                        enabled: true,
                        schema: META_STATE_SCHEMA,
                        scope: "resource"
                    }
                }
            })
        });

        // Legendary Commanders
        for (const cmd of COMMANDERS) {
            agents[cmd.name] = new Agent({
                name: cmd.name,
                instructions: `You are Commander ${cmd.name} (Port ${cmd.port}). 
Your verb is ${cmd.verb}. 
Your semiotic anchor is ${cmd.anchor}. 
Your heartbeat mantra is: "${cmd.mantra}" 
You are part of the HFO Gen 88 Cleanroom. Enforce the PARA structure and the Medallion architecture.`,
                model: config.model as any,
                memory: new Memory({ 
                    storage: this.storage, 
                    name: `${cmd.name.replace(/\s+/g, '_')}_MEMORY`,
                    options: {
                        workingMemory: {
                            enabled: true,
                            schema: COMMANDER_STATE_SCHEMA,
                            scope: "resource"
                        }
                    }
                })
            });
        }

        this.mastra = new Mastra({
            storage: this.storage,
            agents
        });
    }

    public getAgent(name: string): Agent {
        return this.mastra.getAgent(name);
    }

    public async getMemory(agentName: string) {
        const agent = this.getAgent(agentName);
        return await agent.getMemory();
    }

    public getMastra(): Mastra {
        return this.mastra;
    }

    public async getSovereignState<T>(agentName: string): Promise<T | null> {
        const memory = await this.getMemory(agentName);
        const data = await memory!.getWorkingMemory({ resourceId: agentName });
        if (!data) return null;
        try {
            return JSON.parse(data) as T;
        } catch (e) {
            return data as any;
        }
    }

    public async setSovereignState(agentName: string, state: any): Promise<void> {
        const memory = await this.getMemory(agentName);
        
        // Validate if schema exists
        if (agentName === "META_SOVEREIGN") {
            META_STATE_SCHEMA.parse(state);
        } else if (COMMANDERS.some(c => c.name === agentName)) {
            COMMANDER_STATE_SCHEMA.parse(state);
        }

        const workingMemory = typeof state === "string" ? state : JSON.stringify(state);
        
        await memory!.updateWorkingMemory({
            resourceId: agentName,
            workingMemory
        });
    }
}
