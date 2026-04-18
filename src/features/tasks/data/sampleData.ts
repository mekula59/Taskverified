import type {
  DashboardMetric,
  PayoutRecord,
  ReputationEvent,
  Task,
  TaskCategory,
  TaskClaim,
  TaskSubmission,
  VerificationStatus,
  WalletProfile,
  WorkerProfileSummary,
  WorkerReputationSummary,
} from "@/features/shared/types/domain";
import { getSubmissionTrustStatus } from "@/features/tasks/lib/reputation";

export function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getPublicTasks(tasks: Task[]) {
  return tasks.filter((task) => task.status === "open" || task.status === "claimed" || task.status === "submitted");
}

export function getTasksForPoster(tasks: Task[], posterId: string) {
  return tasks.filter((task) => task.posterId === posterId);
}

export function getClaimsForWorker(claims: TaskClaim[], workerId: string) {
  return claims.filter((claim) => claim.workerId === workerId);
}

export function getSubmissionsForWorker(submissions: TaskSubmission[], workerId: string) {
  return submissions.filter((submission) => submission.workerId === workerId);
}

export function getClaimForTask(claims: TaskClaim[], taskId: string, workerId: string) {
  return claims.find((claim) => claim.taskId === taskId && claim.workerId === workerId);
}

export function getSubmissionForClaim(submissions: TaskSubmission[], claimId: string) {
  return submissions.find((submission) => submission.claimId === claimId);
}

export function getWorkerProfile(workerProfiles: WorkerProfileSummary[], workerId: string) {
  return workerProfiles.find((profile) => profile.userId === workerId);
}

export function getWorkerReputationSummary(reputationSummaries: WorkerReputationSummary[], workerId: string) {
  return reputationSummaries.find((summary) => summary.workerId === workerId);
}

export function getReputationEventsForWorker(reputationEvents: ReputationEvent[], workerId: string) {
  return reputationEvents.filter((event) => event.workerId === workerId);
}

export function getTrustScoreTone(score: number) {
  if (score >= 80) {
    return "High";
  }

  if (score >= 55) {
    return "Stable";
  }

  return "Building";
}

export function formatCategoryLabel(category: TaskCategory) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export { getSubmissionTrustStatus };

export function getWalletProfile(walletProfiles: WalletProfile[], userId: string) {
  return walletProfiles.find((profile) => profile.userId === userId);
}

export function getPayoutForSubmission(payouts: PayoutRecord[], submissionId: string) {
  return payouts.find((payout) => payout.submissionId === submissionId);
}

export function getPayoutsForPoster(payouts: PayoutRecord[], posterId: string) {
  return payouts.filter((payout) => payout.posterId === posterId);
}

export function getPayoutsForWorker(payouts: PayoutRecord[], workerId: string) {
  return payouts.filter((payout) => payout.workerId === workerId);
}

export function getSubmittedSubmissionsForPoster(input: {
  tasks: Task[];
  claims: TaskClaim[];
  submissions: TaskSubmission[];
  posterId: string;
}) {
  const posterTaskIds = new Set(getTasksForPoster(input.tasks, input.posterId).map((task) => task.id));

  return input.submissions.filter(
    (submission) => posterTaskIds.has(submission.taskId) && (submission.status === "submitted" || submission.status === "approved" || submission.status === "rejected"),
  );
}

export function getWorkerDashboardMetrics(input: {
  tasks: Task[];
  claims: TaskClaim[];
  submissions: TaskSubmission[];
  payouts: PayoutRecord[];
  reputationSummaries: WorkerReputationSummary[];
  workerId: string;
  verificationStatus: VerificationStatus;
}): DashboardMetric[] {
  const workerClaims = getClaimsForWorker(input.claims, input.workerId);
  const workerSubmissions = getSubmissionsForWorker(input.submissions, input.workerId);
  const approvedClaims = workerClaims.filter((claim) => claim.status === "approved").length;
  const rejectedClaims = workerClaims.filter((claim) => claim.status === "rejected").length;
  const submittedClaims = workerClaims.filter((claim) => claim.status === "submitted").length;
  const activeClaims = workerClaims.filter((claim) => claim.status === "active").length;
  const workerPayouts = getPayoutsForWorker(input.payouts, input.workerId);
  const solanaAmount = workerPayouts
    .filter((payout) => payout.status === "ready_to_release" || payout.status === "released")
    .reduce((sum, payout) => sum + payout.amount, 0);
  const reputation = getWorkerReputationSummary(input.reputationSummaries, input.workerId);
  const trustScore = reputation?.trustScore ?? 0;
  const approvalRate = reputation?.approvalRate ?? 0;
  const payoutsReleased = reputation?.payoutsReleased ?? 0;

  return [
    {
      label: "Verification",
      value: input.verificationStatus,
      detail: input.verificationStatus === "verified" ? "Claims unlocked for live work." : "Claiming stays trust-gated.",
    },
    {
      label: "Active claims",
      value: String(activeClaims),
      detail: "Keep work disciplined and focused on one live claim at a time.",
    },
    {
      label: "Proof queue",
      value: String(workerSubmissions.length),
      detail: `${submittedClaims} awaiting review, ${rejectedClaims} rejected.`,
    },
    {
      label: "Trust score",
      value: String(trustScore),
      detail: `${approvalRate}% approval rate with ${payoutsReleased} released Solana payouts.`,
    },
    {
      label: "Solana payouts",
      value: `${solanaAmount} USDC`,
      detail: `${approvedClaims} approved completions with ${workerPayouts.length} payout records.`,
    },
  ];
}

export function getPosterDashboardMetrics(tasks: Task[], payouts: PayoutRecord[], posterId: string): DashboardMetric[] {
  const posterTasks = getTasksForPoster(tasks, posterId);
  const posterPayouts = getPayoutsForPoster(payouts, posterId);
  const openTasks = posterTasks.filter((task) => task.status === "open" || task.status === "claimed").length;
  const reviewQueue = posterTasks.filter((task) => task.status === "submitted").length;
  const approvedTasks = posterTasks.filter((task) => task.status === "approved").length;
  const rejectedTasks = posterTasks.filter((task) => task.status === "rejected").length;
  const rewardReserved = posterPayouts.reduce((sum, payout) => sum + payout.amount, 0);
  const draftTasks = posterTasks.filter((task) => task.status === "draft").length;
  const readyToRelease = posterPayouts.filter((payout) => payout.status === "ready_to_release").length;

  return [
    {
      label: "Live tasks",
      value: String(openTasks),
      detail: "Open or currently claimed.",
    },
    {
      label: "Review queue",
      value: String(reviewQueue),
      detail: "Proof waiting for a decision.",
    },
    {
      label: "Solana release queue",
      value: `${rewardReserved} USDC`,
      detail: `${readyToRelease} payouts ready to release.`,
    },
    {
      label: "Draft and decisions",
      value: String(draftTasks + approvedTasks + rejectedTasks),
      detail: `${draftTasks} drafts, ${approvedTasks} approved, ${rejectedTasks} rejected.`,
    },
  ];
}
