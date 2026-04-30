import { Link } from "react-router-dom";

import { MetricCard } from "@/components/shell/MetricCard";
import { PageIntro } from "@/components/shell/PageIntro";
import { SectionCard } from "@/components/shell/SectionCard";
import { useAuth } from "@/features/auth/context/useAuth";
import { SolanaWalletStatusCard } from "@/features/solana/components/SolanaWalletStatusCard";
import { useTasks } from "@/features/tasks/context/useTasks";
import { Button } from "@/components/ui/button";
import { getPosterDashboardMetrics, getTasksForPoster, formatMoney } from "@/features/tasks/data/sampleData";

export function PosterHomePage() {
  const auth = useAuth();
  const { tasks, payouts } = useTasks();
  const metrics = getPosterDashboardMetrics(tasks, payouts, auth.user?.id ?? "");
  const posterTasks = auth.user ? getTasksForPoster(tasks, auth.user.id) : [];

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Poster"
        title={`${auth.profile?.fullName ?? "Poster"} dashboard`}
        description="Start with posted work, review pressure, and the wallet state that affects payout release."
        actions={
          <Button asChild>
            <Link to="/poster/tasks/new">Create task</Link>
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[1.18fr_0.82fr]">
        <SectionCard title="Live tasks" description="Posted work with claim state and proof consequence close to the surface.">
          <div className="space-y-3">
            {posterTasks.map((task) => (
              <div key={task.id} className="rounded-xl border border-border/60 bg-background/70 p-3.5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium">{task.title}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      <span className="capitalize">{task.status}</span> · {task.claimCount >= task.claimLimit ? "claim slot filled" : "claim slot open"}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-foreground">{formatMoney(task.rewardAmount, task.rewardCurrency)}</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
        <div className="space-y-4">
          <SectionCard title="Verification posture">
            <p className="text-sm leading-6 text-muted-foreground">
              Poster identity stays visible so workers can judge who owns review and release decisions.
            </p>
          </SectionCard>
          <SectionCard title="Solana release wallet">
            <SolanaWalletStatusCard userId={auth.user?.id ?? ""} role="poster" displayName={auth.profile?.fullName ?? "Poster"} />
          </SectionCard>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} />
        ))}
      </div>
    </div>
  );
}
