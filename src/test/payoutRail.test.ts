import { describe, expect, it } from "vitest";

import type { PayoutRecord } from "@/features/shared/types/domain";
import { formatPosterReleaseRecord, getPayoutReleaseCopy, getPosterReleaseRecord } from "@/features/tasks/lib/payoutRail";

function payout(overrides: Partial<PayoutRecord>): PayoutRecord {
  return {
    id: "payout-test",
    taskId: "task-test",
    claimId: "claim-test",
    submissionId: "submission-test",
    workerId: "worker-test",
    posterId: "poster-test",
    amount: 25,
    currencyToken: "SOL",
    status: "ready_to_release",
    createdAt: "2026-05-01T12:00:00.000Z",
    ...overrides,
  };
}

describe("payout rail helpers", () => {
  it("formats empty poster release history without inventing data", () => {
    const record = getPosterReleaseRecord([], "poster-test");

    expect(record.approvedPayouts).toBe(0);
    expect(formatPosterReleaseRecord(record)).toBe("Poster release record: not enough history yet");
  });

  it("derives poster release record from existing payout records", () => {
    const record = getPosterReleaseRecord(
      [
        payout({ id: "released", status: "released" }),
        payout({ id: "awaiting", status: "ready_to_release" }),
        payout({ id: "pending", status: "pending" }),
        payout({
          id: "recoverable",
          status: "failed",
          workerWalletAddress: "worker-wallet",
          posterWalletAddress: "poster-wallet",
        }),
        payout({ id: "finalization", status: "failed", txSignature: "devnet-signature" }),
        payout({ id: "other-poster", posterId: "poster-other", status: "released" }),
      ],
      "poster-test",
    );

    expect(record).toMatchObject({
      approvedPayouts: 5,
      releasedPayouts: 1,
      awaitingRelease: 1,
      pendingWalletSetup: 1,
      failedRecoverable: 1,
      failedFinalization: 1,
    });
    expect(formatPosterReleaseRecord(record)).toBe("Poster release record: 1 of 5 approved payouts released");
  });

  it("uses SOL-specific copy for approved unreleased payouts", () => {
    expect(getPayoutReleaseCopy(payout({ status: "ready_to_release" }))).toMatchObject({
      label: "Approved, awaiting SOL release",
      detail: "The poster is expected to release after approval.",
      needsDisputeNote: true,
    });
  });
});
