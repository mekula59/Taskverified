import type {
  PayoutRecord,
  PayoutReleaseFailureInput,
  PayoutReleasePreparation,
  SubmissionInput,
  SubmissionReviewInput,
  Task,
  TaskClaim,
  TaskCreateInput,
  TaskStoreSnapshot,
  TaskSubmission,
  WalletConnectInput,
  WalletDisconnectInput,
  WalletProfile,
  WorkerProfileSummary,
  WorkerReputationSummary,
} from "@/features/shared/types/domain";
import {
  mapClaim,
  mapPayout,
  mapProfileToWalletProfile,
  mapProfileToWorkerSummary,
  mapReputationEvent,
  mapReputationSummary,
  mapSubmission,
  mapTask,
  type BackendClaimRow,
  type BackendPayoutRow,
  type BackendProfileRow,
  type BackendReputationEventRow,
  type BackendReputationSummaryRow,
  type BackendSubmissionRow,
  type BackendTaskRow,
} from "@/lib/supabase/mappers";
import { requireSupabase } from "@/lib/supabase/client";

type BackendSnapshot = {
  tasks: BackendTaskRow[];
  claims: BackendClaimRow[];
  submissions: BackendSubmissionRow[];
  profiles: BackendProfileRow[];
  payouts: BackendPayoutRow[];
  reputationEvents: BackendReputationEventRow[];
  reputationSummaries: BackendReputationSummaryRow[];
};

function emptySnapshot(): TaskStoreSnapshot {
  return {
    tasks: [],
    claims: [],
    submissions: [],
    workerProfiles: [],
    walletProfiles: [],
    payouts: [],
    reputationEvents: [],
    reputationSummaries: [],
  };
}

function mapBackendSnapshot(snapshot: BackendSnapshot): TaskStoreSnapshot {
  const workerProfiles: WorkerProfileSummary[] = snapshot.profiles
    .filter((profile) => profile.role === "worker")
    .map(mapProfileToWorkerSummary);
  const walletProfiles: WalletProfile[] = snapshot.profiles
    .map(mapProfileToWalletProfile)
    .filter((wallet): wallet is WalletProfile => Boolean(wallet));

  return {
    tasks: snapshot.tasks.map(mapTask),
    claims: snapshot.claims.map(mapClaim),
    submissions: snapshot.submissions.map(mapSubmission),
    workerProfiles,
    walletProfiles,
    payouts: snapshot.payouts.map(mapPayout),
    reputationEvents: snapshot.reputationEvents.map(mapReputationEvent),
    reputationSummaries: snapshot.reputationSummaries.map(mapReputationSummary),
  };
}

export async function fetchTaskSnapshot(): Promise<TaskStoreSnapshot> {
  const supabase = requireSupabase();
  const [
    { data: tasks, error: tasksError },
    { data: claims, error: claimsError },
    { data: submissions, error: submissionsError },
    { data: profiles, error: profilesError },
    { data: payouts, error: payoutsError },
    { data: reputationEvents, error: reputationEventsError },
    { data: reputationSummaries, error: reputationSummariesError },
  ] = await Promise.all([
    supabase.from("tasks").select("*").order("created_at", { ascending: false }),
    supabase.from("task_claims").select("*").order("claimed_at", { ascending: false }),
    supabase.from("submissions").select("*").order("updated_at", { ascending: false }),
    supabase.from("profiles").select("*"),
    supabase.from("payouts").select("*").order("created_at", { ascending: false }),
    supabase.from("reputation_events").select("*").order("created_at", { ascending: false }),
    supabase.from("reputation_summaries").select("*"),
  ]);

  const firstError =
    tasksError ??
    claimsError ??
    submissionsError ??
    profilesError ??
    payoutsError ??
    reputationEventsError ??
    reputationSummariesError;

  if (firstError) {
    throw firstError;
  }

  return mapBackendSnapshot({
    tasks: (tasks ?? []) as BackendTaskRow[],
    claims: (claims ?? []) as BackendClaimRow[],
    submissions: (submissions ?? []) as BackendSubmissionRow[],
    profiles: (profiles ?? []) as BackendProfileRow[],
    payouts: (payouts ?? []) as BackendPayoutRow[],
    reputationEvents: (reputationEvents ?? []) as BackendReputationEventRow[],
    reputationSummaries: (reputationSummaries ?? []) as BackendReputationSummaryRow[],
  });
}

async function rpcMutation(functionName: string, payload: Record<string, unknown>) {
  const supabase = requireSupabase();
  const { error } = await supabase.rpc(functionName, payload);
  if (error) {
    throw error;
  }

  return fetchTaskSnapshot();
}

async function rpcCall<T>(functionName: string, payload: Record<string, unknown>): Promise<T> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.rpc(functionName, payload);
  if (error) {
    throw error;
  }

  return data as T;
}

export async function createTaskMutation(input: TaskCreateInput, currentUser: { id: string; name: string }): Promise<Task> {
  const snapshot = await rpcMutation("create_task", {
    p_title: input.title,
    p_description: input.description,
    p_category: input.category,
    p_proof_requirements: input.proofRequirements,
    p_reward_amount: input.rewardAmount,
    p_reward_currency: input.rewardCurrency,
    p_deadline_at: input.deadlineAt,
    p_status: input.status,
  });

  return snapshot.tasks.find((task) => task.posterId === currentUser.id && task.title === input.title) ?? snapshot.tasks[0];
}

export async function claimTaskMutation(input: { taskId: string; workerId: string }): Promise<TaskClaim | null> {
  const snapshot = await rpcMutation("claim_task", {
    p_task_id: input.taskId,
  });

  return snapshot.claims.find((claim) => claim.taskId === input.taskId && claim.workerId === input.workerId) ?? null;
}

export async function submitProofMutation(input: SubmissionInput): Promise<TaskSubmission> {
  const snapshot = await rpcMutation("submit_proof", {
    p_claim_id: input.claimId,
    p_task_id: input.taskId,
    p_proof_text: input.proofText,
    p_proof_link: input.proofLink,
    p_proof_file_name: input.proofFileName,
    p_checklist_items: input.checklistItems,
  });

  return snapshot.submissions.find((submission) => submission.claimId === input.claimId) as TaskSubmission;
}

export async function reviewSubmissionMutation(input: SubmissionReviewInput): Promise<TaskSubmission | null> {
  const snapshot = await rpcMutation("review_submission", {
    p_claim_id: input.claimId,
    p_task_id: input.taskId,
    p_decision: input.decision,
    p_reviewer_notes: input.reviewerNotes ?? null,
  });

  return snapshot.submissions.find((submission) => submission.claimId === input.claimId) ?? null;
}

export async function preparePayoutReleaseMutation(payoutId: string): Promise<PayoutReleasePreparation> {
  const data = await rpcCall<{
    payout_id: string;
    poster_wallet_address: string;
    worker_wallet_address: string;
    transfer_amount_lamports: number;
    transfer_amount_sol: number;
  }>("release_payout", {
    p_payout_id: payoutId,
  });

  return {
    payoutId: data.payout_id,
    posterWalletAddress: data.poster_wallet_address,
    workerWalletAddress: data.worker_wallet_address,
    transferAmountLamports: data.transfer_amount_lamports,
    transferAmountSol: data.transfer_amount_sol,
  };
}

export async function completePayoutReleaseMutation(input: { payoutId: string; txSignature: string }): Promise<PayoutRecord | null> {
  const supabase = requireSupabase();
  const { error } = await supabase.functions.invoke("complete-payout-release", {
    body: {
      payoutId: input.payoutId,
      txSignature: input.txSignature,
    },
  });

  if (error) {
    throw error;
  }

  const snapshot = await fetchTaskSnapshot();
  return snapshot.payouts.find((payout) => payout.id === input.payoutId) ?? null;
}

export async function failPayoutReleaseMutation(input: PayoutReleaseFailureInput): Promise<PayoutRecord | null> {
  const snapshot = await rpcMutation("fail_payout_release", {
    p_payout_id: input.payoutId,
    p_failure_reason: input.failureReason,
    p_tx_signature: input.txSignature ?? null,
  });

  return snapshot.payouts.find((payout) => payout.id === input.payoutId) ?? null;
}

export async function connectWalletMutation(input: WalletConnectInput): Promise<WalletProfile> {
  const snapshot = await rpcMutation("connect_wallet", {
    p_role: input.role,
    p_display_name: input.displayName,
    p_wallet_address: input.walletAddress,
    p_provider: input.provider,
    p_cluster: input.cluster,
  });

  return snapshot.walletProfiles.find((wallet) => wallet.userId === input.userId && wallet.role === input.role) as WalletProfile;
}

export async function disconnectWalletMutation(input: WalletDisconnectInput): Promise<WalletProfile | null> {
  const snapshot = await rpcMutation("disconnect_wallet", {
    p_role: input.role,
  });

  return snapshot.walletProfiles.find((wallet) => wallet.userId === input.userId && wallet.role === input.role) ?? null;
}

export { emptySnapshot };
