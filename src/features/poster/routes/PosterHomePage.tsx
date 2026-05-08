import { Link } from "react-router-dom";

import { MetricCard } from "@/components/shell/MetricCard";
import { SectionCard } from "@/components/shell/SectionCard";
import { ActionPanel, EmptyState, LedgerHeader, LedgerObject, StatusPill, WorkspaceHero } from "@/components/shell/WorkspacePrimitives";
import { getStatusTone } from "@/components/shell/workspaceStatus";
import { useAuth } from "@/features/auth/context/useAuth";
import { SolanaWalletStatusCard } from "@/features/solana/components/SolanaWalletStatusCard";
import { useTasks } from "@/features/tasks/context/useTasks";
import { Button } from "@/components/ui/button";
import { getPosterDashboardMetrics, getTasksForPoster, formatMoney } from "@/features/tasks/data/sampleData";
import { formatClaimAvailability } from "@/features/tasks/lib/claimSlots";
import { getPosterReleaseRecord, payoutRailCopy } from "@/features/tasks/lib/payoutRail";

export function PosterHomePage() {
  const auth = useAuth();
  const { tasks, payouts } = useTasks();
  const metrics = getPosterDashboardMetrics(tasks, payouts, auth.user?.id ?? "");
  const posterTasks = auth.user ? getTasksForPoster(tasks, auth.user.id) : [];
  const releaseRecord = getPosterReleaseRecord(payouts, auth.user?.id ?? "");

  return (
    <div className="space-y-5">
      <WorkspaceHero
        eyebrow="Poster ledger"
        title={`${auth.profile?.fullName ?? "Poster"} dashboard`}
        description="Start with posted work, review pressure, and the wallet state that affects payout release. Create the bar, judge the proof, release deliberately."
        action={
          <Button asChild>
            <Link to="/poster/tasks/new">Create task</Link>
          </Button>
        }
        aside={
          <ActionPanel
            eyebrow="Release authority"
            title="Poster identity owns review and release"
            description="Workers need to know who set the proof bar and who can move an approved payout to release."
          />
        }
      />
      <div className="grid gap-4 lg:grid-cols-[1.18fr_0.82fr]">
        <LedgerObject>
          <LedgerHeader
            eyebrow={<StatusPill tone="info">Live tasks</StatusPill>}
            title="Posted work and claim state"
            description="Tasks stay tied to reward, worker slots, and the proof consequence workers accepted."
          />
          <div className="space-y-3 p-5">
            {posterTasks.length > 0 ? (
              posterTasks.map((task) => (
                <div key={task.id} className="rounded-2xl bg-slate-50/80 p-4 ring-1 ring-slate-200/80">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold tracking-tight text-slate-950">{task.title}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        <StatusPill tone={getStatusTone(task.status)} className="mr-2 capitalize">{task.status}</StatusPill>
                        {formatClaimAvailability(task)}
                      </p>
                    </div>
                    <StatusPill tone="dark">{formatMoney(task.rewardAmount, task.rewardCurrency)}</StatusPill>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="No poster tasks yet" description="Created tasks will appear here with their claim and proof state once posted." />
            )}
          </div>
        </LedgerObject>
        <div className="space-y-4">
          <SectionCard title="Release obligation">
            <div className="space-y-3 text-sm leading-6 text-slate-600">
              <p>
                <span className="font-medium text-slate-950">{payoutRailCopy.releaseObligation}</span> Workers can judge your release record before claiming.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/85 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Approved</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{releaseRecord.approvedPayouts}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/85 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Released</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{releaseRecord.releasedPayouts}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/85 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Awaiting</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{releaseRecord.awaitingRelease}</p>
                </div>
              </div>
            </div>
          </SectionCard>
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
