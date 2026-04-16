import type { Task, TaskClaim, DashboardMetric, UserRole, VerificationStatus } from "@/features/shared/types/domain";

export const sampleTasks: Task[] = [
  {
    id: "task-101",
    posterId: "poster-001",
    posterName: "TaskVerified Labs",
    title: "Test onboarding flow and attach screenshots",
    description: "Create a new account, complete onboarding, and capture each step with notes on broken states or confusing copy.",
    rewardAmount: 24,
    rewardCurrency: "USD",
    proofRequirements: ["5 screenshots", "Structured notes", "Device and browser info"],
    claimLimit: 5,
    claimCount: 3,
    deadlineAt: "2026-04-21T18:00:00.000Z",
    status: "open",
    category: "testing",
  },
  {
    id: "task-102",
    posterId: "poster-001",
    posterName: "TaskVerified Labs",
    title: "Verify community event attendance and share proof",
    description: "Attend the scheduled online event, record the session code, and submit a timestamped summary of the discussion.",
    rewardAmount: 16,
    rewardCurrency: "USD",
    proofRequirements: ["Attendance code", "Timestamped summary", "Screenshot of join screen"],
    claimLimit: 4,
    claimCount: 1,
    deadlineAt: "2026-04-19T20:00:00.000Z",
    status: "claimed",
    category: "community",
  },
  {
    id: "task-103",
    posterId: "poster-001",
    posterName: "TaskVerified Labs",
    title: "Collect local pricing data with menu photos",
    description: "Visit three locations, photograph menu boards, and submit a structured list of price points.",
    rewardAmount: 32,
    rewardCurrency: "USD",
    proofRequirements: ["Per-location menu photo", "Location name", "Price table"],
    claimLimit: 3,
    claimCount: 2,
    deadlineAt: "2026-04-23T17:00:00.000Z",
    status: "submitted",
    category: "research",
  },
  {
    id: "task-104",
    posterId: "poster-001",
    posterName: "TaskVerified Labs",
    title: "Clip two launch event highlights",
    description: "Pull two short clips from the event recording and submit the timestamps with one sentence per highlight.",
    rewardAmount: 20,
    rewardCurrency: "USD",
    proofRequirements: ["2 short clips", "Timestamps", "One-sentence rationale"],
    claimLimit: 2,
    claimCount: 1,
    deadlineAt: "2026-04-24T12:00:00.000Z",
    status: "reviewed",
    category: "content",
  },
];

export const sampleClaims: TaskClaim[] = [
  {
    id: "claim-201",
    taskId: "task-102",
    workerId: "worker-001",
    workerName: "Nadia Cole",
    status: "active",
  },
  {
    id: "claim-202",
    taskId: "task-103",
    workerId: "worker-001",
    workerName: "Nadia Cole",
    status: "submitted",
    submittedAt: "2026-04-16T15:00:00.000Z",
  },
  {
    id: "claim-203",
    taskId: "task-104",
    workerId: "worker-001",
    workerName: "Nadia Cole",
    status: "approved",
    submittedAt: "2026-04-14T15:00:00.000Z",
  },
];

export function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getPublicTasks() {
  return sampleTasks.filter((task) => task.status === "open" || task.status === "claimed" || task.status === "submitted");
}

export function getTasksForPoster(posterId: string) {
  return sampleTasks.filter((task) => task.posterId === posterId);
}

export function getClaimsForWorker(workerId: string) {
  return sampleClaims.filter((claim) => claim.workerId === workerId);
}

export function getWorkerDashboardMetrics(input: {
  workerId: string;
  verificationStatus: VerificationStatus;
}): DashboardMetric[] {
  const claims = getClaimsForWorker(input.workerId);
  const approvedClaims = claims.filter((claim) => claim.status === "approved").length;
  const submittedClaims = claims.filter((claim) => claim.status === "submitted").length;
  const activeClaims = claims.filter((claim) => claim.status === "active").length;
  const earnings = claims
    .filter((claim) => claim.status === "approved")
    .map((claim) => sampleTasks.find((task) => task.id === claim.taskId))
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

export function getPosterDashboardMetrics(posterId: string): DashboardMetric[] {
  const tasks = getTasksForPoster(posterId);
  const openTasks = tasks.filter((task) => task.status === "open" || task.status === "claimed").length;
  const reviewQueue = tasks.filter((task) => task.status === "submitted").length;
  const paidTasks = tasks.filter((task) => task.status === "paid" || task.status === "reviewed").length;
  const rewardReserved = tasks.reduce((sum, task) => sum + task.rewardAmount, 0);

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
      label: "Payout exposure",
      value: formatMoney(rewardReserved, "USD"),
      detail: "Current reward pool across sample tasks.",
    },
    {
      label: "Reviewed tasks",
      value: String(paidTasks),
      detail: "Proof already decided.",
    },
  ];
}

export function getDefaultRouteForRole(role: UserRole) {
  return role === "worker" ? "/worker" : "/poster";
}
