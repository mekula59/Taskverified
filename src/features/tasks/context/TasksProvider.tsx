import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { TasksContext, type TasksContextValue } from "@/features/tasks/context/TasksContext";
import { useAuth } from "@/features/auth/context/useAuth";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  claimTaskMutation,
  completePayoutReleaseMutation,
  connectWalletMutation,
  createTaskMutation,
  disconnectWalletMutation,
  emptySnapshot,
  failPayoutReleaseMutation,
  fetchTaskSnapshot,
  preparePayoutReleaseMutation,
  reviewSubmissionMutation,
  submitProofMutation,
} from "@/lib/supabase/tasks";
import type { PayoutRecord, Task, TaskClaim, TaskCreateInput, TaskStoreSnapshot, TaskSubmission, WalletProfile } from "@/features/shared/types/domain";

export function TasksProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [snapshot, setSnapshot] = useState<TaskStoreSnapshot>(emptySnapshot);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured || !auth.user) {
      setSnapshot(emptySnapshot());
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextSnapshot = await fetchTaskSnapshot();
      setSnapshot(nextSnapshot);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to load task data.");
      setSnapshot(emptySnapshot());
    } finally {
      setIsLoading(false);
    }
  }, [auth.user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const withRefresh = useCallback(
    async <T,>(runner: () => Promise<T>) => {
      setError(null);
      const result = await runner();
      const nextSnapshot = await fetchTaskSnapshot();
      setSnapshot(nextSnapshot);
      return result;
    },
    [],
  );

  const value = useMemo<TasksContextValue>(
    () => ({
      isLoading,
      error,
      tasks: snapshot.tasks,
      claims: snapshot.claims,
      submissions: snapshot.submissions,
      workerProfiles: snapshot.workerProfiles,
      walletProfiles: snapshot.walletProfiles,
      payouts: snapshot.payouts,
      reputationEvents: snapshot.reputationEvents,
      reputationSummaries: snapshot.reputationSummaries,
      refresh,
      createTask: async (input: TaskCreateInput, currentUser: { id: string; name: string }) =>
        withRefresh(async () => createTaskMutation(input, currentUser)) as Promise<Task>,
      claimTask: async (input) =>
        withRefresh(async () => claimTaskMutation({ taskId: input.taskId, workerId: input.workerId })) as Promise<TaskClaim | null>,
      submitProof: async (input) => withRefresh(async () => submitProofMutation(input)) as Promise<TaskSubmission>,
      reviewSubmission: async (input) =>
        withRefresh(async () => reviewSubmissionMutation(input)) as Promise<TaskSubmission | null>,
      connectWallet: async (input) => withRefresh(async () => connectWalletMutation(input)) as Promise<WalletProfile>,
      disconnectWallet: async (input) =>
        withRefresh(async () => disconnectWalletMutation(input)) as Promise<WalletProfile | null>,
      preparePayoutRelease: async (payoutId) => preparePayoutReleaseMutation(payoutId),
      completePayoutRelease: async (input) =>
        withRefresh(async () => completePayoutReleaseMutation(input)) as Promise<PayoutRecord | null>,
      failPayoutRelease: async (input) =>
        withRefresh(async () => failPayoutReleaseMutation(input)) as Promise<PayoutRecord | null>,
    }),
    [error, isLoading, refresh, snapshot, withRefresh],
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}
