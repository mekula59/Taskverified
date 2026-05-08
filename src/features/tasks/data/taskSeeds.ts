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
    proofRequirements: [
      "Five screenshots showing each onboarding step",
      "Structured notes for every broken or confusing state",
      "Device, browser, and wallet state used during the test",
    ],
    claimLimit: 3,
    claimCount: 0,
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
    proofRequirements: [
      "Attendance code shown during the event",
      "Timestamped summary with three discussion points",
      "Screenshot of join screen with visible event context",
    ],
    claimLimit: 2,
    claimCount: 1,
    deadlineAt: "2026-04-19T20:00:00.000Z",
    status: "open",
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
    proofRequirements: [
      "Menu photo for each visited location",
      "Location name and visit time for each source",
      "Price table matching every photographed item",
    ],
    claimLimit: 1,
    claimCount: 1,
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
    proofRequirements: [
      "Direct link or file name for both finished clips",
      "Source timestamps for both selected highlights",
      "One-sentence rationale for each clip",
    ],
    claimLimit: 1,
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
    cluster: "devnet",
    status: "connected",
    provider: "phantom",
    walletAddress: "So1WORKER001WalletReady111111111111",
    updatedAt: "2026-04-03T12:00:00.000Z",
  },
  {
    userId: "poster-001",
    role: "poster",
    displayName: "TaskVerified Labs",
    chain: "solana",
    cluster: "devnet",
    status: "connected",
    provider: "phantom",
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
      { label: "Menu photo for each visited location", completed: true },
      { label: "Location name and visit time for each source", completed: true },
      { label: "Price table matching every photographed item", completed: true },
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
      { label: "Direct link or file name for both finished clips", completed: true },
      { label: "Source timestamps for both selected highlights", completed: true },
      { label: "One-sentence rationale for each clip", completed: true },
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
    currencyToken: "SOL",
    transferAmountLamports: 10000000,
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
