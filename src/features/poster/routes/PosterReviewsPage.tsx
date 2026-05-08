import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, BadgeCheck, ExternalLink, ShieldCheck, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SectionCard } from "@/components/shell/SectionCard";
import { ActionPanel, WorkspaceHero } from "@/components/shell/WorkspacePrimitives";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/features/auth/context/useAuth";
import { formatLamportsAsSol } from "@/features/solana/lib/payoutExecution";
import { useTasks } from "@/features/tasks/context/useTasks";
import { defaultReviewFormValues, validateReviewForm } from "@/features/tasks/lib/reviewForm";
import { getPayoutReleaseCopy, payoutRailCopy } from "@/features/tasks/lib/payoutRail";
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
  const checklistCompletedCount = selectedSubmission?.checklistItems.filter((item) => item.completed).length ?? 0;
  const checklistTotalCount = selectedSubmission?.checklistItems.length ?? 0;
  const proofArtifactsCount = [selectedSubmission?.proofLink, selectedSubmission?.proofFileName].filter(Boolean).length;
  const canReview = selectedSubmission?.status === "submitted";
  const openDecisionCount = reviewItems.filter((submission) => submission.status === "submitted").length;

  const handleDecision = async (decision: "approved" | "rejected") => {
    if (!selectedSubmission || !selectedTask || !canReview) {
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
    <div className="space-y-5">
      <WorkspaceHero
        eyebrow="Poster review"
        title="Review is the trust decision."
        description="Submitted work either becomes credible, payable progress or stops at the evidence layer. Approval changes payout readiness; rejection records that proof did not clear."
        aside={
          <ActionPanel
            eyebrow="Open decisions"
            title={String(openDecisionCount)}
            description="Only submitted items count as open decisions. Completed reviews stay visible but locked."
          />
        }
      />

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
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.12fr_0.88fr]">
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
                        <a
                          href={selectedSubmission.proofLink}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center text-xs font-medium text-cyan-700 hover:text-cyan-800"
                        >
                          Open submitted proof <ExternalLink className="ml-1 h-3.5 w-3.5" />
                        </a>
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

              <div className="space-y-4">
                {payout ? (
                  <div className="rounded-[1.75rem] border border-slate-200 bg-[#07141a] p-5 text-white shadow-[0_24px_70px_-35px_rgba(2,8,23,0.8)]">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100/85">
                          Solana payout implication
                        </div>
                        <h3 className="text-xl font-semibold tracking-tight">This review controls whether release can move forward.</h3>
                        <p className="text-sm leading-7 text-white/70">
                          Approval unlocks a poster-released SOL payout state and creates a release obligation. Rejection stops the release path and records that this proof did not meet the standard.
                        </p>
                      </div>
                      <div className={cn("inline-flex items-center self-start rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]", getPayoutStatusClasses(payout.status))}>
                        {formatSubmissionStatus(payout.status)}
                      </div>
                      <div className="grid gap-3">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-[0.16em] text-white/50">Loop integrity</p>
                          <div className="mt-3 space-y-3 text-sm">
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-white/70">Submission package supplied</span>
                              <span className="font-semibold text-white">{proofArtifactsCount} artifact{proofArtifactsCount === 1 ? "" : "s"}</span>
                            </div>
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-white/70">Requirement coverage</span>
                              <span className="font-semibold text-white">{checklistCompletedCount}/{checklistTotalCount || 0} marked complete</span>
                            </div>
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-white/70">Release model</span>
                              <span className="font-semibold text-white">poster-released after approval</span>
                            </div>
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-white/70">Worker payout destination</span>
                              <span className="font-semibold text-white">{payout.workerWalletAddress ? "Connected" : "Missing"}</span>
                            </div>
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-white/70">Poster release wallet</span>
                              <span className="font-semibold text-white">{payout.posterWalletAddress ? "Connected" : "Missing"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-[0.16em] text-white/50">Reward value</p>
                          <p className="mt-2 text-sm font-semibold text-white">{formatMoney(payout.amount, "USD")}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-[0.16em] text-white/50">Payout asset</p>
                          <p className="mt-2 text-sm font-semibold text-white">SOL</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-[0.16em] text-white/50">Network</p>
                          <p className="mt-2 text-sm font-semibold text-white">Solana devnet</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-[0.16em] text-white/50">Transfer target</p>
                          <p className="mt-2 text-sm font-semibold text-white">{formatLamportsAsSol(payout.transferAmountLamports)}</p>
                        </div>
                      </div>
                      {payout.failureReason ? (
                        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm leading-6 text-rose-100">
                          Failure reason: <span className="font-medium text-white">{payout.failureReason}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5">
                  <div className="space-y-2">
                    <Label htmlFor="reviewerNotes" className="text-slate-900">
                      {canReview ? "Rejection notes" : "Decision notes"}
                    </Label>
                    <p className="text-sm leading-6 text-slate-600">
                      {canReview
                        ? "Optional when approving. Required when rejecting so the worker knows exactly what evidence failed."
                        : "This decision is complete. Notes are shown for context and cannot be changed from this review state."}
                    </p>
                  </div>
                  <Textarea
                    id="reviewerNotes"
                    value={reviewValues.reviewerNotes}
                    disabled={!canReview}
                    onChange={(event) => setReviewValues({ reviewerNotes: event.target.value })}
                    placeholder={canReview ? "State what is missing, incorrect, or not credible enough to approve." : "No notes were recorded for this completed decision."}
                    className="mt-4 min-h-[140px] border-slate-200 bg-white"
                  />
                  {errors.reviewerNotes ? <p className="mt-2 text-sm text-destructive">{errors.reviewerNotes}</p> : null}
                </div>

                <div className="flex flex-col gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                  {payout ? (
                    <p className="text-sm leading-6 text-slate-600">
                      <span className="font-medium text-slate-950">{payoutRailCopy.releaseObligation}</span> It moves the payout toward <span className="font-medium text-slate-950">{payout.workerWalletAddress && payout.posterWalletAddress ? getPayoutReleaseCopy(payout).label : "wallet-dependent SOL hold"}</span>. Rejecting it preserves the evidence trail but blocks release.
                    </p>
                  ) : null}
                  {canReview ? (
                    <>
                      <Button className="h-12 rounded-xl bg-slate-950 px-5 text-white hover:bg-slate-800" onClick={() => handleDecision("approved")}>
                        Approve and unlock payout
                      </Button>
                      <Button variant="outline" className="h-12 rounded-xl border-slate-300 bg-white" onClick={() => handleDecision("rejected")}>
                        Reject proof
                      </Button>
                    </>
                  ) : (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                      <span className="font-medium text-slate-950">Review complete.</span> This submission is already {formatSubmissionStatus(selectedSubmission.status)}, so the decision is locked in backend truth.
                    </div>
                  )}
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

              <div className="grid gap-3 md:grid-cols-3">
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
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-medium text-slate-500">Requirement coverage</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">{checklistCompletedCount}/{checklistTotalCount || 0}</p>
                </div>
              </div>
            </div>

            {canReview && reviewError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-800">{reviewError}</div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5 text-sm leading-6 text-slate-600">
            No submitted proof is available for review yet.
          </div>
        )}
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
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
                    {submission.status === "submitted"
                      ? submission.submittedAt
                        ? `Submitted ${new Date(submission.submittedAt).toLocaleDateString()}`
                        : "Submitted for review"
                      : `Decision complete: ${formatSubmissionStatus(submission.status)}`}
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

        <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm sm:p-8">
          <div className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-100/70">Decision pressure</p>
            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white/55">Open decisions</p>
                <p className="mt-2 text-4xl font-semibold text-white">{openDecisionCount}</p>
              </div>
              <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold">Evidence controls payout readiness</p>
                <p className="mt-2 text-sm leading-6 text-white/68">This page exists to decide whether value can move forward.</p>
              </div>
              <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold">Trust records update here</p>
                <p className="mt-2 text-sm leading-6 text-white/68">Your review becomes part of future worker and poster judgment.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
