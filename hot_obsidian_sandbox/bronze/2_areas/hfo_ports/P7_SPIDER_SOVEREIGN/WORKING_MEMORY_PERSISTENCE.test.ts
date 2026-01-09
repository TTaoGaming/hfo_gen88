import { describe, it, expect, beforeAll } from "vitest";
import { SovereignTwin } from "./SovereignTwin";
import fs from "node:fs";
import path from "node:path";

describe("Sovereign Working Memory (Persistent HFO State)", () => {
    const DB_PATH = path.resolve(__dirname, "state_soul.db");
    const META_AGENT = "META_SOVEREIGN";
    
    beforeAll(() => {
        if (fs.existsSync(DB_PATH)) {
            try {
                fs.unlinkSync(DB_PATH);
            } catch (e) {
                console.warn("Could not delete existing DB");
            }
        }
    });

    it("should remember global system state across re-instantiation", async () => {
        const twinA = new SovereignTwin({
            dbPath: DB_PATH,
            model: { provider: "ANY", name: "MOCK" }
        });

        // 1. Initial State Check (should be null or defaults)
        const initialState = await twinA.getSovereignState(META_AGENT);
        
        const newState = {
            active_disruptions: 1337,
            system_health: 92,
            commander_status: { "Red Regnant": "KINETIC" as const },
            last_pulse_ts: new Date().toISOString()
        };

        await twinA.setSovereignState(META_AGENT, newState);

        // 2. Verification in the same session
        const verifiedStateA = await twinA.getSovereignState<any>(META_AGENT);
        expect(verifiedStateA.active_disruptions).toBe(1337);

        // 3. Re-instantiation survival test
        const twinB = new SovereignTwin({
            dbPath: DB_PATH,
            model: { provider: "ANY", name: "MOCK" }
        });

        const verifiedStateB = await twinB.getSovereignState<any>(META_AGENT);

        expect(verifiedStateB.active_disruptions).toBe(1337);
        expect(verifiedStateB.commander_status["Red Regnant"]).toBe("KINETIC");
        expect(verifiedStateB.system_health).toBe(92);

        // 4. Commander specific state verification
        const redCommander = "Red Regnant";
        const redState = {
            entropy_level: 42,
            task_queue: ["DISRUPT_PORT_4"],
            local_integrity: 88,
            custom_context: { target: "Obsidian Sandbox" }
        };

        await twinB.setSovereignState(redCommander, redState);
        
        const twinC = new SovereignTwin({
            dbPath: DB_PATH,
            model: { provider: "ANY", name: "MOCK" }
        });

        const verifiedRedState = await twinC.getSovereignState<any>(redCommander);
        expect(verifiedRedState.entropy_level).toBe(42);
        expect(verifiedRedState.task_queue).toContain("DISRUPT_PORT_4");
    });
});
