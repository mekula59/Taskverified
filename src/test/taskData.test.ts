import { describe, expect, it } from "vitest";

import { getPosterDashboardMetrics, getPublicTasks, getWorkerDashboardMetrics } from "@/features/tasks/data/sampleData";

describe("task sample data", () => {
  it("returns public tasks for discovery", () => {
    expect(getPublicTasks().length).toBeGreaterThan(0);
  });

  it("computes worker dashboard metrics", () => {
    const metrics = getWorkerDashboardMetrics({
      workerId: "worker-001",
      verificationStatus: "verified",
    });

    expect(metrics).toHaveLength(4);
    expect(metrics[0]?.value).toBe("verified");
  });

  it("computes poster dashboard metrics", () => {
    const metrics = getPosterDashboardMetrics("poster-001");

    expect(metrics).toHaveLength(4);
  });
});
