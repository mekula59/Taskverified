import { createContext } from "react";

import type { SubmissionInput, SubmissionReviewInput, Task, TaskClaim, TaskCreateInput, TaskSubmission, WorkerProfileSummary } from "@/features/shared/types/domain";

export interface TasksContextValue {
  tasks: Task[];
  claims: TaskClaim[];
  submissions: TaskSubmission[];
  workerProfiles: WorkerProfileSummary[];
  createTask: (input: TaskCreateInput, currentUser: { id: string; name: string }) => Task;
  claimTask: (input: { taskId: string; workerId: string; workerName: string }) => TaskClaim | null;
  submitProof: (input: SubmissionInput) => TaskSubmission;
  reviewSubmission: (input: SubmissionReviewInput) => TaskSubmission | null;
}

export const TasksContext = createContext<TasksContextValue | null>(null);
