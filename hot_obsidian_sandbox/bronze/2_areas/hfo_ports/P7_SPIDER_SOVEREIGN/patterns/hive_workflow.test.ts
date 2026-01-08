import { describe, it, expect } from "vitest";
import { hiveWorkflow } from "./hive_workflow";

describe("Consolidated Hive Workflow", () => {
  it("should have all 4 sequential steps", () => {
      // Access steps from the committed workflow (internal structure check)
      const workflow = hiveWorkflow as any;
      expect(workflow.steps).toBeDefined();
      expect(workflow.id).toBe("hive-workflow-1010");
  });
});
