import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowRight, BadgeCheck, ShieldCheck, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context/useAuth";
import { useTasks } from "@/features/tasks/context/useTasks";
import { formatMoney, getClaimForTask, getPayoutForSubmission, getPublicTasks, getSubmissionForClaim, getTrustScoreTone, getWorkerReputationSummary } from "@/features/tasks/data/sampleData";

export function WorkerTasksPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { tasks, claims, submissions, payouts, reputationSummaries, claimTask } = useTasks();
  const isClaimEligible = auth.verification?.status === "verified";
  const publicTasks = getPublicTasks(tasks);
  const workerId = auth.user?.id ?? "";
  const workerName = auth.profile?.fullName ?? "Worker";
  const reputation = getWorkerReputationSummary(reputationSummaries, workerId);
  const [claimError, setClaimError] = useState<string | null>(null);

  const handleClaim = async (taskId: string) => {
    if (!isClaimEligible || !workerId) {
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
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] p-6 shadow-sm sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr] xl:items-start">
          <div className="space-y-5">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              Worker
            </Badge>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">Claim work that already shows you how trust will be judged.</h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600">
                Each task spells out proof requirements, single-worker availability, and payout implications before you commit. The point is not more listings. The point is cleaner judgment.
              </p>
            </div>
            {reputation ? (
              <div className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-5">
                <p className="text-sm leading-7 text-slate-600">
                  Your trust standing is <span className="font-semibold text-slate-950">{getTrustScoreTone(reputation.trustScore).toLowerCase()}</span> at{" "}
                  <span className="font-semibold text-slate-950">{reputation.trustScore}</span>, with {reputation.approvalRate}% approval and {reputation.payoutsReleased} released Solana payouts.
                </p>
              </div>
            ) : null}
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-5 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-100/70">Claim discipline</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
                <ShieldCheck className="h-5 w-5 text-emerald-200" />
                <p className="mt-4 text-sm font-semibold">Proof visible up front</p>
                <p className="mt-2 text-sm leading-6 text-white/68">You know the review bar before claiming.</p>
              </div>
              <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
                <BadgeCheck className="h-5 w-5 text-emerald-200" />
                <p className="mt-4 text-sm font-semibold">Poster identity attached</p>
                <p className="mt-2 text-sm leading-6 text-white/68">Trust begins with who posted the work and how they review.</p>
              </div>
              <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
                <Wallet className="h-5 w-5 text-emerald-200" />
                <p className="mt-4 text-sm font-semibold">Payout state is explicit</p>
                <p className="mt-2 text-sm leading-6 text-white/68">Approved work carries a visible path toward Solana release.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {claimError ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{claimError}</div> : null}
      <div className="grid gap-6 xl:grid-cols-2">
        {publicTasks.map((task) => (
          <div key={task.id} className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="rounded-full">
                      Posted by {task.posterName}
                    </Badge>
                    <Badge variant="secondary" className="rounded-full capitalize">
                      {task.status}
                    </Badge>
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{task.title}</h2>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{task.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Reward</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-950">{formatMoney(task.rewardAmount, task.rewardCurrency)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-5 px-6 py-5">
              <div className="grid gap-4 lg:grid-cols-[1.02fr_0.98fr]">
                <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50/85 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Proof bar before claim</p>
                  <div className="mt-4 space-y-3">
                    {task.proofRequirements.map((item) => (
                      <div key={item} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                        <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[1.35rem] border border-slate-200 bg-slate-950 p-4 text-white">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100/70">Trust signal</p>
                    <p className="mt-3 text-sm leading-6 text-white/72">
                      Explicit proof requirements are visible before claim, and payout only advances after review against that evidence.
                    </p>
                  </div>

                  <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50/85 p-4">
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>
                        Claim slot {task.claimCount >= task.claimLimit ? "filled" : "open"}
                      </span>
                      <span className="capitalize">{task.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              {(() => {
                const existingClaim = getClaimForTask(claims, task.id, workerId);
                const submission = existingClaim ? getSubmissionForClaim(submissions, existingClaim.id) : undefined;
                const payout = submission ? getPayoutForSubmission(payouts, submission.id) : undefined;

                if (!isClaimEligible) {
                  return (
                    <div className="rounded-xl border border-slate-200 bg-slate-50/85 px-4 py-3 text-sm text-slate-600">
                      Claiming stays locked until your verification clears.
                    </div>
                  );
                }

                if (existingClaim) {
                  return (
                    <div className="flex flex-col gap-3 rounded-[1.35rem] border border-slate-200 bg-slate-50/85 px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Current worker state</p>
                      <p className="text-sm text-slate-600">
                        You already hold this task. Current status: <span className="font-medium capitalize text-slate-950">{existingClaim.status}</span>
                      </p>
                      {payout ? (
                        <p className="text-sm text-slate-600">
                          Solana payout: <span className="font-medium capitalize text-slate-950">{payout.status.replaceAll("_", " ")}</span>
                        </p>
                      ) : null}
                      <Button variant="outline" onClick={() => navigate(`/worker/submissions?taskId=${task.id}`)}>
                        {existingClaim.status === "active" ? "Submit proof" : "View proof submission"}
                      </Button>
                    </div>
                  );
                }

                return (
                  <div className="rounded-[1.35rem] border border-slate-950 bg-slate-950 p-4 text-white shadow-[0_20px_50px_-30px_rgba(15,23,42,0.7)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100/70">Claim checkpoint</p>
                    <p className="mt-3 text-sm leading-6 text-white/72">Claiming means you accept the proof bar already shown above and move this task into your proof workflow.</p>
                    <Button className="mt-4 h-12 rounded-xl bg-white px-5 text-slate-950 hover:bg-slate-100" onClick={() => handleClaim(task.id)} disabled={task.status !== "open"}>
                      Claim task
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
