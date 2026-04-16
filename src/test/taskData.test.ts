import { describe, expect, it } from "vitest";

import { seededClaims, seededPayouts, seededReputationEvents, seededReputationSummaries, seededSubmissions, seededTasks, seededWalletProfiles, seededWorkerProfiles } from "@/features/tasks/data/taskSeeds";
import { getClaimsForWorker, getPayoutForSubmission, getPayoutsForPoster, getPayoutsForWorker, getPosterDashboardMetrics, getPublicTasks, getReputationEventsForWorker, getSubmissionForClaim, getSubmittedSubmissionsForPoster, getWalletProfile, getWorkerDashboardMetrics, getWorkerProfile, getWorkerReputationSummary } from "@/features/tasks/data/sampleData";

describe("task sample data", () => {
  it("returns public tasks for discovery", () => {
    expect(getPublicTasks(seededTasks).length).toBeGreaterThan(0);
  });

  it("computes worker dashboard metrics", () => {
    const metrics = getWorkerDashboardMetrics({
      tasks: seededTasks,
      claims: seededClaims,
      submissions: seededSubmissions,
      payouts: seededPayouts,
      reputationSummaries: seededReputationSummaries,
      workerId: "worker-001",
      verificationStatus: "verified",
    });

    expect(metrics).toHaveLength(5);
    expect(metrics[0]?.value).toBe("verified");
  });

  it("computes poster dashboard metrics", () => {
    const metrics = getPosterDashboardMetrics(seededTasks, seededPayouts, "poster-001");

    expect(metrics).toHaveLength(4);
  });

  it("finds worker claims and linked submissions", () => {
    const claims = getClaimsForWorker(seededClaims, "worker-001");

    expect(claims.length).toBeGreaterThan(0);
    expect(getSubmissionForClaim(seededSubmissions, "claim-202")?.taskId).toBe("task-103");
  });

  it("finds poster review submissions and worker profile details", () => {
    const reviewItems = getSubmittedSubmissionsForPoster({
      tasks: seededTasks,
      claims: seededClaims,
      submissions: seededSubmissions,
      posterId: "poster-001",
    });

    expect(reviewItems.length).toBeGreaterThan(0);
    expect(getWorkerProfile(seededWorkerProfiles, "worker-001")?.fullName).toBe("Nadia Cole");
  });

  it("finds wallet-linked payouts for poster and worker", () => {
    expect(getPayoutsForPoster(seededPayouts, "poster-001").length).toBeGreaterThan(0);
    expect(getPayoutsForWorker(seededPayouts, "worker-001").length).toBeGreaterThan(0);
    expect(getPayoutForSubmission(seededPayouts, "submission-302")?.status).toBe("released");
    expect(getWalletProfile(seededWalletProfiles, "worker-001")?.walletAddress).toContain("So1");
  });

  it("derives worker reputation summary and event feed", () => {
    const summary = getWorkerReputationSummary(seededReputationSummaries, "worker-001");
    const events = getReputationEventsForWorker(seededReputationEvents, "worker-001");

    expect(summary?.verificationStatus).toBe("verified");
    expect(summary?.tasksCompleted).toBeGreaterThan(0);
    expect(summary?.payoutsReleased).toBeGreaterThan(0);
    expect(events.some((event) => event.type === "payout_released")).toBe(true);
  });
});
