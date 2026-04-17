import { createContext } from "react";

import type { PayoutRecord, PayoutReleaseFailureInput, PayoutReleasePreparation, ReputationEvent, SubmissionInput, SubmissionReviewInput, Task, TaskClaim, TaskCreateInput, TaskSubmission, WalletConnectInput, WalletDisconnectInput, WalletProfile, WorkerProfileSummary, WorkerReputationSummary } from "@/features/shared/types/domain";

export interface TasksContextValue {
  isLoading: boolean;
  error: string | null;
  tasks: Task[];
  claims: TaskClaim[];
  submissions: TaskSubmission[];
  workerProfiles: WorkerProfileSummary[];
  walletProfiles: WalletProfile[];
  payouts: PayoutRecord[];
  reputationEvents: ReputationEvent[];
  reputationSummaries: WorkerReputationSummary[];
  refresh: () => Promise<void>;
  createTask: (input: TaskCreateInput, currentUser: { id: string; name: string }) => Promise<Task>;
  claimTask: (input: { taskId: string; workerId: string; workerName: string }) => Promise<TaskClaim | null>;
  submitProof: (input: SubmissionInput) => Promise<TaskSubmission>;
  reviewSubmission: (input: SubmissionReviewInput) => Promise<TaskSubmission | null>;
  connectWallet: (input: WalletConnectInput) => Promise<WalletProfile>;
  disconnectWallet: (input: WalletDisconnectInput) => Promise<WalletProfile | null>;
  preparePayoutRelease: (payoutId: string) => Promise<PayoutReleasePreparation>;
  completePayoutRelease: (input: { payoutId: string; txSignature: string }) => Promise<PayoutRecord | null>;
  failPayoutRelease: (input: PayoutReleaseFailureInput) => Promise<PayoutRecord | null>;
}

export const TasksContext = createContext<TasksContextValue | null>(null);
