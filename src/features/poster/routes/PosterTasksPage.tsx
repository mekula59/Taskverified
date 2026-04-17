import { Badge } from "@/components/ui/badge";
import { PageIntro } from "@/components/shell/PageIntro";
import { SectionCard } from "@/components/shell/SectionCard";
import { useAuth } from "@/features/auth/context/useAuth";
import { useTasks } from "@/features/tasks/context/useTasks";
import { formatMoney, getPayoutsForPoster, getTasksForPoster } from "@/features/tasks/data/sampleData";

export function PosterTasksPage() {
  const auth = useAuth();
  const { tasks, payouts } = useTasks();
  const posterTasks = auth.user ? getTasksForPoster(tasks, auth.user.id) : [];
  const posterPayouts = auth.user ? getPayoutsForPoster(payouts, auth.user.id) : [];

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Poster"
        title="Posted tasks"
        description="These cards now come from the canonical backend task model so task creation, task listing, and dashboards stay in sync."
      />
      <div className="grid gap-6 xl:grid-cols-2">
        {posterTasks.map((task) => (
          <SectionCard key={task.id} title={task.title} description={task.description}>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Reward</span>
                <span className="font-medium text-foreground">{formatMoney(task.rewardAmount, task.rewardCurrency)}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {task.proofRequirements.map((item) => (
                  <Badge key={item} variant="secondary" className="rounded-full">
                    {item}
                  </Badge>
                ))}
              </div>
              <div className="rounded-xl border border-border/60 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                Status: <span className="font-medium capitalize text-foreground">{task.status}</span>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                Deadline: <span className="font-medium text-foreground">{new Date(task.deadlineAt).toLocaleDateString()}</span>
              </div>
              {(() => {
                const payout = posterPayouts.find((item) => item.taskId === task.id);
                return payout ? (
                  <div className="rounded-xl border border-border/60 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                    Solana payout: <span className="font-medium capitalize text-foreground">{payout.status.replaceAll("_", " ")}</span>
                  </div>
                ) : null;
              })()}
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
