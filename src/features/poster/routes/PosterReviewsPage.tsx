import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PageIntro } from "@/components/shell/PageIntro";
import { SectionCard } from "@/components/shell/SectionCard";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/features/auth/context/useAuth";
import { useTasks } from "@/features/tasks/context/useTasks";
import { defaultReviewFormValues, validateReviewForm } from "@/features/tasks/lib/reviewForm";
import { formatCategoryLabel, formatMoney, getPayoutForSubmission, getSubmittedSubmissionsForPoster, getWorkerProfile, getWorkerReputationSummary, getTrustScoreTone } from "@/features/tasks/data/sampleData";

export function PosterReviewsPage() {
  const auth = useAuth();
  const { tasks, claims, submissions, workerProfiles, payouts, reputationSummaries, reviewSubmission } = useTasks();
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [reviewValues, setReviewValues] = useState(defaultReviewFormValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleDecision = (decision: "approved" | "rejected") => {
    if (!selectedSubmission || !selectedTask) {
      return;
    }

    const nextErrors = validateReviewForm({ decision, values: reviewValues });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    reviewSubmission({
      claimId: selectedSubmission.claimId,
      taskId: selectedTask.id,
      decision,
      reviewerNotes: reviewValues.reviewerNotes,
    });

    setReviewValues(defaultReviewFormValues);
    setErrors({});
  };

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Poster"
        title="Review is where trust is enforced."
        description="Submitted proof now appears here for approval or rejection. Review decisions stay lightweight and typed so payout and reputation can layer on later."
      />
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Review queue" description="Submitted, approved, and rejected proof for your tasks.">
          <div className="space-y-3">
            {reviewItems.map((submission) => {
              const task = tasks.find((item) => item.id === submission.taskId);

              return (
                <button
                  key={submission.id}
                  type="button"
                  onClick={() => {
                    setSelectedClaimId(submission.claimId);
                    setReviewValues({ reviewerNotes: submission.reviewerNotes ?? "" });
                    setErrors({});
                  }}
                  className="w-full rounded-2xl border border-border/60 bg-background/70 p-4 text-left"
                >
                  <div className="font-medium">{task?.title ?? "Task"}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    <span className="capitalize">{submission.status}</span>
                    {submission.submittedAt ? ` · submitted ${new Date(submission.submittedAt).toLocaleDateString()}` : ""}
                  </div>
                </button>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard
          title={selectedTask ? `Review submission for ${selectedTask.title}` : "Select a submission"}
          description="Approve clean proof or reject with a short reason."
        >
          {selectedSubmission && selectedTask && selectedClaim ? (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{workerProfile?.fullName ?? selectedClaim.workerName}</p>
                  <p>{workerProfile?.location ?? "Location unavailable"}</p>
                  <p className="mt-2">{workerProfile?.bio ?? "Worker profile summary unavailable."}</p>
                  <p className="mt-2">
                    Verification: <span className="font-medium capitalize text-foreground">{workerProfile?.verificationStatus ?? "unknown"}</span>
                  </p>
                  {workerReputation ? (
                    <>
                      <p className="mt-2">
                        Trust score:{" "}
                        <span className="font-medium text-foreground">
                          {workerReputation.trustScore} · {getTrustScoreTone(workerReputation.trustScore)}
                        </span>
                      </p>
                      <p className="mt-2">
                        Completed work: <span className="font-medium text-foreground">{workerReputation.tasksCompleted}</span> · Approval rate:{" "}
                        <span className="font-medium text-foreground">{workerReputation.approvalRate}%</span>
                      </p>
                      <p className="mt-2">
                        Solana payouts released: <span className="font-medium text-foreground">{workerReputation.payoutsReleased}</span>
                      </p>
                      <p className="mt-2">
                        Strongest category:{" "}
                        <span className="font-medium text-foreground">
                          {workerReputation.categoryStrengths[0] ? formatCategoryLabel(workerReputation.categoryStrengths[0].category) : "Still forming"}
                        </span>
                      </p>
                    </>
                  ) : null}
                </div>
                <div className="rounded-xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
                  <p>
                    Submitted: <span className="font-medium text-foreground">{selectedSubmission.submittedAt ? new Date(selectedSubmission.submittedAt).toLocaleString() : "Not yet submitted"}</span>
                  </p>
                  <p className="mt-2">
                    Current status: <span className="font-medium capitalize text-foreground">{selectedSubmission.status}</span>
                  </p>
                  {selectedSubmission.reviewedAt ? (
                    <p className="mt-2">
                      Reviewed: <span className="font-medium text-foreground">{new Date(selectedSubmission.reviewedAt).toLocaleString()}</span>
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Proof text</p>
                <p className="mt-2">{selectedSubmission.proofText}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Proof link</p>
                  <p className="mt-2 break-all">{selectedSubmission.proofLink || "No proof link provided"}</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">File placeholder</p>
                  <p className="mt-2">{selectedSubmission.proofFileName || "No file placeholder provided"}</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Checklist completion</p>
                {selectedSubmission.checklistItems.map((item) => (
                  <div key={item.label} className="rounded-xl border border-border/60 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{item.completed ? "Complete" : "Incomplete"}</span> · {item.label}
                  </div>
                ))}
              </div>

              {payout ? (
                <div className="rounded-xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Solana payout status</p>
                  <p className="mt-2">
                    {formatMoney(payout.amount, "USD")} represented as <span className="font-medium text-foreground">{payout.currencyToken}</span>
                  </p>
                  <p className="mt-2">
                    Status: <span className="font-medium capitalize text-foreground">{payout.status.replaceAll("_", " ")}</span>
                  </p>
                  <p className="mt-2 break-all">Worker wallet: {payout.workerWalletAddress ?? "Not connected"}</p>
                  <p className="mt-2 break-all">Poster wallet: {payout.posterWalletAddress ?? "Not connected"}</p>
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="reviewerNotes">Reviewer notes for rejection</Label>
                <Textarea
                  id="reviewerNotes"
                  value={reviewValues.reviewerNotes}
                  onChange={(event) => setReviewValues({ reviewerNotes: event.target.value })}
                  placeholder="Optional for approval. Required if you reject the submission."
                />
                {errors.reviewerNotes ? <p className="text-sm text-destructive">{errors.reviewerNotes}</p> : null}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => handleDecision("approved")}>Approve submission</Button>
                <Button variant="outline" onClick={() => handleDecision("rejected")}>
                  Reject submission
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No submitted proof is available for review yet.</p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
