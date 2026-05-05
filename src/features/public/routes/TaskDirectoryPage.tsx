import { CalendarDays, CheckCircle2, CircleDot, LockKeyhole, WalletCards } from "lucide-react";

import { PageIntro } from "@/components/shell/PageIntro";
import { LedgerRows } from "@/components/shell/WorkspacePrimitives";
import { Badge } from "@/components/ui/badge";
import { useTasks } from "@/features/tasks/context/useTasks";
import { seededTasks } from "@/features/tasks/data/taskSeeds";
import { formatCategoryLabel, formatMoney, getPublicTasks } from "@/features/tasks/data/sampleData";

function formatDeadline(deadlineAt: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(deadlineAt));
}

function getClaimState(task: { claimCount: number; claimLimit: number }) {
  if (task.claimCount >= task.claimLimit) {
    return "Filled";
  }

  return `${task.claimLimit - task.claimCount} slot open`;
}

export function TaskDirectoryPage() {
  const { tasks } = useTasks();
  const livePublicTasks = getPublicTasks(tasks);
  const publicTasks = livePublicTasks.length > 0 ? livePublicTasks : getPublicTasks(seededTasks);
  const isShowingExamples = livePublicTasks.length === 0;

  return (
    <div className="space-y-5">
      <PageIntro
        eyebrow="Public"
        title="Public tasks, shown as proof-first work objects."
        description={
          isShowingExamples
            ? "These example tasks show how TaskVerified presents reward, claim state, deadline, and proof requirements before a worker commits."
            : "Browse public tasks with visible rewards, claim state, deadline, and proof requirements before entering the worker flow."
        }
      />
      {isShowingExamples ? (
        <div className="flex gap-3 rounded-2xl bg-amber-50/80 px-4 py-3 text-sm leading-6 text-amber-950 ring-1 ring-amber-200/80">
          <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <p>
            Public examples are illustrative seeded data, not private task data. Sign in only when you are ready to claim work, submit proof, or manage payouts.
          </p>
        </div>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {publicTasks.map((task) => (
          <article key={task.id} className="tv-surface overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200/80 bg-white px-5 py-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="rounded-full capitalize">
                    {formatCategoryLabel(task.category)}
                  </Badge>
                  <Badge variant={task.status === "open" ? "success" : "outline"} className="rounded-full capitalize">
                    {task.status}
                  </Badge>
                </div>
                <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-950">{task.title}</h2>
              </div>
              <div className="rounded-2xl bg-slate-950 px-4 py-2 text-right text-white">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400">Reward</p>
                <p className="text-lg font-semibold">{formatMoney(task.rewardAmount, task.rewardCurrency)}</p>
              </div>
            </div>

            <div className="px-5 py-4">
              <p className="text-sm leading-6 text-slate-600">{task.description}</p>

              <LedgerRows
                className="mt-4"
                rows={[
                  {
                    label: (
                      <span className="inline-flex items-center gap-1.5">
                        <CircleDot className="h-3.5 w-3.5" />
                        Claim
                      </span>
                    ),
                    value: getClaimState(task),
                  },
                  {
                    label: (
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Deadline
                      </span>
                    ),
                    value: formatDeadline(task.deadlineAt),
                  },
                  {
                    label: (
                      <span className="inline-flex items-center gap-1.5">
                        <WalletCards className="h-3.5 w-3.5" />
                        Release model
                      </span>
                    ),
                    value: "Poster-controlled after approval",
                  },
                ]}
              />
              <p className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm leading-6 text-slate-600">
                Payouts are released by the poster after approved proof in this build. Escrow is planned for the next release model.
              </p>
            </div>

            <div className="border-t border-slate-200/80 bg-slate-50/70 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Proof requirement</p>
              <div className="mt-3 grid gap-2">
                {task.proofRequirements.map((item) => (
                  <div key={item} className="flex items-start gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200/80">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
