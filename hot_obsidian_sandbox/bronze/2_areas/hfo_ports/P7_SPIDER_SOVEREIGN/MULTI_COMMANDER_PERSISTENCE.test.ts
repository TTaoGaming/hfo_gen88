import { describe, it, expect, beforeAll } from "vitest";
import { SovereignTwin, COMMANDERS } from "./SovereignTwin";
import fs from "node:fs";
import path from "node:path";

describe("Multi-Commander Persistence (Sovereign Legion)", () => {
    const DB_PATH = path.resolve(__dirname, "legion_soul.db");
    
    beforeAll(() => {
        if (fs.existsSync(DB_PATH)) {
            try {
                fs.unlinkSync(DB_PATH);
            } catch (e) {
                console.warn("Could not delete existing DB");
            }
        }
    });

    it("should maintain isolated persistent states for multiple commanders", async () => {
        const twin = new SovereignTwin({
            dbPath: DB_PATH,
            model: { provider: "ANY", name: "MOCK" }
        });

        // 1. Seed Meta State
        const metaMemory = await twin.getMemory("META_SOVEREIGN");
        const META_THREAD = "META_THREAD_001";
        const META_RESOURCE = "META_SOVEREIGN";
        await metaMemory!.createThread({ threadId: META_THREAD, resourceId: META_RESOURCE });
        await metaMemory!.saveMessages({
            messages: [{
                id: "meta-msg-1",
                role: "user",
                content: { parts: [{ type: "text", text: "Global system status: STABLE." }], format: 2 },
                threadId: META_THREAD,
                resourceId: META_RESOURCE,
                createdAt: new Date()
            }] as any,
            format: "v2"
        });

        // 2. Seed Commander State (Red Regnant - Port 4)
        const redCommander = COMMANDERS.find(c => c.port === 4)!;
        const redMemory = await twin.getMemory(redCommander.name);
        const RED_THREAD = "RED_THREAD_001";
        const RED_RESOURCE = redCommander.name;
        await redMemory!.createThread({ threadId: RED_THREAD, resourceId: RED_RESOURCE });
        await redMemory!.saveMessages({
            messages: [{
                id: "red-msg-1",
                role: "user",
                content: { parts: [{ type: "text", text: "Disruption detected in Sector 7." }], format: 2 },
                threadId: RED_THREAD,
                resourceId: RED_RESOURCE,
                createdAt: new Date()
            }] as any,
            format: "v2"
        });

        // 3. Re-instantiate and Verify Isolation
        const twinReloaded = new SovereignTwin({
            dbPath: DB_PATH,
            model: { provider: "ANY", name: "MOCK" }
        });

        const metaMemoryReloaded = await twinReloaded.getMemory("META_SOVEREIGN");
        const redMemoryReloaded = await twinReloaded.getMemory(redCommander.name);

        const metaHist = await metaMemoryReloaded!.rememberMessages({ threadId: META_THREAD, resourceId: META_RESOURCE });
        const redHist = await redMemoryReloaded!.rememberMessages({ threadId: RED_THREAD, resourceId: RED_RESOURCE });

        expect(metaHist.messagesV2[0].content.parts[0].text).toContain("Global system status");
        expect(redHist.messagesV2[0].content.parts[0].text).toContain("Disruption detected");

        // Verify that isolation is enforced via resourceId mismatch error
        await expect(redMemoryReloaded!.rememberMessages({ 
            threadId: META_THREAD, 
            resourceId: RED_RESOURCE 
        })).rejects.toThrow(/is for resource with id META_SOVEREIGN/);
        
        // Final Verification: All 8 commanders are present in the registry
        for (const cmd of COMMANDERS) {
            const agent = twinReloaded.getAgent(cmd.name);
            expect(agent).toBeDefined();
        }
    });
});
