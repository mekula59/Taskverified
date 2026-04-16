import { Badge } from "@/components/ui/badge";
import { PageIntro } from "@/components/shell/PageIntro";
import { SectionCard } from "@/components/shell/SectionCard";
import { getPublicTasks, formatMoney } from "@/features/tasks/data/sampleData";

export function TaskDirectoryPage() {
  const tasks = getPublicTasks();

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Public"
        title="Public tasks expose the proof model up front."
        description="The sample data layer now drives task cards from a typed entity so the task list can move to Supabase later without changing the route shape."
      />
      <div className="grid gap-6 xl:grid-cols-3">
        {tasks.map((task) => (
          <SectionCard key={task.id} title={task.title} description={task.description}>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Reward</span>
                <span className="font-medium text-foreground">{formatMoney(task.rewardAmount, task.rewardCurrency)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Claims</span>
                <span>{task.claimCount} / {task.claimLimit}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {task.proofRequirements.map((item) => (
                  <Badge key={item} variant="secondary" className="rounded-full">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
