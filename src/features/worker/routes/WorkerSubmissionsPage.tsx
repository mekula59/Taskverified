import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageIntro } from "@/components/shell/PageIntro";
import { SectionCard } from "@/components/shell/SectionCard";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/features/auth/context/useAuth";
import { formatLamportsAsSol } from "@/features/solana/lib/payoutExecution";
import { useTasks } from "@/features/tasks/context/useTasks";
import { createSubmissionFormValues, toSubmissionInput, validateSubmissionForm } from "@/features/tasks/lib/submissionForm";
import { formatMoney, getClaimsForWorker, getPayoutForSubmission, getSubmissionForClaim, getSubmissionTrustStatus, getWorkerReputationSummary } from "@/features/tasks/data/sampleData";
import type { SubmissionFormValues } from "@/features/shared/types/domain";

export function WorkerSubmissionsPage() {
  const auth = useAuth();
  const { tasks, claims, submissions, payouts, reputationSummaries, submitProof } = useTasks();
  const [searchParams, setSearchParams] = useSearchParams();
  const workerId = auth.user?.id ?? "";
  const workerClaims = getClaimsForWorker(claims, workerId);
  const selectedTaskId = searchParams.get("taskId");
  const selectedClaim = workerClaims.find((claim) => claim.taskId === selectedTaskId) ?? workerClaims[0];
  const selectedTask = tasks.find((task) => task.id === selectedClaim?.taskId);
  const existingSubmission = selectedClaim ? getSubmissionForClaim(submissions, selectedClaim.id) : undefined;
  const payout = existingSubmission ? getPayoutForSubmission(payouts, existingSubmission.id) : undefined;
  const isLocked = existingSubmission?.status === "approved" || existingSubmission?.status === "rejected";
  const reputation = getWorkerReputationSummary(reputationSummaries, workerId);

  const initialValues = useMemo(
    () => createSubmissionFormValues(selectedTask?.proofRequirements ?? [], existingSubmission),
    [selectedTask?.proofRequirements, existingSubmission],
  );

  const [values, setValues] = useState<SubmissionFormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  const handleSelectClaim = (taskId: string) => {
    setSearchParams({ taskId });
    const claim = workerClaims.find((item) => item.taskId === taskId);
    const task = tasks.find((item) => item.id === taskId);
    const submission = claim ? getSubmissionForClaim(submissions, claim.id) : undefined;
    setValues(createSubmissionFormValues(task?.proofRequirements ?? [], submission));
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!selectedClaim || !selectedTask || !workerId) {
      return;
    }

    const nextErrors = validateSubmissionForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitError(null);

    try {
      await submitProof(
        toSubmissionInput({
          claimId: selectedClaim.id,
          taskId: selectedTask.id,
          workerId,
          values,
        }),
      );
    } catch (nextError) {
      setSubmitError(nextError instanceof Error ? nextError.message : "Unable to submit proof.");
    }
  };

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Worker"
        title="Proof submission is the center of worker execution."
        description="Claims and submissions are now persisted in the backend so workers can move from claimed work into submitted proof against real state."
      />
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Your claimed tasks" description="Choose a claim to submit proof against.">
          <div className="space-y-3">
            {workerClaims.map((claim) => {
              const task = tasks.find((item) => item.id === claim.taskId);

              return (
                <button
                  key={claim.id}
                  type="button"
                  onClick={() => handleSelectClaim(claim.taskId)}
                  className="w-full rounded-2xl border border-border/60 bg-background/70 p-4 text-left"
                >
                  <div className="font-medium">{task?.title ?? "Task"}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    <span className="capitalize">{claim.status}</span>
                    {claim.submittedAt ? ` · submitted ${new Date(claim.submittedAt).toLocaleDateString()}` : ""}
                  </div>
                </button>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard
          title={selectedTask ? `Submit proof for ${selectedTask.title}` : "Select a claim"}
          description="Proof text is required. Link and file fields are placeholders for later backend attachment support."
        >
          {selectedTask && selectedClaim ? (
            <div className="space-y-5">
              {reputation ? (
                <div className="rounded-xl border border-border/60 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                  Trust score <span className="font-medium text-foreground">{reputation.trustScore}</span> · {reputation.approvalRate}% approval rate · {reputation.payoutsReleased} released Solana payouts
                </div>
              ) : null}
              {existingSubmission?.status === "approved" ? (
                <div className="space-y-2 rounded-xl border border-border/60 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                  <p>
                    Submission approved{existingSubmission.reviewedAt ? ` on ${new Date(existingSubmission.reviewedAt).toLocaleDateString()}` : ""}.
                  </p>
                  {payout ? (
                    <>
                      <p>
                        Solana payout: <span className="font-medium capitalize text-foreground">{payout.status.replaceAll("_", " ")}</span>
                      </p>
                      <p>
                        Amount: <span className="font-medium text-foreground">{formatMoney(payout.amount, "USD")} / {payout.currencyToken}</span>
                      </p>
                      <p>
                        Devnet transfer: <span className="font-medium text-foreground">{formatLamportsAsSol(payout.transferAmountLamports)}</span>
                      </p>
                      <p className="break-all">Tx signature: {payout.txSignature ?? "Not released yet"}</p>
                      {payout.failureReason ? <p>Failure reason: <span className="text-foreground">{payout.failureReason}</span></p> : null}
                    </>
                  ) : null}
                </div>
              ) : null}
              {existingSubmission?.status === "rejected" ? (
                <div className="space-y-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-muted-foreground">
                  <p>
                    Submission rejected{existingSubmission.reviewedAt ? ` on ${new Date(existingSubmission.reviewedAt).toLocaleDateString()}` : ""}.
                  </p>
                  {existingSubmission.reviewerNotes ? <p>Reviewer notes: <span className="text-foreground">{existingSubmission.reviewerNotes}</span></p> : null}
                </div>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="proofText">Proof text</Label>
                <Textarea
                  id="proofText"
                  value={values.proofText}
                  disabled={isLocked}
                  onChange={(event) => setValues((current) => ({ ...current, proofText: event.target.value }))}
                  placeholder="Describe what you completed and how the attached evidence maps to the requirements."
                />
                {errors.proofText ? <p className="text-sm text-destructive">{errors.proofText}</p> : null}
                {existingSubmission ? (
                  <p className="text-xs text-muted-foreground">{getSubmissionTrustStatus(existingSubmission.status)}</p>
                ) : null}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="proofLink">Proof link</Label>
                  <Input
                    id="proofLink"
                    value={values.proofLink}
                    disabled={isLocked}
                    onChange={(event) => setValues((current) => ({ ...current, proofLink: event.target.value }))}
                    placeholder="https://example.com/proof"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proofFileName">Proof file placeholder</Label>
                  <Input
                    id="proofFileName"
                    value={values.proofFileName}
                    disabled={isLocked}
                    onChange={(event) => setValues((current) => ({ ...current, proofFileName: event.target.value }))}
                    placeholder="screenshots.zip"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Checklist</Label>
                {values.checklistItems.map((item, index) => (
                  <label key={item.label} className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      disabled={isLocked}
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          checklistItems: current.checklistItems.map((checklistItem, checklistIndex) =>
                            checklistIndex === index ? { ...checklistItem, completed: event.target.checked } : checklistItem,
                          ),
                        }))
                      }
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
                {errors.checklistItems ? <p className="text-sm text-destructive">{errors.checklistItems}</p> : null}
              </div>

              {!isLocked ? <Button onClick={handleSubmit}>Submit proof</Button> : null}
              {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Claim a task first, then return here to submit proof.</p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
