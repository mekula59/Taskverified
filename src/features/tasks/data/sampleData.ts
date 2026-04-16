import type { Task, TaskClaim, TaskSubmission, DashboardMetric, VerificationStatus } from "@/features/shared/types/domain";

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

export function getWorkerDashboardMetrics(input: {
  tasks: Task[];
  claims: TaskClaim[];
  submissions: TaskSubmission[];
  workerId: string;
  verificationStatus: VerificationStatus;
}): DashboardMetric[] {
  const workerClaims = getClaimsForWorker(input.claims, input.workerId);
  const workerSubmissions = getSubmissionsForWorker(input.submissions, input.workerId);
  const approvedClaims = workerClaims.filter((claim) => claim.status === "approved").length;
  const submittedClaims = workerClaims.filter((claim) => claim.status === "submitted").length;
  const activeClaims = workerClaims.filter((claim) => claim.status === "active").length;
  const earnings = workerClaims
    .filter((claim) => claim.status === "approved")
    .map((claim) => input.tasks.find((task) => task.id === claim.taskId))
    .filter((task): task is Task => Boolean(task))
    .reduce((sum, task) => sum + task.rewardAmount, 0);

  return [
    {
      label: "Verification",
      value: input.verificationStatus,
      detail: input.verificationStatus === "verified" ? "Claims unlocked for live work." : "Claiming stays trust-gated.",
    },
    {
      label: "Active claims",
      value: String(activeClaims),
      detail: "Keep work disciplined and within queue limits.",
    },
    {
      label: "Proof queue",
      value: String(workerSubmissions.length),
      detail: `${submittedClaims} submissions awaiting review.`,
    },
    {
      label: "Paid-ready",
      value: formatMoney(earnings, "USD"),
      detail: `${approvedClaims} approved completions.`,
    },
  ];
}

export function getPosterDashboardMetrics(tasks: Task[], posterId: string): DashboardMetric[] {
  const posterTasks = getTasksForPoster(tasks, posterId);
  const openTasks = posterTasks.filter((task) => task.status === "open" || task.status === "claimed").length;
  const reviewQueue = posterTasks.filter((task) => task.status === "submitted").length;
  const paidTasks = posterTasks.filter((task) => task.status === "paid" || task.status === "reviewed").length;
  const rewardReserved = posterTasks.reduce((sum, task) => sum + task.rewardAmount, 0);
  const draftTasks = posterTasks.filter((task) => task.status === "draft").length;

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
      label: "Reward exposure",
      value: formatMoney(rewardReserved, "USD"),
      detail: "Current reward pool across sample tasks.",
    },
    {
      label: "Draft or reviewed",
      value: String(draftTasks + paidTasks),
      detail: `${draftTasks} drafts and ${paidTasks} reviewed tasks.`,
    },
  ];
}
