import { Link } from "react-router-dom";

import { MetricCard } from "@/components/shell/MetricCard";
import { PageIntro } from "@/components/shell/PageIntro";
import { SectionCard } from "@/components/shell/SectionCard";
import { useAuth } from "@/features/auth/context/useAuth";
import { useTasks } from "@/features/tasks/context/useTasks";
import { Button } from "@/components/ui/button";
import { formatCategoryLabel, formatMoney, getClaimsForWorker, getWorkerDashboardMetrics, getWorkerReputationSummary, getTrustScoreTone } from "@/features/tasks/data/sampleData";

export function WorkerHomePage() {
  const auth = useAuth();
  const { tasks, claims, submissions, payouts, reputationSummaries } = useTasks();
  const metrics = getWorkerDashboardMetrics({
    tasks,
    claims,
    submissions,
    payouts,
    reputationSummaries,
    workerId: auth.user?.id ?? "",
    verificationStatus: auth.verification?.status ?? "unverified",
  });
  const workerClaims = auth.user ? getClaimsForWorker(claims, auth.user.id) : [];
  const reputation = auth.user ? getWorkerReputationSummary(reputationSummaries, auth.user.id) : undefined;
  const activeClaimTasks = workerClaims
    .map((claim) => tasks.find((task) => task.id === claim.taskId))
    .filter((task): task is NonNullable<typeof task> => Boolean(task));

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Worker"
        title={`Welcome, ${auth.profile?.fullName ?? "worker"}`}
        description="The dashboard foundation is now wired to auth state, verification status, and typed task data instead of placeholder strings."
        actions={
          <Button asChild>
            <Link to="/worker/tasks">Browse tasks</Link>
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="Current work" description="Tasks already tied to this worker's sample claims.">
          <div className="space-y-3">
            {activeClaimTasks.map((task) => (
              <div key={task.id} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium">{task.title}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{task.proofRequirements.join(" · ")}</div>
                  </div>
                  <div className="text-sm font-medium text-foreground">{formatMoney(task.rewardAmount, task.rewardCurrency)}</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Verification impact">
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Workers with a verified status can claim live tasks. Pending or unverified states should keep the claim button disabled once backend enforcement is added.
            </p>
            {reputation ? (
              <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <p className="font-medium text-foreground">
                  {getTrustScoreTone(reputation.trustScore)} trust posture · {reputation.trustScore}
                </p>
                <p className="mt-2">
                  {reputation.tasksCompleted} approved completions, {reputation.approvalRate}% approval rate, {reputation.payoutsReleased} released Solana payouts.
                </p>
                <p className="mt-2">
                  Strongest category:{" "}
                  <span className="font-medium text-foreground">
                    {reputation.categoryStrengths[0] ? formatCategoryLabel(reputation.categoryStrengths[0].category) : "Still forming"}
                  </span>
                </p>
              </div>
            ) : null}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
