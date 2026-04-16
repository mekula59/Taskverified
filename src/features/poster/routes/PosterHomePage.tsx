import { Link } from "react-router-dom";

import { MetricCard } from "@/components/shell/MetricCard";
import { PageIntro } from "@/components/shell/PageIntro";
import { SectionCard } from "@/components/shell/SectionCard";
import { useAuth } from "@/features/auth/context/useAuth";
import { useTasks } from "@/features/tasks/context/useTasks";
import { Button } from "@/components/ui/button";
import { getPosterDashboardMetrics, getTasksForPoster, formatMoney } from "@/features/tasks/data/sampleData";

export function PosterHomePage() {
  const auth = useAuth();
  const { tasks } = useTasks();
  const metrics = getPosterDashboardMetrics(tasks, auth.user?.id ?? "");
  const posterTasks = auth.user ? getTasksForPoster(tasks, auth.user.id) : [];

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Poster"
        title={`${auth.profile?.fullName ?? "Poster"} dashboard`}
        description="The poster dashboard foundation is now wired to a typed task entity and ready for real task, review, and payout queries later."
        actions={
          <Button asChild>
            <Link to="/poster/tasks/new">Create task</Link>
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="Live task foundation" description="Current sample tasks owned by this poster.">
          <div className="space-y-3">
            {posterTasks.map((task) => (
              <div key={task.id} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium">{task.title}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      <span className="capitalize">{task.status}</span> · {task.claimCount} of {task.claimLimit} claims used
                    </div>
                  </div>
                  <div className="text-sm font-medium text-foreground">{formatMoney(task.rewardAmount, task.rewardCurrency)}</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Verification posture">
          <p className="text-sm text-muted-foreground">
            Poster verification stays visible so trust expectations apply to both sides of the platform, even before backend review tooling is added.
          </p>
        </SectionCard>
      </div>
    </div>
  );
}
