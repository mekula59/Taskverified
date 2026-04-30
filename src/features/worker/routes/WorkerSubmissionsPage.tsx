import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BadgeCheck, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ActionPanel, WorkspaceHero } from "@/components/shell/WorkspacePrimitives";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/features/auth/context/useAuth";
import { useTasks } from "@/features/tasks/context/useTasks";
import { createSubmissionFormValues, toSubmissionInput, validateSubmissionForm } from "@/features/tasks/lib/submissionForm";
import { getClaimsForWorker, getPayoutForSubmission, getSubmissionForClaim, getSubmissionTrustStatus, getWorkerReputationSummary } from "@/features/tasks/data/sampleData";
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
  const canSubmitProof = selectedClaim?.status === "active" && !existingSubmission;
  const isLocked = Boolean(selectedClaim) && !canSubmitProof;
  const reputation = getWorkerReputationSummary(reputationSummaries, workerId);

  const initialValues = useMemo(
    () => createSubmissionFormValues(selectedTask?.proofRequirements ?? [], existingSubmission),
    [selectedTask?.proofRequirements, existingSubmission],
  );

  const [values, setValues] = useState<SubmissionFormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const readinessChecks = useMemo(
    () => [
      {
        label: "Proof narrative explains what was completed",
        met: values.proofText.trim().length >= 20,
      },
      {
        label: "A reviewer can open at least one direct proof artifact",
        met: values.proofLink.trim().length > 0 || values.proofFileName.trim().length > 0,
      },
      {
        label: "Every required proof item is represented in the package",
        met: values.checklistItems.length > 0 && values.checklistItems.every((item) => item.completed),
      },
    ],
    [values.checklistItems, values.proofFileName, values.proofLink, values.proofText],
  );
  const readinessCount = readinessChecks.filter((check) => check.met).length;
  const isSubmissionReady = readinessCount === readinessChecks.length;

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
    <div className="space-y-5">
      <WorkspaceHero
        eyebrow="Worker proof"
        title="Proof is how work becomes trust."
        description="Submit evidence against the exact requirements, then track review and payout state all the way to Solana. This is where work becomes legible."
        aside={
          <ActionPanel
            eyebrow="Submission discipline"
            title="One proof package, one review standard"
            description="Map the package to the requirement list, then submit evidence a reviewer can clear or reject."
          />
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
        <div className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-950">{selectedTask ? `Submit proof for ${selectedTask.title}` : "Select a claim"}</h2>
            <p className="text-sm leading-6 text-slate-600">Strong proof reduces review friction and moves payout state forward faster.</p>
          </div>
          {selectedTask && selectedClaim ? (
            <div className="space-y-5">
              <div className="grid gap-4 xl:grid-cols-[1.04fr_0.96fr]">
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/85 p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Trust checkpoint</p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{selectedTask.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{selectedTask.description}</p>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-950 p-5 text-white">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100/70">Submission bar</p>
                  <div className="mt-4 space-y-3">
                    {selectedTask.proofRequirements.map((requirement) => (
                      <div key={requirement} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/72">
                        <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200" />
                        <span>{requirement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {reputation ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50/85 px-4 py-3 text-sm text-slate-600">
                  Trust score <span className="font-medium text-slate-950">{reputation.trustScore}</span> · {reputation.approvalRate}% approval
                </div>
              ) : null}
              {!isLocked ? (
                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1.5">
                      <p className="text-sm font-semibold text-slate-950">Submission readiness</p>
                      <p className="text-sm leading-6 text-slate-600">
                        This is the last pass before your proof becomes a poster review decision.
                      </p>
                    </div>
                    <div className={`inline-flex items-center self-start rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                      isSubmissionReady ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {readinessCount}/{readinessChecks.length} ready
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {readinessChecks.map((check) => (
                      <div key={check.label} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/85 px-4 py-3 text-sm">
                        <div
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                            check.met ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {check.met ? <BadgeCheck className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-950">{check.label}</p>
                          <p className="text-slate-600">
                            {check.met ? "Ready for poster review." : "Still incomplete in the current submission package."}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {existingSubmission?.status === "approved" ? (
                <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50/85 px-4 py-3 text-sm text-emerald-900">
                  <p>
                    Proof approved{existingSubmission.reviewedAt ? ` on ${new Date(existingSubmission.reviewedAt).toLocaleDateString()}` : ""}.
                  </p>
                  {payout ? (
                    <>
                      <p>
                        Payout state: <span className="font-medium capitalize text-emerald-950">{payout.status.replaceAll("_", " ")}</span>
                      </p>
                    </>
                  ) : null}
                </div>
              ) : null}
              {existingSubmission?.status === "rejected" ? (
                <div className="space-y-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-muted-foreground">
                  <p>
                    Proof rejected{existingSubmission.reviewedAt ? ` on ${new Date(existingSubmission.reviewedAt).toLocaleDateString()}` : ""}.
                  </p>
                  {existingSubmission.reviewerNotes ? <p>Reviewer notes: <span className="text-foreground">{existingSubmission.reviewerNotes}</span></p> : null}
                </div>
              ) : null}

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/85 p-5">
                <div className="space-y-2">
                  <Label htmlFor="proofText">Proof narrative</Label>
                  <p className="text-sm leading-6 text-slate-600">Explain what you completed and how the evidence below maps directly to the proof bar.</p>
                </div>
                <Textarea
                  id="proofText"
                  value={values.proofText}
                  disabled={isLocked}
                  onChange={(event) => setValues((current) => ({ ...current, proofText: event.target.value }))}
                  placeholder="Describe what you completed and how the attached evidence maps to the requirements."
                  className="mt-4 min-h-[180px] border-slate-200 bg-white"
                />
                {errors.proofText ? <p className="mt-2 text-sm text-destructive">{errors.proofText}</p> : null}
                {existingSubmission ? <p className="mt-2 text-xs text-muted-foreground">{getSubmissionTrustStatus(existingSubmission.status)}</p> : null}
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="proofLink">Proof link</Label>
                    <p className="text-sm leading-6 text-slate-600">Attach the most direct link a reviewer can open to verify the work.</p>
                    <Input
                      id="proofLink"
                      value={values.proofLink}
                      disabled={isLocked}
                      onChange={(event) => setValues((current) => ({ ...current, proofLink: event.target.value }))}
                      placeholder="https://example.com/proof"
                      className="mt-4 border-slate-200 bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="proofFileName">Proof file placeholder</Label>
                    <p className="text-sm leading-6 text-slate-600">Name the file package that carries screenshots, exports, or other supporting evidence.</p>
                    <Input
                      id="proofFileName"
                      value={values.proofFileName}
                      disabled={isLocked}
                      onChange={(event) => setValues((current) => ({ ...current, proofFileName: event.target.value }))}
                      placeholder="screenshots.zip"
                      className="mt-4 border-slate-200 bg-white"
                    />
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  <Label>Checklist</Label>
                  <p className="text-sm leading-6 text-slate-600">Mark each requirement only when it is actually represented in the submission package.</p>
                </div>
                <div className="mt-4 space-y-3">
                  {values.checklistItems.map((item, index) => (
                    <label key={item.label} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/85 px-4 py-3 text-sm text-slate-600">
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
                </div>
                {errors.checklistItems ? <p className="mt-3 text-sm text-destructive">{errors.checklistItems}</p> : null}
              </div>

              {!isLocked ? (
                <div className="rounded-[1.5rem] border border-slate-950 bg-slate-950 p-5 text-white shadow-[0_20px_50px_-30px_rgba(15,23,42,0.7)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100/70">Submit checkpoint</p>
                  <p className="mt-3 text-sm leading-6 text-white/72">
                    {isSubmissionReady
                      ? "This package reads as review-ready. Once submitted, the poster will judge exactly what is written here against the requirement list."
                      : "Resolve the missing checks above before submitting. The form will block missing narrative or checklist coverage, and direct artifacts make the review defensible."}
                  </p>
                  <Button className="mt-4 h-12 rounded-xl bg-white px-5 text-slate-950 hover:bg-slate-100" onClick={handleSubmit}>Submit for review</Button>
                </div>
              ) : null}
              {submitError ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{submitError}</div> : null}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Claim a task first, then return here to submit proof.</p>
          )}
        </div>

        <div className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-950">Your claimed tasks</h2>
            <p className="text-sm leading-6 text-slate-600">Choose the task whose proof you want to put under review.</p>
          </div>
          <div className="space-y-3">
            {workerClaims.map((claim) => {
              const task = tasks.find((item) => item.id === claim.taskId);
              const isSelected = selectedClaim?.id === claim.id;

              return (
                <button
                  key={claim.id}
                  type="button"
                  onClick={() => handleSelectClaim(claim.taskId)}
                  className={`w-full rounded-2xl border p-4 text-left transition-all ${
                    isSelected ? "border-slate-950 bg-slate-950 text-white shadow-[0_18px_45px_-30px_rgba(15,23,42,0.7)]" : "border-slate-200 bg-slate-50/70 hover:border-slate-300"
                  }`}
                >
                  <div className={`font-medium ${isSelected ? "text-white" : "text-slate-950"}`}>{task?.title ?? "Task"}</div>
                  <div className={`mt-1 text-sm ${isSelected ? "text-white/70" : "text-slate-500"}`}>
                    <span className="capitalize">{claim.status}</span>
                    {claim.submittedAt ? ` · submitted ${new Date(claim.submittedAt).toLocaleDateString()}` : ""}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
