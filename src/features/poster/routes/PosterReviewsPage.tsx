import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, BadgeCheck, Clock3, ExternalLink, ShieldCheck, Sparkles, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PageIntro } from "@/components/shell/PageIntro";
import { SectionCard } from "@/components/shell/SectionCard";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/features/auth/context/useAuth";
import { formatLamportsAsSol } from "@/features/solana/lib/payoutExecution";
import { useTasks } from "@/features/tasks/context/useTasks";
import { defaultReviewFormValues, validateReviewForm } from "@/features/tasks/lib/reviewForm";
import { formatCategoryLabel, formatMoney, getPayoutForSubmission, getSubmittedSubmissionsForPoster, getWorkerProfile, getWorkerReputationSummary, getTrustScoreTone } from "@/features/tasks/data/sampleData";
import { cn } from "@/lib/utils";

function formatSubmissionStatus(status: string) {
  return status.replaceAll("_", " ");
}

function getSubmissionStatusClasses(status: string) {
  if (status === "approved") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (status === "rejected") {
    return "border-rose-200 bg-rose-50 text-rose-800";
  }

  return "border-amber-200 bg-amber-50 text-amber-800";
}

function getPayoutStatusClasses(status: string) {
  if (status === "released") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (status === "ready_to_release") {
    return "border-cyan-200 bg-cyan-50 text-cyan-800";
  }

  if (status === "failed") {
    return "border-rose-200 bg-rose-50 text-rose-800";
  }

  return "border-amber-200 bg-amber-50 text-amber-800";
}

export function PosterReviewsPage() {
  const auth = useAuth();
  const { tasks, claims, submissions, workerProfiles, payouts, reputationSummaries, reviewSubmission } = useTasks();
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [reviewValues, setReviewValues] = useState(defaultReviewFormValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reviewError, setReviewError] = useState<string | null>(null);

  const reviewItems = useMemo(
    () =>
      getSubmittedSubmissionsForPoster({
        tasks,
        claims,
        submissions,
        posterId: auth.user?.id ?? "",
      }),
    [auth.user?.id, claims, submissions, tasks],
  );

  const selectedSubmission = reviewItems.find((item) => item.claimId === selectedClaimId) ?? reviewItems[0];
  const selectedTask = tasks.find((task) => task.id === selectedSubmission?.taskId);
  const selectedClaim = claims.find((claim) => claim.id === selectedSubmission?.claimId);
  const workerProfile = selectedSubmission ? getWorkerProfile(workerProfiles, selectedSubmission.workerId) : undefined;
  const workerReputation = selectedSubmission ? getWorkerReputationSummary(reputationSummaries, selectedSubmission.workerId) : undefined;
  const payout = selectedSubmission ? getPayoutForSubmission(payouts, selectedSubmission.id) : undefined;
  const averageApprovalRate =
    reputationSummaries.length > 0
      ? Math.round(reputationSummaries.reduce((sum, item) => sum + item.approvalRate, 0) / reputationSummaries.length)
      : 0;

  const handleDecision = async (decision: "approved" | "rejected") => {
    if (!selectedSubmission || !selectedTask) {
      return;
    }

    const nextErrors = validateReviewForm({ decision, values: reviewValues });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setReviewError(null);

    try {
      await reviewSubmission({
        claimId: selectedSubmission.claimId,
        taskId: selectedTask.id,
        decision,
        reviewerNotes: reviewValues.reviewerNotes,
      });

      setReviewValues(defaultReviewFormValues);
      setErrors({});
    } catch (nextError) {
      setReviewError(nextError instanceof Error ? nextError.message : "Unable to save the review decision.");
    }
  };

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Poster"
        title="Review is the trust decision."
        description="This is the moment where submitted work either becomes credible, payable progress or stops at the evidence layer. Your call updates payout readiness and the worker's trust record."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Open decisions</p>
            <Clock3 className="h-5 w-5 text-amber-600" />
          </div>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">{reviewItems.length}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">Submitted proof currently waiting on poster judgment.</p>
        </div>
        <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Decision effect</p>
            <ShieldCheck className="h-5 w-5 text-cyan-700" />
          </div>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">Trust</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">Approve when evidence is complete. Reject when proof falls short. Both outcomes shape future access.</p>
        </div>
        <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Poster benchmark</p>
            <Sparkles className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">{averageApprovalRate}%</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">Current average approval rate across available worker trust histories.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
        <SectionCard title="Decision queue" description="Each submission here is a real trust checkpoint with payout consequences.">
          <div className="space-y-3">
            {reviewItems.map((submission) => {
              const task = tasks.find((item) => item.id === submission.taskId);
              const isSelected = selectedSubmission?.claimId === submission.claimId;
              const taskPayout = getPayoutForSubmission(payouts, submission.id);

              return (
                <button
                  key={submission.id}
                  type="button"
                  onClick={() => {
                    setSelectedClaimId(submission.claimId);
                    setReviewValues({ reviewerNotes: submission.reviewerNotes ?? "" });
                    setErrors({});
                  }}
                  className={cn(
                    "w-full rounded-[1.5rem] border p-4 text-left transition-all",
                    isSelected
                      ? "border-slate-950 bg-slate-950 text-white shadow-[0_20px_50px_-30px_rgba(15,23,42,0.7)]"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div
                        className={cn(
                          "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                          isSelected ? "border-white/15 bg-white/10 text-white/85" : getSubmissionStatusClasses(submission.status),
                        )}
                      >
                        {formatSubmissionStatus(submission.status)}
                      </div>
                      <div className={cn("text-base font-semibold leading-6", isSelected ? "text-white" : "text-slate-950")}>{task?.title ?? "Task"}</div>
                    </div>
                    <ArrowRight className={cn("h-4 w-4 shrink-0", isSelected ? "text-white/70" : "text-slate-400")} />
                  </div>

                  <div className={cn("mt-3 text-sm leading-6", isSelected ? "text-white/70" : "text-slate-600")}>
                    {submission.submittedAt ? `Submitted ${new Date(submission.submittedAt).toLocaleDateString()}` : "Not yet submitted"}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <div
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium",
                        isSelected ? "bg-white/10 text-white/80" : "bg-slate-100 text-slate-600",
                      )}
                    >
                      {task ? formatCategoryLabel(task.category) : "Task"}
                    </div>
                    {taskPayout ? (
                      <div
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-medium",
                          isSelected ? "bg-emerald-400/15 text-emerald-100" : "bg-emerald-50 text-emerald-700",
                        )}
                      >
                        {formatMoney(taskPayout.amount, "USD")} payout
                      </div>
                    ) : null}
                  </div>
                </button>
              );
            })}

            {reviewItems.length === 0 ? (
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5 text-sm leading-6 text-slate-600">
                No submitted proof is waiting right now. The next evidence bundle that arrives will appear here for review.
              </div>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard
          title={selectedTask ? `Decision workspace for ${selectedTask.title}` : "Select a submission"}
          description="Read the proof, inspect the worker context, and understand the payout state before you approve or reject."
        >
          {selectedSubmission && selectedTask && selectedClaim ? (
            <div className="space-y-6">
              <div className="rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Core trust checkpoint
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{selectedTask.title}</h2>
                      <p className="max-w-2xl text-sm leading-7 text-slate-600">{selectedTask.description}</p>
                    </div>
                  </div>
                  <div className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]", getSubmissionStatusClasses(selectedSubmission.status))}>
                    {formatSubmissionStatus(selectedSubmission.status)}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-sm font-medium text-slate-500">Submitted</p>
                    <p className="mt-2 text-sm font-semibold text-slate-950">
                      {selectedSubmission.submittedAt ? new Date(selectedSubmission.submittedAt).toLocaleString() : "Not yet submitted"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-sm font-medium text-slate-500">Reward at stake</p>
                    <p className="mt-2 text-sm font-semibold text-slate-950">{payout ? formatMoney(payout.amount, "USD") : formatMoney(selectedTask.rewardAmount, selectedTask.rewardCurrency)}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-sm font-medium text-slate-500">Category</p>
                    <p className="mt-2 text-sm font-semibold text-slate-950">{formatCategoryLabel(selectedTask.category)}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 text-emerald-600" />
                    <p className="text-sm font-semibold text-slate-950">Worker context</p>
                  </div>
                  <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                    <div>
                      <p className="font-semibold text-slate-950">{workerProfile?.fullName ?? selectedClaim.workerName}</p>
                      <p>{workerProfile?.location ?? "Location unavailable"}</p>
                    </div>
                    <p>{workerProfile?.bio ?? "Worker profile summary unavailable."}</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Verification</p>
                        <p className="mt-2 text-sm font-semibold capitalize text-slate-950">{workerProfile?.verificationStatus ?? "unknown"}</p>
                      </div>
                      {workerReputation ? (
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Trust score</p>
                          <p className="mt-2 text-sm font-semibold text-slate-950">
                            {workerReputation.trustScore} · {getTrustScoreTone(workerReputation.trustScore)}
                          </p>
                        </div>
                      ) : null}
                    </div>

                    {workerReputation ? (
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Performance history</p>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <div>
                            <p className="text-xs text-slate-500">Completed work</p>
                            <p className="text-sm font-semibold text-slate-950">{workerReputation.tasksCompleted}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Approval rate</p>
                            <p className="text-sm font-semibold text-slate-950">{workerReputation.approvalRate}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Released Solana payouts</p>
                            <p className="text-sm font-semibold text-slate-950">{workerReputation.payoutsReleased}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Strongest category</p>
                            <p className="text-sm font-semibold text-slate-950">
                              {workerReputation.categoryStrengths[0] ? formatCategoryLabel(workerReputation.categoryStrengths[0].category) : "Still forming"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-cyan-700" />
                    <p className="text-sm font-semibold text-slate-950">Evidence under review</p>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                      <p className="text-sm font-semibold text-slate-950">Proof text</p>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{selectedSubmission.proofText}</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                        <p className="text-sm font-semibold text-slate-950">Proof link</p>
                        <p className="mt-2 break-all text-sm leading-6 text-slate-600">{selectedSubmission.proofLink || "No proof link provided"}</p>
                        {selectedSubmission.proofLink ? (
                          <div className="mt-3 inline-flex items-center text-xs font-medium text-cyan-700">
                            Link submitted <ExternalLink className="ml-1 h-3.5 w-3.5" />
                          </div>
                        ) : null}
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                        <p className="text-sm font-semibold text-slate-950">File placeholder</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{selectedSubmission.proofFileName || "No file placeholder provided"}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-slate-950">Checklist completion</p>
                      {selectedSubmission.checklistItems.map((item) => (
                        <div key={item.label} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                          <div className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full", item.completed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                            {item.completed ? <BadgeCheck className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-950">{item.label}</p>
                            <p className="text-sm leading-6 text-slate-600">{item.completed ? "Included in the submission package." : "Still missing or incomplete."}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {payout ? (
                <div className="rounded-[1.75rem] border border-slate-200 bg-[#07141a] p-5 text-white shadow-[0_24px_70px_-35px_rgba(2,8,23,0.8)]">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100/85">
                        Solana payout implication
                      </div>
                      <h3 className="text-xl font-semibold tracking-tight">This review controls whether release can move forward.</h3>
                      <p className="max-w-2xl text-sm leading-7 text-white/70">
                        Approval unlocks the next payout state. Rejection stops the release path and records that this proof did not meet the standard.
                      </p>
                    </div>
                    <div className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]", getPayoutStatusClasses(payout.status))}>
                      {formatSubmissionStatus(payout.status)}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-white/50">Value</p>
                      <p className="mt-2 text-sm font-semibold text-white">{formatMoney(payout.amount, "USD")} · {payout.currencyToken}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-white/50">Transfer target</p>
                      <p className="mt-2 text-sm font-semibold text-white">{formatLamportsAsSol(payout.transferAmountLamports)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-white/50">Worker wallet</p>
                      <p className="mt-2 break-all text-sm font-semibold text-white/90">{payout.workerWalletAddress ?? "Not connected"}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-white/50">Poster wallet</p>
                      <p className="mt-2 break-all text-sm font-semibold text-white/90">{payout.posterWalletAddress ?? "Not connected"}</p>
                    </div>
                  </div>

                  {payout.failureReason ? (
                    <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm leading-6 text-rose-100">
                      Failure reason: <span className="font-medium text-white">{payout.failureReason}</span>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5">
                <div className="space-y-2">
                  <Label htmlFor="reviewerNotes" className="text-slate-900">
                    Rejection notes
                  </Label>
                  <p className="text-sm leading-6 text-slate-600">
                    Optional when approving. Required when rejecting so the worker knows exactly what evidence failed.
                  </p>
                </div>
                <Textarea
                  id="reviewerNotes"
                  value={reviewValues.reviewerNotes}
                  onChange={(event) => setReviewValues({ reviewerNotes: event.target.value })}
                  placeholder="State what is missing, incorrect, or not credible enough to approve."
                  className="mt-4 min-h-[140px] border-slate-200 bg-white"
                />
                {errors.reviewerNotes ? <p className="mt-2 text-sm text-destructive">{errors.reviewerNotes}</p> : null}
              </div>

              <div className="flex flex-col gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:flex-row">
                <Button className="h-12 rounded-xl bg-slate-950 px-5 text-white hover:bg-slate-800" onClick={() => handleDecision("approved")}>
                  Approve and unlock payout
                </Button>
                <Button variant="outline" className="h-12 rounded-xl border-slate-300 bg-white" onClick={() => handleDecision("rejected")}>
                  Reject proof
                </Button>
              </div>
              {reviewError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-800">{reviewError}</div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5 text-sm leading-6 text-slate-600">
              No submitted proof is available for review yet.
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
