import type {
  PayoutRecord,
  ReputationEvent,
  SubmissionChecklistItem,
  Task,
  TaskClaim,
  TaskSubmission,
  VerificationRecord,
  WalletProfile,
  WorkerProfileSummary,
  WorkerReputationSummary,
} from "@/features/shared/types/domain";

type BackendProfileRow = {
  user_id: string;
  email: string | null;
  role: "worker" | "poster" | null;
  full_name: string | null;
  location: string | null;
  bio: string | null;
  wallet_address: string | null;
  wallet_provider: "phantom" | null;
  wallet_connection_status: "disconnected" | "connected";
  verification_status: "unverified" | "pending" | "verified" | "flagged";
  created_at: string;
};

type BackendVerificationRow = {
  user_id: string;
  status: "unverified" | "pending" | "verified" | "flagged";
  submitted_at: string | null;
  reviewed_at: string | null;
  notes: string | null;
};

type BackendTaskRow = {
  id: string;
  poster_id: string;
  poster_name: string;
  title: string;
  description: string;
  reward_amount: number;
  reward_currency: "USD";
  proof_requirements: string[];
  claim_limit: number;
  claim_count: number;
  deadline_at: string;
  status: Task["status"];
  category: Task["category"];
  created_at: string;
};

type BackendClaimRow = {
  id: string;
  task_id: string;
  worker_id: string;
  worker_name: string;
  status: TaskClaim["status"];
  claimed_at: string;
  submitted_at: string | null;
};

type BackendSubmissionRow = {
  id: string;
  claim_id: string;
  task_id: string;
  worker_id: string;
  proof_text: string;
  proof_link: string | null;
  proof_file_name: string | null;
  checklist_items: SubmissionChecklistItem[] | null;
  status: TaskSubmission["status"];
  updated_at: string;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewer_notes: string | null;
};

type BackendPayoutRow = {
  id: string;
  task_id: string;
  claim_id: string;
  submission_id: string;
  worker_id: string;
  poster_id: string;
  worker_wallet_address: string | null;
  poster_wallet_address: string | null;
  amount: number;
  currency_token: "SOL";
  transfer_amount_lamports: number | null;
  status: PayoutRecord["status"];
  tx_signature: string | null;
  failure_reason: string | null;
  created_at: string;
  released_at: string | null;
};

type BackendReputationEventRow = {
  id: string;
  worker_id: string;
  type: ReputationEvent["type"];
  detail: string;
  score_delta: number;
  created_at: string;
  task_id: string | null;
  claim_id: string | null;
  submission_id: string | null;
  payout_id: string | null;
  category: ReputationEvent["category"] | null;
};

type BackendReputationSummaryRow = {
  worker_id: string;
  verification_status: WorkerReputationSummary["verificationStatus"];
  tasks_completed: number;
  proof_submitted: number;
  approvals: number;
  rejections: number;
  approval_rate: number;
  payouts_released: number;
  trust_score: number;
  category_strengths: WorkerReputationSummary["categoryStrengths"] | null;
  updated_at: string;
  explanation: string[] | null;
};

export function mapProfileToWorkerSummary(row: BackendProfileRow): WorkerProfileSummary {
  return {
    userId: row.user_id,
    fullName: row.full_name ?? row.email ?? "Worker",
    location: row.location ?? "Location unavailable",
    bio: row.bio ?? "",
    verificationStatus: row.verification_status,
    walletAddress: row.wallet_address ?? undefined,
  };
}

export function mapProfileToWalletProfile(row: BackendProfileRow): WalletProfile | null {
  if (!row.role) {
    return null;
  }

  return {
    userId: row.user_id,
    role: row.role,
    displayName: row.full_name ?? row.email ?? "TaskVerified user",
    chain: "solana",
    cluster: "devnet",
    status: row.wallet_connection_status,
    provider: row.wallet_provider ?? undefined,
    walletAddress: row.wallet_address ?? undefined,
    updatedAt: row.created_at,
  };
}

export function mapVerification(row: BackendVerificationRow | null, fallbackUserId: string): VerificationRecord | null {
  if (!row) {
    return null;
  }

  return {
    userId: row.user_id ?? fallbackUserId,
    status: row.status,
    submittedAt: row.submitted_at ?? undefined,
    reviewedAt: row.reviewed_at ?? undefined,
    notes: row.notes ?? "",
  };
}

export function mapTask(row: BackendTaskRow): Task {
  return {
    id: row.id,
    posterId: row.poster_id,
    posterName: row.poster_name,
    title: row.title,
    description: row.description,
    rewardAmount: row.reward_amount,
    rewardCurrency: row.reward_currency,
    proofRequirements: row.proof_requirements ?? [],
    claimLimit: row.claim_limit,
    claimCount: row.claim_count,
    deadlineAt: row.deadline_at,
    status: row.status,
    category: row.category,
    createdAt: row.created_at,
  };
}

export function mapClaim(row: BackendClaimRow): TaskClaim {
  return {
    id: row.id,
    taskId: row.task_id,
    workerId: row.worker_id,
    workerName: row.worker_name,
    status: row.status,
    claimedAt: row.claimed_at,
    submittedAt: row.submitted_at ?? undefined,
  };
}

export function mapSubmission(row: BackendSubmissionRow): TaskSubmission {
  return {
    id: row.id,
    claimId: row.claim_id,
    taskId: row.task_id,
    workerId: row.worker_id,
    proofText: row.proof_text,
    proofLink: row.proof_link ?? "",
    proofFileName: row.proof_file_name ?? "",
    checklistItems: row.checklist_items ?? [],
    status: row.status,
    updatedAt: row.updated_at,
    submittedAt: row.submitted_at ?? undefined,
    reviewedAt: row.reviewed_at ?? undefined,
    reviewerNotes: row.reviewer_notes ?? undefined,
  };
}

export function mapPayout(row: BackendPayoutRow): PayoutRecord {
  return {
    id: row.id,
    taskId: row.task_id,
    claimId: row.claim_id,
    submissionId: row.submission_id,
    workerId: row.worker_id,
    posterId: row.poster_id,
    workerWalletAddress: row.worker_wallet_address ?? undefined,
    posterWalletAddress: row.poster_wallet_address ?? undefined,
    amount: row.amount,
    currencyToken: row.currency_token,
    transferAmountLamports: row.transfer_amount_lamports ?? undefined,
    status: row.status,
    txSignature: row.tx_signature ?? undefined,
    failureReason: row.failure_reason ?? undefined,
    createdAt: row.created_at,
    releasedAt: row.released_at ?? undefined,
  };
}

export function mapReputationEvent(row: BackendReputationEventRow): ReputationEvent {
  return {
    id: row.id,
    workerId: row.worker_id,
    type: row.type,
    detail: row.detail,
    scoreDelta: row.score_delta,
    createdAt: row.created_at,
    taskId: row.task_id ?? undefined,
    claimId: row.claim_id ?? undefined,
    submissionId: row.submission_id ?? undefined,
    payoutId: row.payout_id ?? undefined,
    category: row.category ?? undefined,
  };
}

export function mapReputationSummary(row: BackendReputationSummaryRow): WorkerReputationSummary {
  return {
    workerId: row.worker_id,
    verificationStatus: row.verification_status,
    tasksCompleted: row.tasks_completed,
    proofSubmitted: row.proof_submitted,
    approvals: row.approvals,
    rejections: row.rejections,
    approvalRate: row.approval_rate,
    payoutsReleased: row.payouts_released,
    trustScore: row.trust_score,
    categoryStrengths: row.category_strengths ?? [],
    updatedAt: row.updated_at,
    explanation: row.explanation ?? [],
  };
}

export type {
  BackendClaimRow,
  BackendPayoutRow,
  BackendProfileRow,
  BackendReputationEventRow,
  BackendReputationSummaryRow,
  BackendSubmissionRow,
  BackendTaskRow,
  BackendVerificationRow,
};
