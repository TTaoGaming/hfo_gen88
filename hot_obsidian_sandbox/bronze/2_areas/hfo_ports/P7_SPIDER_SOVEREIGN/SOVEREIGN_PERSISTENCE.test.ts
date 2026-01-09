import { describe, it, expect, beforeAll } from "vitest";
import { SovereignTwin } from "./SovereignTwin";
import fs from "node:fs";
import path from "node:path";

describe("Sovereign Persistence (Spider Sovereign/Port 7)", () => {
    const DB_PATH = path.resolve(__dirname, "test_soul.db");
    const RESOURCE_ID = "SOVEREIGN_V10_TWIN";
    const THREAD_ID = "SYNAPTIC_THREAD_001";

    beforeAll(() => {
        if (fs.existsSync(DB_PATH)) {
            try {
                fs.unlinkSync(DB_PATH);
            } catch (e) {
                console.warn("Could not delete existing DB");
            }
        }
    });

    it("should maintain synaptic context across agent re-instantiation", async () => {
        // Lifecycle 1: Initialization and Seeding
        const twinA = new SovereignTwin({
            dbPath: DB_PATH,
            name: "twin",
            instructions: "You are a persistent digital twin.",
            model: { provider: "ANY", name: "MOCK" }
        });

        const memoryA = await twinA.getMemory("twin");
        if (!memoryA) throw new Error("MemoryA not found");

        await memoryA.createThread({ threadId: THREAD_ID, resourceId: RESOURCE_ID });

        const seedMessages = [
            {
                id: "msg-1",
                role: "user" as const,
                content: {
                    parts: [{ type: "text", text: "Birth sequence initiated." }],
                    format: 2
                },
                threadId: THREAD_ID,
                resourceId: RESOURCE_ID,
                createdAt: new Date(),
                type: "text"
            },
            {
                id: "msg-2",
                role: "assistant" as const,
                content: {
                    parts: [{ type: "text", text: "Persistent soul established." }],
                    format: 2
                },
                threadId: THREAD_ID,
                resourceId: RESOURCE_ID,
                createdAt: new Date(),
                type: "text"
            }
        ];

        await memoryA.saveMessages({ messages: seedMessages as any, format: "v2" });

        // Lifecycle 2: Survival Check (New Instance, same DB)
        const twinB = new SovereignTwin({
            dbPath: DB_PATH,
            name: "twin",
            instructions: "You are a persistent digital twin.",
            model: { provider: "ANY", name: "MOCK" }
        });

        const memoryB = await twinB.getMemory("twin");
        if (!memoryB) throw new Error("MemoryB not found");

        const historyWrapB = await memoryB.rememberMessages({ threadId: THREAD_ID, resourceId: RESOURCE_ID });
        const historyB = historyWrapB.messagesV2;
        
        expect(historyB.length).toBe(2);
        
        const firstMsg = historyB.find(m => m.id === "msg-1");
        expect(firstMsg?.content?.parts?.[0]?.text).toContain("Birth sequence");
        
        const secondMsg = historyB.find(m => m.id === "msg-2");
        expect(secondMsg?.content?.parts?.[0]?.text).toContain("Persistent soul");
    });
});
