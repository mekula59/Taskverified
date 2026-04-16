import { describe, expect, it } from "vitest";

import { seededClaims, seededPayouts, seededSubmissions, seededTasks, seededWalletProfiles, seededWorkerProfiles } from "@/features/tasks/data/taskSeeds";
import { claimTaskRecord, reviewSubmissionRecord, submitProofRecord } from "@/features/tasks/lib/taskState";

describe("task state transitions", () => {
  it("claims an open task", () => {
    const next = claimTaskRecord(
      {
        tasks: seededTasks,
        claims: seededClaims,
        submissions: seededSubmissions,
        workerProfiles: seededWorkerProfiles,
        walletProfiles: seededWalletProfiles,
        payouts: seededPayouts,
      },
      {
        taskId: "task-101",
        workerId: "worker-001",
        workerName: "Nadia Cole",
      },
    );

    expect(next.claims[0]?.taskId).toBe("task-101");
    expect(next.tasks.find((task) => task.id === "task-101")?.status).toBe("claimed");
  });

  it("submits proof and updates task plus claim state", () => {
    const claimed = claimTaskRecord(
      {
        tasks: seededTasks,
        claims: seededClaims,
        submissions: seededSubmissions,
        workerProfiles: seededWorkerProfiles,
        walletProfiles: seededWalletProfiles,
        payouts: seededPayouts,
      },
      {
        taskId: "task-101",
        workerId: "worker-001",
        workerName: "Nadia Cole",
      },
    );

    const nextClaim = claimed.claims[0];

    const submitted = submitProofRecord(claimed, {
      claimId: nextClaim.id,
      taskId: "task-101",
      workerId: "worker-001",
      proofText: "Completed the onboarding flow and collected each screenshot.",
      proofLink: "https://example.com/task-101-proof",
      proofFileName: "task-101-evidence.zip",
      checklistItems: [{ label: "5 screenshots", completed: true }],
    });

    expect(submitted.tasks.find((task) => task.id === "task-101")?.status).toBe("submitted");
    expect(submitted.claims.find((claim) => claim.id === nextClaim.id)?.status).toBe("submitted");
    expect(submitted.submissions[0]?.taskId).toBe("task-101");
  });

  it("reviews a submitted proof and stores reviewer notes", () => {
    const next = reviewSubmissionRecord(
      {
        tasks: seededTasks,
        claims: seededClaims,
        submissions: seededSubmissions,
        workerProfiles: seededWorkerProfiles,
        walletProfiles: seededWalletProfiles,
        payouts: seededPayouts,
      },
      {
        claimId: "claim-202",
        taskId: "task-103",
        decision: "rejected",
        reviewerNotes: "Price table is incomplete for one location.",
      },
    );

    expect(next.tasks.find((task) => task.id === "task-103")?.status).toBe("rejected");
    expect(next.claims.find((claim) => claim.id === "claim-202")?.status).toBe("rejected");
    expect(next.submissions.find((submission) => submission.claimId === "claim-202")?.reviewerNotes).toContain("Price table");
  });
});
