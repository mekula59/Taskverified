import { createContext } from "react";

import type { PayoutRecord, SubmissionInput, SubmissionReviewInput, Task, TaskClaim, TaskCreateInput, TaskSubmission, WalletConnectInput, WalletProfile, WorkerProfileSummary } from "@/features/shared/types/domain";

export interface TasksContextValue {
  tasks: Task[];
  claims: TaskClaim[];
  submissions: TaskSubmission[];
  workerProfiles: WorkerProfileSummary[];
  walletProfiles: WalletProfile[];
  payouts: PayoutRecord[];
  createTask: (input: TaskCreateInput, currentUser: { id: string; name: string }) => Task;
  claimTask: (input: { taskId: string; workerId: string; workerName: string }) => TaskClaim | null;
  submitProof: (input: SubmissionInput) => TaskSubmission;
  reviewSubmission: (input: SubmissionReviewInput) => TaskSubmission | null;
  connectWallet: (input: WalletConnectInput) => WalletProfile;
  releasePayout: (payoutId: string) => PayoutRecord | null;
}

export const TasksContext = createContext<TasksContextValue | null>(null);
