import { describe, expect, it } from "vitest";

import { seededTasks } from "@/features/tasks/data/taskSeeds";
import { getPosterDashboardMetrics, getPublicTasks, getWorkerDashboardMetrics } from "@/features/tasks/data/sampleData";

describe("task sample data", () => {
  it("returns public tasks for discovery", () => {
    expect(getPublicTasks(seededTasks).length).toBeGreaterThan(0);
  });

  it("computes worker dashboard metrics", () => {
    const metrics = getWorkerDashboardMetrics({
      tasks: seededTasks,
      workerId: "worker-001",
      verificationStatus: "verified",
    });

    expect(metrics).toHaveLength(4);
    expect(metrics[0]?.value).toBe("verified");
  });

  it("computes poster dashboard metrics", () => {
    const metrics = getPosterDashboardMetrics(seededTasks, "poster-001");

    expect(metrics).toHaveLength(4);
  });
});
