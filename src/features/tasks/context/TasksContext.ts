import { createContext } from "react";

import type { SubmissionInput, Task, TaskClaim, TaskCreateInput, TaskSubmission } from "@/features/shared/types/domain";

export interface TasksContextValue {
  tasks: Task[];
  claims: TaskClaim[];
  submissions: TaskSubmission[];
  createTask: (input: TaskCreateInput, currentUser: { id: string; name: string }) => Task;
  claimTask: (input: { taskId: string; workerId: string; workerName: string }) => TaskClaim | null;
  submitProof: (input: SubmissionInput) => TaskSubmission;
}

export const TasksContext = createContext<TasksContextValue | null>(null);
