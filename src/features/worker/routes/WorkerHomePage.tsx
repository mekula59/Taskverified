import { Link } from "react-router-dom";

import { MetricCard } from "@/components/shell/MetricCard";
import { PageIntro } from "@/components/shell/PageIntro";
import { SectionCard } from "@/components/shell/SectionCard";
import { useAuth } from "@/features/auth/context/useAuth";
import { Button } from "@/components/ui/button";
import { getWorkerDashboardMetrics, getClaimsForWorker, getPublicTasks, formatMoney } from "@/features/tasks/data/sampleData";

export function WorkerHomePage() {
  const auth = useAuth();
  const metrics = getWorkerDashboardMetrics({
    workerId: auth.user?.id ?? "",
    verificationStatus: auth.verification?.status ?? "unverified",
  });
  const claims = auth.user ? getClaimsForWorker(auth.user.id) : [];
  const activeClaimTasks = claims
    .map((claim) => getPublicTasks().find((task) => task.id === claim.taskId))
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
          <p className="text-sm text-muted-foreground">
            Workers with a verified status can claim live tasks. Pending or unverified states should keep the claim button disabled once backend enforcement is added.
          </p>
        </SectionCard>
      </div>
    </div>
  );
}
