import { MetricCard } from "@/components/shell/MetricCard";
import { PageIntro } from "@/components/shell/PageIntro";
import { SectionCard } from "@/components/shell/SectionCard";
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

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Worker"
        title="Trust is earned through verification, review, and release."
        description="TaskVerified reputation is a compact trust layer. It measures whether your proof gets approved and whether approved work reaches released Solana payout state."
      />

      {summary ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Trust score" value={String(summary.trustScore)} detail={`${getTrustScoreTone(summary.trustScore)} confidence based on real task outcomes.`} />
            <MetricCard label="Verification" value={summary.verificationStatus} detail="Verified workers start with stronger claim trust." />
            <MetricCard label="Tasks completed" value={String(summary.tasksCompleted)} detail={`${summary.approvalRate}% approval rate across reviewed submissions.`} />
            <MetricCard label="Payouts released" value={String(summary.payoutsReleased)} detail="Released Solana payouts confirm work closed cleanly." />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <SectionCard title="How trust is calculated" description="Simple, explainable inputs only. No social mechanics.">
              <div className="space-y-3 text-sm text-muted-foreground">
                {summary.explanation.map((item) => (
                  <div key={item} className="rounded-xl border border-border/60 bg-background/70 px-4 py-3">
                    {item}
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Category strengths" description="Derived from approved or reviewed work already in the shell.">
              <div className="space-y-3">
                {summary.categoryStrengths.length > 0 ? (
                  summary.categoryStrengths.map((strength) => (
                    <div key={strength.category} className="rounded-xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">{formatCategoryLabel(strength.category)}</p>
                      <p className="mt-2">{strength.completedCount} approved completions</p>
                      <p className="mt-2">{strength.approvalRate}% approval rate</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Category strengths will appear after your reviewed work starts to accumulate.</p>
                )}
              </div>
            </SectionCard>
          </div>

          <SectionCard title="Recent trust events" description="The latest trust-relevant activity recorded for this worker.">
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="rounded-xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium text-foreground">{event.detail}</p>
                    <p className={event.scoreDelta >= 0 ? "font-medium text-foreground" : "font-medium text-destructive"}>
                      {event.scoreDelta >= 0 ? `+${event.scoreDelta}` : event.scoreDelta}
                    </p>
                  </div>
                  <p className="mt-2 capitalize">{event.type.replaceAll("_", " ")}</p>
                  <p className="mt-2">{new Date(event.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </>
      ) : (
        <SectionCard title="No reputation summary yet">
          <p className="text-sm text-muted-foreground">Trust summary will appear once this worker profile has verification or reviewed task activity.</p>
        </SectionCard>
      )}
    </div>
  );
}
