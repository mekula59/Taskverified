import { describe, expect, it } from "vitest";

import { seededClaims, seededPayouts, seededReputationEvents, seededReputationSummaries, seededSubmissions, seededTasks, seededWalletProfiles, seededWorkerProfiles } from "@/features/tasks/data/taskSeeds";
import { connectWalletRecord, releasePayoutRecord, reviewSubmissionRecord } from "@/features/tasks/lib/taskState";

describe("wallet and payout transitions", () => {
  it("creates a ready_to_release payout when approved wallets are connected", () => {
    const next = reviewSubmissionRecord(
      {
        tasks: seededTasks,
        claims: seededClaims,
        submissions: seededSubmissions,
        workerProfiles: seededWorkerProfiles,
        walletProfiles: seededWalletProfiles,
        payouts: seededPayouts,
        reputationEvents: seededReputationEvents,
        reputationSummaries: seededReputationSummaries,
      },
      {
        claimId: "claim-202",
        taskId: "task-103",
        decision: "approved",
      },
    );

    expect(next.payouts.find((payout) => payout.claimId === "claim-202")?.status).toBe("ready_to_release");
  });

  it("connects a wallet and updates payout readiness", () => {
    const next = connectWalletRecord(
      {
        tasks: seededTasks,
        claims: seededClaims,
        submissions: seededSubmissions,
        workerProfiles: seededWorkerProfiles,
        walletProfiles: seededWalletProfiles.filter((wallet) => wallet.userId !== "worker-001"),
        payouts: [
          {
            id: "payout-x",
            taskId: "task-103",
            claimId: "claim-202",
            submissionId: "submission-301",
            workerId: "worker-001",
            posterId: "poster-001",
            amount: 32,
            currencyToken: "USDC",
            status: "pending",
            createdAt: "2026-04-16T15:00:00.000Z",
          },
        ],
        reputationEvents: seededReputationEvents,
        reputationSummaries: seededReputationSummaries,
      },
      {
        userId: "worker-001",
        role: "worker",
        displayName: "Nadia Cole",
      },
    );

    expect(next.walletProfiles.find((wallet) => wallet.userId === "worker-001")?.walletAddress).toContain("So1");
    expect(next.payouts[0]?.status).toBe("ready_to_release");
  });

  it("releases a ready_to_release payout with tx signature placeholder", () => {
    const next = releasePayoutRecord(
      {
        tasks: seededTasks,
        claims: seededClaims,
        submissions: seededSubmissions,
        workerProfiles: seededWorkerProfiles,
        walletProfiles: seededWalletProfiles,
        payouts: [
          {
            id: "payout-release",
            taskId: "task-103",
            claimId: "claim-202",
            submissionId: "submission-301",
            workerId: "worker-001",
            posterId: "poster-001",
            workerWalletAddress: "So1WORKER001WalletReady111111111111",
            posterWalletAddress: "So1POSTER001WalletReady111111111111",
            amount: 32,
            currencyToken: "USDC",
            status: "ready_to_release",
            createdAt: "2026-04-16T15:00:00.000Z",
          },
        ],
        reputationEvents: seededReputationEvents,
        reputationSummaries: seededReputationSummaries,
      },
      "payout-release",
    );

    expect(next.payouts[0]?.status).toBe("released");
    expect(next.payouts[0]?.txSignature).toContain("solana-tx-placeholder");
    expect(next.tasks.find((task) => task.id === "task-103")?.status).toBe("paid");
  });
});
