import { useEffect, useMemo, useState, type ReactNode } from "react";

import { TasksContext, type TasksContextValue } from "@/features/tasks/context/TasksContext";
import { connectWalletRecord, createTaskRecord, claimTaskRecord, releasePayoutRecord, reviewSubmissionRecord, submitProofRecord } from "@/features/tasks/lib/taskState";
import { readStoredTaskSnapshot, writeStoredTaskSnapshot } from "@/features/tasks/lib/taskStorage";
import type { PayoutRecord, Task, TaskClaim, TaskCreateInput, TaskStoreSnapshot, TaskSubmission, WalletProfile } from "@/features/shared/types/domain";

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
      walletProfiles: snapshot.walletProfiles,
      payouts: snapshot.payouts,
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
      connectWallet: (input) => {
        const nextState = connectWalletRecord(snapshot, input);
        setSnapshot(nextState);
        return nextState.walletProfiles.find((wallet) => wallet.userId === input.userId && wallet.role === input.role) as WalletProfile;
      },
      releasePayout: (payoutId) => {
        const nextState = releasePayoutRecord(snapshot, payoutId);
        if (nextState === snapshot) {
          return null;
        }

        setSnapshot(nextState);
        return nextState.payouts.find((payout) => payout.id === payoutId) as PayoutRecord;
      },
    }),
    [snapshot],
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}
