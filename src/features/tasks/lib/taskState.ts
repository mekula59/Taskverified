import { generateTxSignature } from "@/features/tasks/lib/wallet";
import { withReputation } from "@/features/tasks/lib/reputation";
import type { SubmissionInput, SubmissionReviewInput, Task, TaskClaim, TaskCreateInput, TaskStoreSnapshot, TaskSubmission, WalletConnectInput, WalletDisconnectInput, WalletProfile } from "@/features/shared/types/domain";

export function createTaskRecord(current: TaskStoreSnapshot, input: TaskCreateInput, currentUser: { id: string; name: string }): TaskStoreSnapshot {
  const task: Task = {
    id: `task-${Date.now()}`,
    posterId: currentUser.id,
    posterName: currentUser.name,
    title: input.title,
    description: input.description,
    category: input.category,
    proofRequirements: input.proofRequirements,
    rewardAmount: input.rewardAmount,
    rewardCurrency: input.rewardCurrency,
    deadlineAt: input.deadlineAt,
    status: input.status,
    claimLimit: 1,
    claimCount: 0,
    createdAt: new Date().toISOString(),
  };

  return withReputation({
    ...current,
    tasks: [task, ...current.tasks],
  });
}

export function claimTaskRecord(current: TaskStoreSnapshot, input: { taskId: string; workerId: string; workerName: string }): TaskStoreSnapshot {
  const alreadyClaimed = current.claims.some((claim) => claim.taskId === input.taskId && claim.workerId === input.workerId);
  if (alreadyClaimed) {
    return current;
  }

  const nextTasks = current.tasks.map((task) =>
    task.id === input.taskId
      ? {
          ...task,
          claimCount: task.claimCount + 1,
          status: "claimed" as const,
        }
      : task,
  );

  const nextClaim: TaskClaim = {
    id: `claim-${Date.now()}`,
    taskId: input.taskId,
    workerId: input.workerId,
    workerName: input.workerName,
    status: "active",
    claimedAt: new Date().toISOString(),
  };

  return withReputation({
    ...current,
    tasks: nextTasks,
    claims: [nextClaim, ...current.claims],
  });
}

export function submitProofRecord(current: TaskStoreSnapshot, input: SubmissionInput): TaskStoreSnapshot {
  const now = new Date().toISOString();

  const existingSubmission = current.submissions.find((submission) => submission.claimId === input.claimId);
  const nextSubmission: TaskSubmission = {
    id: existingSubmission?.id ?? `submission-${Date.now()}`,
    claimId: input.claimId,
    taskId: input.taskId,
    workerId: input.workerId,
    proofText: input.proofText,
    proofLink: input.proofLink,
    proofFileName: input.proofFileName,
    checklistItems: input.checklistItems,
    status: "submitted",
    updatedAt: now,
    submittedAt: now,
  };

  return withReputation({
    ...current,
    tasks: current.tasks.map((task) =>
      task.id === input.taskId
        ? {
            ...task,
            status: "submitted",
          }
        : task,
    ),
    claims: current.claims.map((claim) =>
      claim.id === input.claimId
        ? {
            ...claim,
            status: "submitted",
            submittedAt: now,
          }
        : claim,
    ),
    submissions: existingSubmission
      ? current.submissions.map((submission) => (submission.claimId === input.claimId ? nextSubmission : submission))
      : [nextSubmission, ...current.submissions],
  });
}

export function reviewSubmissionRecord(current: TaskStoreSnapshot, input: SubmissionReviewInput): TaskStoreSnapshot {
  const existingSubmission = current.submissions.find((submission) => submission.claimId === input.claimId);
  if (!existingSubmission) {
    return current;
  }

  const now = new Date().toISOString();
  const nextStatus = input.decision;
  const task = current.tasks.find((item) => item.id === input.taskId);
  const existingPayout = current.payouts.find((payout) => payout.claimId === input.claimId);
  const workerWallet = current.walletProfiles.find((wallet) => wallet.userId === existingSubmission.workerId && wallet.role === "worker");
  const posterWallet = task ? current.walletProfiles.find((wallet) => wallet.userId === task.posterId && wallet.role === "poster") : undefined;
  const nextPayoutStatus =
    workerWallet?.status === "connected" && posterWallet?.status === "connected" ? "ready_to_release" : "pending";

  const nextPayouts =
    nextStatus === "approved" && task
      ? [
          {
            id: existingPayout?.id ?? `payout-${Date.now()}`,
            taskId: task.id,
            claimId: input.claimId,
            submissionId: existingSubmission.id,
            workerId: existingSubmission.workerId,
            posterId: task.posterId,
            workerWalletAddress: workerWallet?.walletAddress,
            posterWalletAddress: posterWallet?.walletAddress,
            amount: task.rewardAmount,
            currencyToken: "USDC" as const,
            status: nextPayoutStatus,
            txSignature: existingPayout?.txSignature,
            createdAt: existingPayout?.createdAt ?? now,
            releasedAt: existingPayout?.releasedAt,
          },
          ...current.payouts.filter((payout) => payout.claimId !== input.claimId),
        ]
      : current.payouts.filter((payout) => payout.claimId !== input.claimId);

  return withReputation({
    ...current,
    tasks: current.tasks.map((task) =>
      task.id === input.taskId
        ? {
            ...task,
            status: nextStatus,
          }
        : task,
    ),
    claims: current.claims.map((claim) =>
      claim.id === input.claimId
        ? {
            ...claim,
            status: nextStatus,
          }
        : claim,
    ),
    submissions: current.submissions.map((submission) =>
      submission.claimId === input.claimId
        ? {
            ...submission,
            status: nextStatus,
            reviewerNotes: input.reviewerNotes?.trim() || undefined,
            reviewedAt: now,
            updatedAt: now,
          }
        : submission,
    ),
    payouts: nextPayouts,
  });
}

export function connectWalletRecord(current: TaskStoreSnapshot, input: WalletConnectInput): TaskStoreSnapshot {
  const now = new Date().toISOString();
  const nextWallet: WalletProfile = {
    userId: input.userId,
    role: input.role,
    displayName: input.displayName,
    chain: "solana",
    cluster: input.cluster,
    status: "connected",
    provider: input.provider,
    walletAddress: input.walletAddress,
    updatedAt: now,
  };

  const walletProfiles = current.walletProfiles.some((wallet) => wallet.userId === input.userId && wallet.role === input.role)
    ? current.walletProfiles.map((wallet) =>
        wallet.userId === input.userId && wallet.role === input.role ? nextWallet : wallet,
      )
    : [nextWallet, ...current.walletProfiles];

  const workerProfiles =
    input.role === "worker"
      ? current.workerProfiles.map((profile) =>
          profile.userId === input.userId ? { ...profile, walletAddress: nextWallet.walletAddress } : profile,
        )
      : current.workerProfiles;

  const payouts = current.payouts.map((payout) => {
    const nextWorkerWallet =
      (payout.workerId === input.userId && input.role === "worker"
        ? nextWallet.walletAddress
        : walletProfiles.find((wallet) => wallet.userId === payout.workerId && wallet.role === "worker")?.walletAddress) ??
      payout.workerWalletAddress;
    const nextPosterWallet =
      (payout.posterId === input.userId && input.role === "poster"
        ? nextWallet.walletAddress
        : walletProfiles.find((wallet) => wallet.userId === payout.posterId && wallet.role === "poster")?.walletAddress) ??
      payout.posterWalletAddress;
    const nextStatus =
      payout.status === "released"
        ? payout.status
        : nextWorkerWallet && nextPosterWallet
          ? "ready_to_release"
          : "pending";

    return {
      ...payout,
      workerWalletAddress: nextWorkerWallet,
      posterWalletAddress: nextPosterWallet,
      status: nextStatus,
    };
  });

  return withReputation({
    ...current,
    walletProfiles,
    workerProfiles,
    payouts,
  });
}

export function disconnectWalletRecord(current: TaskStoreSnapshot, input: WalletDisconnectInput): TaskStoreSnapshot {
  const nextWalletProfiles = current.walletProfiles.map((wallet) =>
    wallet.userId === input.userId && wallet.role === input.role
      ? {
          ...wallet,
          status: "disconnected" as const,
          walletAddress: undefined,
          updatedAt: new Date().toISOString(),
        }
      : wallet,
  );

  const nextWorkerProfiles =
    input.role === "worker"
      ? current.workerProfiles.map((profile) =>
          profile.userId === input.userId ? { ...profile, walletAddress: undefined } : profile,
        )
      : current.workerProfiles;

  const nextPayouts = current.payouts.map((payout) => {
    const workerWallet =
      nextWalletProfiles.find((wallet) => wallet.userId === payout.workerId && wallet.role === "worker" && wallet.status === "connected")
        ?.walletAddress ?? undefined;
    const posterWallet =
      nextWalletProfiles.find((wallet) => wallet.userId === payout.posterId && wallet.role === "poster" && wallet.status === "connected")
        ?.walletAddress ?? undefined;

    return {
      ...payout,
      workerWalletAddress: workerWallet,
      posterWalletAddress: posterWallet,
      status:
        payout.status === "released"
          ? payout.status
          : workerWallet && posterWallet
            ? "ready_to_release"
            : "pending",
    };
  });

  return withReputation({
    ...current,
    walletProfiles: nextWalletProfiles,
    workerProfiles: nextWorkerProfiles,
    payouts: nextPayouts,
  });
}

export function releasePayoutRecord(current: TaskStoreSnapshot, payoutId: string): TaskStoreSnapshot {
  const payout = current.payouts.find((item) => item.id === payoutId);
  const posterWallet = payout
    ? current.walletProfiles.find((wallet) => wallet.userId === payout.posterId && wallet.role === "poster" && wallet.status === "connected")
    : undefined;

  if (!payout || payout.status !== "ready_to_release" || !posterWallet?.walletAddress) {
    return current;
  }

  const now = new Date().toISOString();

  return withReputation({
    ...current,
    tasks: current.tasks.map((task) =>
      task.id === payout.taskId
        ? {
            ...task,
            status: "paid",
          }
        : task,
    ),
    payouts: current.payouts.map((item) =>
      item.id === payoutId
        ? {
            ...item,
            status: "released",
            txSignature: generateTxSignature(payoutId),
            releasedAt: now,
          }
        : item,
    ),
  });
}
