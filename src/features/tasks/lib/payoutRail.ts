import type { PayoutRecord } from "@/features/shared/types/domain";

export const payoutRailCopy = {
  payoutAsset: "Payout asset: SOL",
  network: "Network: Solana devnet",
  releaseModel: "Release model: poster-released after approved proof",
  createTaskRail: "Payout rail: SOL on Solana devnet",
  flow: "Solana-backed release flow",
  escrow: "Escrow: planned for next release model",
  workerProtection: "Worker protection today: visible proof, review, wallet, and payout-release trail",
  workerClaimRelease: "Release: poster-released SOL after approval",
  workerClaimRisk: "Review the poster release record before claiming.",
  approvedAwaitingRelease: "Approved, awaiting SOL release",
  releaseObligation: "Approved proof creates a release obligation.",
} as const;

export interface PosterReleaseRecord {
  approvedPayouts: number;
  releasedPayouts: number;
  awaitingRelease: number;
  pendingWalletSetup: number;
  failedRecoverable: number;
  failedFinalization: number;
  failedBlocked: number;
}

function hasBothPayoutWallets(payout: PayoutRecord) {
  return Boolean(payout.workerWalletAddress && payout.posterWalletAddress);
}

export function getPosterReleaseRecord(payouts: PayoutRecord[], posterId: string): PosterReleaseRecord {
  const posterPayouts = payouts.filter((payout) => payout.posterId === posterId);

  return {
    approvedPayouts: posterPayouts.length,
    releasedPayouts: posterPayouts.filter((payout) => payout.status === "released").length,
    awaitingRelease: posterPayouts.filter((payout) => payout.status === "ready_to_release").length,
    pendingWalletSetup: posterPayouts.filter((payout) => payout.status === "pending").length,
    failedRecoverable: posterPayouts.filter((payout) => payout.status === "failed" && hasBothPayoutWallets(payout) && !payout.txSignature).length,
    failedFinalization: posterPayouts.filter((payout) => payout.status === "failed" && Boolean(payout.txSignature)).length,
    failedBlocked: posterPayouts.filter((payout) => payout.status === "failed" && !hasBothPayoutWallets(payout) && !payout.txSignature).length,
  };
}

export function formatPosterReleaseRecord(record: PosterReleaseRecord) {
  if (record.approvedPayouts === 0) {
    return "Poster release record: not enough history yet";
  }

  return `Poster release record: ${record.releasedPayouts} of ${record.approvedPayouts} approved payouts released`;
}

export function getPayoutReleaseCopy(payout: PayoutRecord) {
  if (payout.status === "ready_to_release") {
    return {
      label: payoutRailCopy.approvedAwaitingRelease,
      detail: "The poster is expected to release after approval.",
      needsDisputeNote: true,
    };
  }

  if (payout.status === "released") {
    return {
      label: "Released",
      detail: payout.txSignature
        ? "Released through the Solana-backed devnet SOL release flow with a recorded transaction signature."
        : "Released through the Solana-backed devnet SOL release flow.",
      needsDisputeNote: false,
    };
  }

  if (payout.status === "failed") {
    return {
      label: payout.txSignature ? "Failed, finalization recovery needed" : "Failed, recoverable",
      detail: payout.txSignature
        ? "A transaction signature exists, but TaskVerified still needs release finalization."
        : "SOL release failed before a final transaction signature was recorded.",
      needsDisputeNote: false,
    };
  }

  return {
    label: "Approved, wallet setup pending",
    detail: "SOL release cannot open until both payout wallets are present.",
    needsDisputeNote: true,
  };
}
