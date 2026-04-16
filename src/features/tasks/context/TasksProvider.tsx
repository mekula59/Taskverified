import { useEffect, useMemo, useState, type ReactNode } from "react";

import { TasksContext, type TasksContextValue } from "@/features/tasks/context/TasksContext";
import { createTaskRecord, claimTaskRecord, reviewSubmissionRecord, submitProofRecord } from "@/features/tasks/lib/taskState";
import { readStoredTaskSnapshot, writeStoredTaskSnapshot } from "@/features/tasks/lib/taskStorage";
import type { Task, TaskClaim, TaskCreateInput, TaskStoreSnapshot, TaskSubmission } from "@/features/shared/types/domain";

export function TasksProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<TaskStoreSnapshot>(() => readStoredTaskSnapshot());

  useEffect(() => {
    writeStoredTaskSnapshot(snapshot);
  }, [snapshot]);

  const value = useMemo<TasksContextValue>(
    () => ({
      tasks: snapshot.tasks,
      claims: snapshot.claims,
      submissions: snapshot.submissions,
      workerProfiles: snapshot.workerProfiles,
      createTask: (input: TaskCreateInput, currentUser: { id: string; name: string }) => {
        const nextState = createTaskRecord(snapshot, input, currentUser);
        setSnapshot(nextState);
        return nextState.tasks[0] as Task;
      },
      claimTask: (input) => {
        const nextState = claimTaskRecord(snapshot, input);
        if (nextState === snapshot) {
          return null;
        }

        setSnapshot(nextState);
        return nextState.claims[0] as TaskClaim;
      },
      submitProof: (input) => {
        const nextState = submitProofRecord(snapshot, input);
        setSnapshot(nextState);
        return nextState.submissions.find((submission) => submission.claimId === input.claimId) as TaskSubmission;
      },
      reviewSubmission: (input) => {
        const nextState = reviewSubmissionRecord(snapshot, input);
        if (nextState === snapshot) {
          return null;
        }

        setSnapshot(nextState);
        return nextState.submissions.find((submission) => submission.claimId === input.claimId) as TaskSubmission;
      },
    }),
    [snapshot],
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}
