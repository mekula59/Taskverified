import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight, BadgeCheck, RefreshCw, ShieldCheck, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActionPanel, EmptyState, LedgerHeader, LedgerObject, LedgerRows, ProofList, StatusPill, WorkspaceHero } from "@/components/shell/WorkspacePrimitives";
import { getStatusTone } from "@/components/shell/workspaceStatus";
import { useAuth } from "@/features/auth/context/useAuth";
import { useTasks } from "@/features/tasks/context/useTasks";
import { formatMoney, getClaimForTask, getPayoutForSubmission, getPublicTasks, getSubmissionForClaim, getTrustScoreTone, getWorkerReputationSummary } from "@/features/tasks/data/sampleData";
import type { PayoutRecord, Task, TaskSubmission } from "@/features/shared/types/domain";

function getDeadlineHasPassed(deadlineAt: string) {
  const deadline = new Date(deadlineAt);

  return Number.isFinite(deadline.getTime()) && deadline < new Date();
}

function getWorkerPayoutState(submission?: TaskSubmission, payout?: PayoutRecord) {
  if (!submission) {
    return {
      label: "Not created",
      detail: "Payout state opens only after proof is submitted and reviewed.",
      needsDisputeNote: false,
    };
  }

  if (submission.status === "submitted") {
    return {
      label: "Pending review",
      detail: "Proof is waiting for the poster decision before payout can move.",
      needsDisputeNote: false,
    };
  }

  if (submission.status === "rejected") {
    return {
      label: "Rejected",
      detail: "Rejected proof does not move into payout release.",
      needsDisputeNote: true,
    };
  }

  if (!payout) {
    return {
      label: "Approved, payout record pending",
      detail: "Approved proof is waiting for payout state to appear.",
      needsDisputeNote: true,
    };
  }

  if (payout.status === "ready_to_release") {
    return {
      label: "Approved, awaiting poster release",
      detail: "Approved proof is waiting for poster release.",
      needsDisputeNote: true,
    };
  }

  if (payout.status === "released") {
    return {
      label: "Released",
      detail: payout.txSignature ? "Released on Solana devnet with a recorded transaction signature." : "Released on Solana devnet.",
      needsDisputeNote: false,
    };
  }

  if (payout.status === "failed") {
    return {
      label: payout.txSignature ? "Failed, finalization recovery needed" : "Failed, recoverable",
      detail: payout.txSignature
        ? "A transaction signature exists, but TaskVerified still needs release finalization."
        : "Release failed before a final transaction signature was recorded.",
      needsDisputeNote: false,
    };
  }

  return {
    label: "Pending review",
    detail: "Payout is not ready until proof clears review.",
    needsDisputeNote: false,
  };
}

export function WorkerTasksPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { tasks, claims, submissions, payouts, reputationSummaries, isLoading, error, refresh, claimTask } = useTasks();
  const isClaimEligible = auth.verification?.status === "verified";
  const publicTasks = getPublicTasks(tasks);
  const workerId = auth.user?.id ?? "";
  const workerName = auth.profile?.fullName ?? "Worker";
  const reputation = getWorkerReputationSummary(reputationSummaries, workerId);
  const [claimError, setClaimError] = useState<string | null>(null);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const getClaimDisabledReason = (task: Task) => {
    if (!workerId) {
      return "Worker session is still loading.";
    }

    if (getClaimForTask(claims, task.id, workerId)) {
      return "You already claimed this task.";
    }

    if (!isClaimEligible) {
      return "Claiming stays locked until your verification clears.";
    }

    if (task.status !== "open") {
      return `Task is ${task.status.replaceAll("_", " ")} and no longer accepts new claims.`;
    }

    if (task.claimCount >= task.claimLimit) {
      return "All claim slots are already filled.";
    }

    if (getDeadlineHasPassed(task.deadlineAt)) {
      return "The task deadline has passed.";
    }

    return null;
  };

  const handleClaim = async (taskId: string) => {
    const task = tasks.find((item) => item.id === taskId);

    if (!task) {
      setClaimError("Task is unavailable.");
      return;
    }

    const disabledReason = getClaimDisabledReason(task);
    if (disabledReason) {
      setClaimError(disabledReason);
      return;
    }

    setClaimError(null);

    try {
      await claimTask({
        taskId,
        workerId,
        workerName,
      });

      navigate(`/worker/submissions?taskId=${taskId}`);
    } catch (nextError) {
      setClaimError(nextError instanceof Error ? nextError.message : "Unable to claim the task.");
    }
  };

  return (
    <div className="space-y-5">
      <WorkspaceHero
        eyebrow="Worker claim"
        title="Claim work that already shows how trust will be judged."
        description="Each task spells out proof requirements, availability, and payout implications before you commit. The point is cleaner judgment, not more listings."
        aside={
          <ActionPanel
            eyebrow="Claim discipline"
            title="Proof before commitment"
            description="Claim only after the proof bar, poster context, and payout path are legible."
          >
            {reputation ? (
              <LedgerRows
                rows={[
                  { label: "Trust", value: `${getTrustScoreTone(reputation.trustScore)} ${reputation.trustScore}` },
                  { label: "Approval", value: `${reputation.approvalRate}%` },
                  { label: "Released", value: reputation.payoutsReleased },
                ]}
              />
            ) : null}
          </ActionPanel>
        }
      />

      {claimError ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{claimError}</div> : null}
      {isLoading ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-ledger-sm sm:flex-row sm:items-center sm:justify-between">
          <span>Refreshing the latest open tasks from TaskVerified.</span>
          <RefreshCw className="h-4 w-4 animate-spin text-slate-400" aria-hidden="true" />
        </div>
      ) : null}
      {error ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={() => void refresh()}>
            Refresh tasks
          </Button>
        </div>
      ) : null}
      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        {publicTasks.map((task) => (
          <LedgerObject key={task.id}>
            <LedgerHeader
              eyebrow={
                <div className="flex flex-wrap gap-2">
                  <StatusPill tone="neutral">Posted by {task.posterName}</StatusPill>
                  <StatusPill tone={getStatusTone(task.status)} className="capitalize">{task.status}</StatusPill>
                </div>
              }
              title={task.title}
              description={task.description}
              meta={<StatusPill tone="dark">{formatMoney(task.rewardAmount, task.rewardCurrency)}</StatusPill>}
            />

            <div className="space-y-4 p-5">
              <div className="grid min-w-0 gap-4 lg:grid-cols-[1.02fr_0.98fr]">
                <ProofList title="Proof bar before claim" items={task.proofRequirements} />

                <div className="min-w-0 space-y-4">
                  <LedgerRows
                    rows={[
                      { label: task.claimCount >= task.claimLimit ? "Availability" : "Availability", value: task.claimCount >= task.claimLimit ? "Filled" : "Open" },
                      { label: "Status", value: <span className="capitalize">{task.status}</span> },
                      { label: "Deadline", value: new Date(task.deadlineAt).toLocaleDateString() },
                    ]}
                  />
                </div>
              </div>

              {(() => {
                const existingClaim = getClaimForTask(claims, task.id, workerId);
                const submission = existingClaim ? getSubmissionForClaim(submissions, existingClaim.id) : undefined;
                const payout = submission ? getPayoutForSubmission(payouts, submission.id) : undefined;
                const disabledReason = getClaimDisabledReason(task);

                if (existingClaim) {
                  const payoutState = getWorkerPayoutState(submission, payout);

                  return (
                    <div className="flex flex-col gap-3 rounded-2xl bg-slate-50/85 px-4 py-4 ring-1 ring-slate-200/80">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Current state</p>
                      <p className="text-sm text-slate-600">
                        You already hold this task. Current status: <span className="font-medium capitalize text-slate-950">{existingClaim.status}</span>
                      </p>
                      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-600">
                        <p>
                          Payout state: <span className="font-medium text-slate-950">{payoutState.label}</span>
                        </p>
                        <p>{payoutState.detail}</p>
                        {payout?.txSignature ? <p className="break-all font-mono text-xs text-slate-500">Tx: {payout.txSignature}</p> : null}
                      </div>
                      {payoutState.needsDisputeNote ? (
                        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                          Dispute support is not live in this demo. Keep proof and payout history visible.
                        </p>
                      ) : null}
                      <Button variant="outline" onClick={() => navigate(`/worker/submissions?taskId=${task.id}`)}>
                        {existingClaim.status === "active" ? "Submit proof" : "View proof submission"}
                      </Button>
                    </div>
                  );
                }

                if (!isClaimEligible) {
                  return (
                    <EmptyState title="Claim locked" description={disabledReason ?? "This task is not available for claim right now."} icon="locked" />
                  );
                }

                return (
                  <div className="rounded-2xl bg-slate-950 p-4 text-white shadow-ledger-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100/70">Claim checkpoint</p>
                    <p className="mt-3 text-sm leading-6 text-white/72">Claiming means you accept the proof bar already shown above.</p>
                    <Button className="mt-4 h-12 rounded-xl bg-white px-5 text-slate-950 hover:bg-slate-100" onClick={() => handleClaim(task.id)} disabled={Boolean(disabledReason)}>
                      Claim task
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    {disabledReason ? (
                      <p className="mt-3 text-sm leading-6 text-white/68">{disabledReason}</p>
                    ) : (
                      <p className="mt-3 text-sm leading-6 text-white/68">
                        {Math.max(task.claimLimit - task.claimCount, 0)} claim slot{task.claimLimit - task.claimCount === 1 ? "" : "s"} available before {new Date(task.deadlineAt).toLocaleDateString()}.
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          </LedgerObject>
        ))}
      </div>
    </div>
  );
}
