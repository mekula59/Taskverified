import { seededClaims } from "@/features/tasks/data/taskSeeds";
import type { Task, TaskClaim, DashboardMetric, VerificationStatus } from "@/features/shared/types/domain";

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

export function getClaimsForWorker(workerId: string) {
  return seededClaims.filter((claim) => claim.workerId === workerId);
}

export function getWorkerDashboardMetrics(input: {
  tasks: Task[];
  workerId: string;
  verificationStatus: VerificationStatus;
}): DashboardMetric[] {
  const claims = getClaimsForWorker(input.workerId);
  const approvedClaims = claims.filter((claim) => claim.status === "approved").length;
  const submittedClaims = claims.filter((claim) => claim.status === "submitted").length;
  const activeClaims = claims.filter((claim) => claim.status === "active").length;
  const earnings = claims
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
      label: "Submitted proof",
      value: String(submittedClaims),
      detail: "Awaiting poster review.",
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
