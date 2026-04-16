import { Badge } from "@/components/ui/badge";
import { PageIntro } from "@/components/shell/PageIntro";
import { SectionCard } from "@/components/shell/SectionCard";
import { useAuth } from "@/features/auth/context/useAuth";
import { useTasks } from "@/features/tasks/context/useTasks";
import { formatMoney, getPublicTasks } from "@/features/tasks/data/sampleData";

export function WorkerTasksPage() {
  const auth = useAuth();
  const { tasks } = useTasks();
  const isClaimEligible = auth.verification?.status === "verified";
  const publicTasks = getPublicTasks(tasks);

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Worker"
        title="Claimable work"
        description="Task cards are now backed by a task entity and respect verification state in the UI foundation."
      />
      <div className="grid gap-6 xl:grid-cols-2">
        {publicTasks.map((task) => (
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
                {isClaimEligible ? "Claim action will be enabled once backend mutations are connected." : "Claiming is blocked until verification clears."}
              </div>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
