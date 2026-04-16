import { describe, expect, it } from "vitest";

import { seededClaims, seededSubmissions, seededTasks } from "@/features/tasks/data/taskSeeds";
import { getClaimsForWorker, getPosterDashboardMetrics, getPublicTasks, getSubmissionForClaim, getWorkerDashboardMetrics } from "@/features/tasks/data/sampleData";

describe("task sample data", () => {
  it("returns public tasks for discovery", () => {
    expect(getPublicTasks(seededTasks).length).toBeGreaterThan(0);
  });

  it("computes worker dashboard metrics", () => {
    const metrics = getWorkerDashboardMetrics({
      tasks: seededTasks,
      claims: seededClaims,
      submissions: seededSubmissions,
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

  it("finds worker claims and linked submissions", () => {
    const claims = getClaimsForWorker(seededClaims, "worker-001");

    expect(claims.length).toBeGreaterThan(0);
    expect(getSubmissionForClaim(seededSubmissions, "claim-202")?.taskId).toBe("task-103");
  });
});
