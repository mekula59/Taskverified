import { PageIntro } from "@/components/shell/PageIntro";
import { EmptyState, LedgerHeader, LedgerObject, LedgerRows, ProofList, StatusPill } from "@/components/shell/WorkspacePrimitives";
import { getStatusTone } from "@/components/shell/workspaceStatus";
import { useAuth } from "@/features/auth/context/useAuth";
import { useTasks } from "@/features/tasks/context/useTasks";
import { formatMoney, getPayoutsForPoster, getTasksForPoster } from "@/features/tasks/data/sampleData";
import { formatClaimAvailability, formatClaimProgress } from "@/features/tasks/lib/claimSlots";
import { getPayoutReleaseCopy, payoutRailCopy } from "@/features/tasks/lib/payoutRail";

export function PosterTasksPage() {
  const auth = useAuth();
  const { tasks, payouts } = useTasks();
  const posterTasks = auth.user ? getTasksForPoster(tasks, auth.user.id) : [];
  const posterPayouts = auth.user ? getPayoutsForPoster(payouts, auth.user.id) : [];

  return (
    <div className="space-y-5">
      <PageIntro
        eyebrow="Poster"
        title="Posted tasks"
        description="Track the tasks you created, the proof bar workers must clear, and the payout state each task can create."
      />
      <div className="grid gap-4 xl:grid-cols-2">
        {posterTasks.map((task) => (
          <LedgerObject key={task.id}>
            <LedgerHeader
              eyebrow={<StatusPill tone={getStatusTone(task.status)} className="capitalize">{task.status}</StatusPill>}
              title={task.title}
              description={task.description}
              meta={<StatusPill tone="dark">{formatMoney(task.rewardAmount, task.rewardCurrency)}</StatusPill>}
            />
            <div className="space-y-4 p-5">
              <ProofList items={task.proofRequirements} />
              <LedgerRows
                rows={[
                  { label: "Status", value: <span className="capitalize">{task.status}</span> },
                  { label: "Deadline", value: new Date(task.deadlineAt).toLocaleDateString() },
                  { label: "Worker slots", value: formatClaimProgress(task) },
                  { label: "Claim state", value: task.claimCount >= task.claimLimit ? "Claim slots filled" : formatClaimAvailability(task) },
                  { label: "Payout asset", value: "SOL" },
                  { label: "Network", value: "Solana devnet" },
                  { label: "Release model", value: "poster-released after approved proof" },
                  {
                    label: "Payout",
                    value: (() => {
                      const payout = posterPayouts.find((item) => item.taskId === task.id);
                      return payout ? getPayoutReleaseCopy(payout).label : "Not created";
                    })(),
                  },
                ]}
              />
              <div className="rounded-2xl border border-cyan-200 bg-cyan-50/85 px-4 py-3 text-sm leading-6 text-cyan-950">
                {payoutRailCopy.releaseObligation} Workers can see the payout-release trail for approved work.
              </div>
            </div>
          </LedgerObject>
        ))}
      </div>
      {posterTasks.length === 0 ? (
        <EmptyState title="No posted tasks yet" description="Created tasks will appear here with proof requirements, claim state, and payout consequence." />
      ) : null}
    </div>
  );
}
