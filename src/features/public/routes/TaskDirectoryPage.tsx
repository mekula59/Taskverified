import { Badge } from "@/components/ui/badge";
import { PageIntro } from "@/components/shell/PageIntro";
import { SectionCard } from "@/components/shell/SectionCard";
import { useTasks } from "@/features/tasks/context/useTasks";
import { seededTasks } from "@/features/tasks/data/taskSeeds";
import { formatMoney, getPublicTasks } from "@/features/tasks/data/sampleData";

export function TaskDirectoryPage() {
  const { tasks } = useTasks();
  const livePublicTasks = getPublicTasks(tasks);
  const publicTasks = livePublicTasks.length > 0 ? livePublicTasks : getPublicTasks(seededTasks);
  const isShowingExamples = livePublicTasks.length === 0;

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Public"
        title="Public tasks expose the proof model up front."
        description={
          isShowingExamples
            ? "Browse example tasks that show how TaskVerified scopes work, sets a proof bar, and makes claim state visible before anyone commits."
            : "Browse public tasks with visible rewards, claim state, and proof requirements before you enter the worker flow."
        }
      />
      {isShowingExamples ? (
        <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50/80 px-5 py-4 text-sm leading-6 text-amber-900">
          These are public examples, not private task data. Sign in only when you are ready to claim work, submit proof, or manage payouts.
        </div>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-3">
        {publicTasks.map((task) => (
          <SectionCard key={task.id} title={task.title} description={task.description}>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                <span>Status</span>
                <span className="font-medium capitalize text-foreground">{task.status}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                <span>Reward</span>
                <span className="font-medium text-foreground">{formatMoney(task.rewardAmount, task.rewardCurrency)}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                <span>Claim slot</span>
                <span>{task.claimCount >= task.claimLimit ? "Filled" : "Open"}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                <span>Category</span>
                <span className="capitalize">{task.category}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {task.proofRequirements.map((item) => (
                  <Badge key={item} variant="secondary" className="max-w-full whitespace-normal rounded-full break-words text-left">
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
