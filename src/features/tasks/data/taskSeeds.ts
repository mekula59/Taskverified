import { buildReputationState } from "@/features/tasks/lib/reputation";
import type { PayoutRecord, ReputationEvent, Task, TaskClaim, TaskSubmission, WalletProfile, WorkerProfileSummary, WorkerReputationSummary } from "@/features/shared/types/domain";

export const seededTasks: Task[] = [
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
    createdAt: "2026-04-10T09:00:00.000Z",
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
    createdAt: "2026-04-11T10:00:00.000Z",
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
    createdAt: "2026-04-12T10:00:00.000Z",
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
    status: "approved",
    category: "content",
    createdAt: "2026-04-13T10:00:00.000Z",
  },
];

export const seededClaims: TaskClaim[] = [
  {
    id: "claim-201",
    taskId: "task-102",
    workerId: "worker-001",
    workerName: "Nadia Cole",
    status: "active",
    claimedAt: "2026-04-15T11:00:00.000Z",
  },
  {
    id: "claim-202",
    taskId: "task-103",
    workerId: "worker-001",
    workerName: "Nadia Cole",
    status: "submitted",
    claimedAt: "2026-04-15T14:00:00.000Z",
    submittedAt: "2026-04-16T15:00:00.000Z",
  },
  {
    id: "claim-203",
    taskId: "task-104",
    workerId: "worker-001",
    workerName: "Nadia Cole",
    status: "approved",
    claimedAt: "2026-04-13T09:00:00.000Z",
    submittedAt: "2026-04-14T15:00:00.000Z",
  },
];

export const seededWorkerProfiles: WorkerProfileSummary[] = [
  {
    userId: "worker-001",
    fullName: "Nadia Cole",
    location: "Lagos, NG",
    bio: "Reliable product tester focused on evidence-rich proof and on-time completion.",
    verificationStatus: "verified",
    walletAddress: "So1WORKER001WalletReady111111111111",
  },
];

export const seededWalletProfiles: WalletProfile[] = [
  {
    userId: "worker-001",
    role: "worker",
    displayName: "Nadia Cole",
    chain: "solana",
    status: "connected",
    walletAddress: "So1WORKER001WalletReady111111111111",
    updatedAt: "2026-04-03T12:00:00.000Z",
  },
  {
    userId: "poster-001",
    role: "poster",
    displayName: "TaskVerified Labs",
    chain: "solana",
    status: "connected",
    walletAddress: "So1POSTER001WalletReady111111111111",
    updatedAt: "2026-04-03T12:05:00.000Z",
  },
];

export const seededSubmissions: TaskSubmission[] = [
  {
    id: "submission-301",
    claimId: "claim-202",
    taskId: "task-103",
    workerId: "worker-001",
    proofText: "Visited three shops, captured each menu board, and entered the prices into a structured list.",
    proofLink: "https://example.com/proof/task-103",
    proofFileName: "pricing-photos.zip",
    checklistItems: [
      { label: "Per-location menu photo", completed: true },
      { label: "Location name", completed: true },
      { label: "Price table", completed: true },
    ],
    status: "submitted",
    updatedAt: "2026-04-16T15:00:00.000Z",
    submittedAt: "2026-04-16T15:00:00.000Z",
  },
  {
    id: "submission-302",
    claimId: "claim-203",
    taskId: "task-104",
    workerId: "worker-001",
    proofText: "Created both requested event clips, included timestamps, and attached the zipped exports.",
    proofLink: "https://example.com/proof/task-104",
    proofFileName: "launch-event-clips.zip",
    checklistItems: [
      { label: "2 short clips", completed: true },
      { label: "Timestamps", completed: true },
      { label: "One-sentence rationale", completed: true },
    ],
    status: "approved",
    updatedAt: "2026-04-14T15:00:00.000Z",
    submittedAt: "2026-04-14T15:00:00.000Z",
    reviewedAt: "2026-04-14T18:00:00.000Z",
  },
];

export const seededPayouts: PayoutRecord[] = [
  {
    id: "payout-401",
    taskId: "task-104",
    claimId: "claim-203",
    submissionId: "submission-302",
    workerId: "worker-001",
    posterId: "poster-001",
    workerWalletAddress: "So1WORKER001WalletReady111111111111",
    posterWalletAddress: "So1POSTER001WalletReady111111111111",
    amount: 20,
    currencyToken: "USDC",
    status: "released",
    txSignature: "solana-tx-placeholder-seeded-401",
    createdAt: "2026-04-14T18:00:00.000Z",
    releasedAt: "2026-04-14T18:10:00.000Z",
  },
];

const seededReputation = buildReputationState({
  tasks: seededTasks,
  claims: seededClaims,
  submissions: seededSubmissions,
  workerProfiles: seededWorkerProfiles,
  payouts: seededPayouts,
});

export const seededReputationEvents: ReputationEvent[] = seededReputation.reputationEvents;
export const seededReputationSummaries: WorkerReputationSummary[] = seededReputation.reputationSummaries;
