import { BadgeCheck, ShieldCheck, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ActionPanel, EmptyState, LedgerHeader, LedgerObject, LedgerRows, StatusPill, WorkspaceHero } from "@/components/shell/WorkspacePrimitives";
import { getStatusTone } from "@/components/shell/workspaceStatus";
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
    <div className="space-y-5">
      {summary ? (
        <>
          <WorkspaceHero
            eyebrow="Worker reputation"
            title="Trust reads like an earned operating state."
            description="Standing comes from verification, reviewed proof, and whether approved work actually closes into released payout state."
            aside={
              <ActionPanel
                eyebrow="Current trust standing"
                title={`${trustTone} · ${summary.trustScore}`}
                description={`Verification status is ${summary.verificationStatus}. Recent outcomes set the current trust posture.`}
              >
                <StatusPill tone={getStatusTone(summary.verificationStatus)}>{summary.verificationStatus}</StatusPill>
              </ActionPanel>
            }
          />

          <div className="grid min-w-0 gap-4 sm:grid-cols-3">
                <div className="min-w-0 rounded-[1.5rem] border border-slate-200 bg-white/90 p-5">
                  <ShieldCheck className="h-5 w-5 text-emerald-700" />
                  <p className="mt-4 text-sm font-semibold text-slate-950">Verification establishes claim eligibility</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Current status: <span className="font-medium capitalize text-slate-950">{summary.verificationStatus}</span>.</p>
                </div>
                <div className="min-w-0 rounded-[1.5rem] border border-slate-200 bg-white/90 p-5">
                  <BadgeCheck className="h-5 w-5 text-emerald-700" />
                  <p className="mt-4 text-sm font-semibold text-slate-950">Reviewed proof clears or weakens trust</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{summary.approvalRate}% approval rate across <span className="font-medium text-slate-950">{summary.tasksCompleted}</span> completed tasks.</p>
                </div>
                <div className="min-w-0 rounded-[1.5rem] border border-slate-200 bg-white/90 p-5">
                  <Wallet className="h-5 w-5 text-emerald-700" />
                  <p className="mt-4 text-sm font-semibold text-slate-950">Released payout confirms clean closure</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600"><span className="font-medium text-slate-950">{summary.payoutsReleased}</span> payouts have reached released state.</p>
                </div>
          </div>

          <div className="grid min-w-0 gap-4 xl:grid-cols-[1.02fr_0.98fr]">
            <LedgerObject>
              <LedgerHeader title="Why your trust reads this way" description="Only explainable task outcomes are counted. No social mechanics, no vanity signals." />
              <div className="space-y-3 p-5">
                {summary.explanation.map((item) => (
                  <div key={item} className="rounded-[1.35rem] border border-slate-200 bg-slate-50/85 px-4 py-3 text-sm leading-6 text-slate-600">
                    {item}
                  </div>
                ))}
              </div>
            </LedgerObject>

            <div className="min-w-0 space-y-6">
              <LedgerObject>
                <LedgerHeader title="Category evidence" description="Strength only appears where reviewed work has actually accumulated." />
                <div className="space-y-3 p-5">
                  {summary.categoryStrengths.length > 0 ? (
                    summary.categoryStrengths.map((strength) => (
                      <div key={strength.category} className="rounded-[1.35rem] border border-slate-200 bg-slate-50/85 p-4 text-sm leading-6 text-slate-600">
                        <p className="font-semibold text-slate-950">{formatCategoryLabel(strength.category)}</p>
                        <p className="mt-2">{strength.completedCount} approved completions</p>
                        <p className="mt-1">{strength.approvalRate}% approval rate</p>
                      </div>
                    ))
                  ) : (
                    <EmptyState title="No category strength yet" description="Category strengths will appear after reviewed work starts to accumulate." />
                  )}
                </div>
              </LedgerObject>

              <LedgerObject>
                <LedgerHeader title="Recent trust events" description="Latest outcome changes recorded against this worker." />
                <div className="space-y-3 p-5">
                  {events.map((event) => (
                    <div key={event.id} className="min-w-0 rounded-[1.35rem] border border-slate-200 bg-slate-50/85 p-4 text-sm leading-6 text-slate-600">
                      <div className="flex min-w-0 items-center justify-between gap-4">
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
              </LedgerObject>
            </div>
          </div>
        </>
      ) : (
        <section className="tv-surface p-6 sm:p-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              Worker
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">Trust history appears only after real outcomes exist.</h1>
            <EmptyState title="Trust history has not formed yet" description="Trust summary will appear once this worker profile has verification or reviewed task activity." />
          </div>
        </section>
      )}
    </div>
  );
}
