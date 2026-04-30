import { Link } from "react-router-dom";

import { MetricCard } from "@/components/shell/MetricCard";
import { SectionCard } from "@/components/shell/SectionCard";
import { ActionPanel, EmptyState, LedgerHeader, LedgerObject, LedgerRows, StatusPill, WorkspaceHero } from "@/components/shell/WorkspacePrimitives";
import { getStatusTone } from "@/components/shell/workspaceStatus";
import { useAuth } from "@/features/auth/context/useAuth";
import { SolanaWalletStatusCard } from "@/features/solana/components/SolanaWalletStatusCard";
import { useTasks } from "@/features/tasks/context/useTasks";
import { Button } from "@/components/ui/button";
import { formatCategoryLabel, formatMoney, getClaimsForWorker, getWorkerDashboardMetrics, getWorkerReputationSummary, getTrustScoreTone } from "@/features/tasks/data/sampleData";

export function WorkerHomePage() {
  const auth = useAuth();
  const { tasks, claims, submissions, payouts, reputationSummaries } = useTasks();
  const metrics = getWorkerDashboardMetrics({
    tasks,
    claims,
    submissions,
    payouts,
    reputationSummaries,
    workerId: auth.user?.id ?? "",
    verificationStatus: auth.verification?.status ?? "unverified",
  });
  const workerClaims = auth.user ? getClaimsForWorker(claims, auth.user.id) : [];
  const reputation = auth.user ? getWorkerReputationSummary(reputationSummaries, auth.user.id) : undefined;
  const activeClaimTasks = workerClaims
    .map((claim) => tasks.find((task) => task.id === claim.taskId))
    .filter((task): task is NonNullable<typeof task> => Boolean(task));

  return (
    <div className="space-y-5">
      <WorkspaceHero
        eyebrow="Worker ledger"
        title={`Welcome, ${auth.profile?.fullName ?? "worker"}`}
        description="Start with the work and trust states that affect what you can claim, submit, and receive. Proof comes first; metrics stay supporting."
        action={
          <Button asChild>
            <Link to="/worker/tasks">Browse tasks</Link>
          </Button>
        }
        aside={
          <ActionPanel
            eyebrow="Claim eligibility"
            title={auth.verification?.status === "verified" ? "Verified workers can claim live tasks" : "Claiming is currently gated"}
            description="Verification controls access to new claims. Submitted proof and payout outcomes shape the rest of the trust record."
          >
            <StatusPill tone={getStatusTone(auth.verification?.status)}>{auth.verification?.status ?? "unverified"}</StatusPill>
          </ActionPanel>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.18fr_0.82fr]">
        <LedgerObject>
          <LedgerHeader
            eyebrow={<StatusPill tone="info">Current work</StatusPill>}
            title="Active claims and proof bars"
            description="Claimed tasks stay attached to the requirements that will decide review."
          />
          <div className="space-y-3 p-5">
            {activeClaimTasks.length > 0 ? (
              activeClaimTasks.map((task) => (
                <div key={task.id} className="rounded-2xl bg-slate-50/80 p-4 ring-1 ring-slate-200/80">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold tracking-tight text-slate-950">{task.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{task.proofRequirements.join(" · ")}</p>
                    </div>
                    <StatusPill tone="dark">{formatMoney(task.rewardAmount, task.rewardCurrency)}</StatusPill>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="No active claim selected" description="Claimed work will appear here with its proof bar and reward once you accept a task." />
            )}
          </div>
        </LedgerObject>
        <div className="space-y-4">
          <SectionCard title="Verification impact">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Verified workers can claim live tasks. Pending or unverified states remain blocked by the workflow.
              </p>
              {reputation ? (
                <div className="rounded-2xl bg-slate-50/80 p-4 ring-1 ring-slate-200/80">
                  <p className="font-medium text-foreground">
                    {getTrustScoreTone(reputation.trustScore)} trust posture · {reputation.trustScore}
                  </p>
                  <LedgerRows
                    rows={[
                      { label: "Approved", value: reputation.tasksCompleted },
                      { label: "Approval rate", value: `${reputation.approvalRate}%` },
                      { label: "Released", value: reputation.payoutsReleased },
                      { label: "Strongest", value: reputation.categoryStrengths[0] ? formatCategoryLabel(reputation.categoryStrengths[0].category) : "Still forming" },
                    ]}
                  />
                </div>
              ) : null}
            </div>
          </SectionCard>
          <SectionCard title="Solana payout destination">
            <SolanaWalletStatusCard userId={auth.user?.id ?? ""} role="worker" displayName={auth.profile?.fullName ?? "Worker"} />
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
