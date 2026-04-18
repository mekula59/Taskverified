import { BadgeCheck, ShieldCheck, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/context/useAuth";
import { useTasks } from "@/features/tasks/context/useTasks";
import {
  formatCategoryLabel,
  getReputationEventsForWorker,
  getWorkerReputationSummary,
  getTrustScoreTone,
} from "@/features/tasks/data/sampleData";

export function WorkerReputationPage() {
  const auth = useAuth();
  const { reputationEvents, reputationSummaries } = useTasks();
  const workerId = auth.user?.id ?? "";
  const summary = getWorkerReputationSummary(reputationSummaries, workerId);
  const events = getReputationEventsForWorker(reputationEvents, workerId).slice(0, 5);
  const trustTone = summary ? getTrustScoreTone(summary.trustScore) : null;

  return (
    <div className="space-y-8">
      {summary ? (
        <>
          <section className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] p-6 shadow-sm sm:p-8">
            <div className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr] xl:items-start">
              <div className="space-y-5">
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  Worker
                </Badge>
                <div className="space-y-3">
                  <h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">Trust should read like an earned operating state.</h1>
                  <p className="max-w-2xl text-base leading-7 text-slate-600">
                    Your standing comes from verification, reviewed proof, and whether approved work actually closes into released payout state. The point is not a score display. The point is whether your work keeps clearing.
                  </p>
                </div>
                <div className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_20px_55px_-34px_rgba(15,23,42,0.72)]">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-100/70">Current trust standing</p>
                      <h2 className="text-3xl font-semibold tracking-tight text-white">{trustTone}</h2>
                      <p className="max-w-lg text-sm leading-6 text-white/72">
                        Verification status is <span className="font-semibold capitalize text-white">{summary.verificationStatus}</span>. Recent outcomes put this worker at a trust score of{" "}
                        <span className="font-semibold text-white">{summary.trustScore}</span>.
                      </p>
                    </div>
                    <div className="rounded-[1.35rem] border border-white/10 bg-white/5 px-5 py-4 text-left sm:min-w-[172px]">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">Trust score</p>
                      <p className="mt-2 text-4xl font-semibold text-white">{summary.trustScore}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-5">
                  <ShieldCheck className="h-5 w-5 text-emerald-700" />
                  <p className="mt-4 text-sm font-semibold text-slate-950">Verification establishes claim eligibility</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Current status: <span className="font-medium capitalize text-slate-950">{summary.verificationStatus}</span>.</p>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-5">
                  <BadgeCheck className="h-5 w-5 text-emerald-700" />
                  <p className="mt-4 text-sm font-semibold text-slate-950">Reviewed proof clears or weakens trust</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{summary.approvalRate}% approval rate across <span className="font-medium text-slate-950">{summary.tasksCompleted}</span> completed tasks.</p>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-5">
                  <Wallet className="h-5 w-5 text-emerald-700" />
                  <p className="mt-4 text-sm font-semibold text-slate-950">Released payout confirms clean closure</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600"><span className="font-medium text-slate-950">{summary.payoutsReleased}</span> payouts have reached released state.</p>
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
            <div className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-slate-950">Why your trust reads this way</h2>
                <p className="text-sm leading-6 text-slate-600">Only explainable task outcomes are counted. No social mechanics, no vanity signals.</p>
              </div>
              <div className="mt-5 space-y-3">
                {summary.explanation.map((item) => (
                  <div key={item} className="rounded-[1.35rem] border border-slate-200 bg-slate-50/85 px-4 py-3 text-sm leading-6 text-slate-600">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-slate-950">Category evidence</h2>
                  <p className="text-sm leading-6 text-slate-600">Strength only appears where reviewed work has actually accumulated.</p>
                </div>
                <div className="mt-5 space-y-3">
                  {summary.categoryStrengths.length > 0 ? (
                    summary.categoryStrengths.map((strength) => (
                      <div key={strength.category} className="rounded-[1.35rem] border border-slate-200 bg-slate-50/85 p-4 text-sm leading-6 text-slate-600">
                        <p className="font-semibold text-slate-950">{formatCategoryLabel(strength.category)}</p>
                        <p className="mt-2">{strength.completedCount} approved completions</p>
                        <p className="mt-1">{strength.approvalRate}% approval rate</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50/85 p-4 text-sm leading-6 text-slate-600">
                      Category strengths will appear after reviewed work starts to accumulate.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-slate-950">Recent trust events</h2>
                  <p className="text-sm leading-6 text-slate-600">Latest outcome changes recorded against this worker.</p>
                </div>
                <div className="mt-5 space-y-3">
                  {events.map((event) => (
                    <div key={event.id} className="rounded-[1.35rem] border border-slate-200 bg-slate-50/85 p-4 text-sm leading-6 text-slate-600">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-semibold text-slate-950">{event.detail}</p>
                        <p className={event.scoreDelta >= 0 ? "font-semibold text-emerald-700" : "font-semibold text-rose-700"}>
                          {event.scoreDelta >= 0 ? `+${event.scoreDelta}` : event.scoreDelta}
                        </p>
                      </div>
                      <p className="mt-2 capitalize">{event.type.replaceAll("_", " ")}</p>
                      <p className="mt-1 text-slate-500">{new Date(event.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <section className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] p-6 shadow-sm sm:p-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              Worker
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">Trust history appears only after real outcomes exist.</h1>
            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50/85 p-5 text-sm leading-7 text-slate-600">
              Trust summary will appear once this worker profile has verification or reviewed task activity.
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
