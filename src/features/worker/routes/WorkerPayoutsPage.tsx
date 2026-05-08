import { SectionCard } from "@/components/shell/SectionCard";
import { EmptyState, LedgerHeader, LedgerObject, LedgerRows, StatusPill, WorkspaceHero } from "@/components/shell/WorkspacePrimitives";
import { getStatusTone } from "@/components/shell/workspaceStatus";
import { useAuth } from "@/features/auth/context/useAuth";
import { formatLamportsAsSol } from "@/features/solana/lib/payoutExecution";
import { SolanaWalletStatusCard } from "@/features/solana/components/SolanaWalletStatusCard";
import { useTasks } from "@/features/tasks/context/useTasks";
import { formatRewardReference, getPayoutsForWorker, getWalletProfile } from "@/features/tasks/data/sampleData";
import { payoutRailCopy } from "@/features/tasks/lib/payoutRail";
import type { PayoutRecord } from "@/features/shared/types/domain";

function getWorkerPayoutMessage(payout: PayoutRecord) {
  if (payout.status === "ready_to_release") {
    return "Approved, awaiting SOL release. The poster is expected to release after approval.";
  }

  if (payout.status === "released") {
    return "Released through the Solana-backed devnet SOL release flow and recorded in TaskVerified.";
  }

  if (payout.status === "failed") {
    return payout.txSignature
      ? "A transaction signature exists, but release finalization needs recovery."
      : "SOL release failed before a final transaction signature was recorded.";
  }

  return "SOL release is not ready until proof clears review and both wallet records are present.";
}

export function WorkerPayoutsPage() {
  const auth = useAuth();
  const { payouts, walletProfiles } = useTasks();
  const workerId = auth.user?.id ?? "";
  const workerName = auth.profile?.fullName ?? "Worker";
  const wallet = getWalletProfile(walletProfiles, workerId);
  const workerPayouts = getPayoutsForWorker(payouts, workerId);

  return (
    <div className="space-y-5">
      <WorkspaceHero
        eyebrow="Worker payouts"
        title="Payout visibility follows approved proof through Solana-ready release."
        description="Workers can connect Phantom here and see whether approved proof is still waiting on poster-released SOL release."
      />
      <SectionCard title="Worker wallet" description="Phantom-first connection for the current payout flow.">
        <SolanaWalletStatusCard userId={workerId} role="worker" displayName={workerName} />
      </SectionCard>

      <SectionCard title="Payout records" description="Wallet-linked payout visibility tied to approved proof.">
        <div className="min-w-0 space-y-4">
          {workerPayouts.length > 0 ? (
            workerPayouts.map((payout) => (
              <LedgerObject key={payout.id}>
                <LedgerHeader
                  eyebrow={<StatusPill tone={getStatusTone(payout.status)}>{payout.status.replaceAll("_", " ")}</StatusPill>}
                  title={`${formatRewardReference(payout.amount)} reward reference`}
                  description={`Release transfer: devnet SOL target ${formatLamportsAsSol(payout.transferAmountLamports)}.`}
                />
                <div className="min-w-0 space-y-4 p-5">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/85 px-4 py-3 text-sm leading-6 text-slate-600">
                    <span className="font-medium text-slate-950">Release model:</span> {getWorkerPayoutMessage(payout)}
                  </div>
                  {payout.status === "ready_to_release" ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                      {payoutRailCopy.releaseObligation} Proof history and payout records keep the review trail visible while dispute handling is being formalized.
                    </div>
                  ) : null}
                  <LedgerRows
                    rows={[
                      { label: "Reward", value: formatRewardReference(payout.amount) },
                      { label: "Payout rail", value: "SOL on Solana devnet" },
                      { label: "Release transfer", value: `devnet SOL target ${formatLamportsAsSol(payout.transferAmountLamports)}` },
                      { label: "Release model", value: "poster-released after approved proof" },
                      { label: "Status", value: <span className="capitalize">{payout.status.replaceAll("_", " ")}</span> },
                      { label: "Worker wallet", value: payout.workerWalletAddress ?? "Not connected", valueClassName: "tv-long-token font-mono text-xs leading-5" },
                      { label: "Poster wallet", value: payout.posterWalletAddress ?? "Not connected", valueClassName: "tv-long-token font-mono text-xs leading-5" },
                      { label: "Tx signature", value: payout.txSignature ?? "Not released yet", valueClassName: "tv-long-token font-mono text-xs leading-5" },
                    ]}
                  />
                  {payout.failureReason ? (
                    <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-900 ring-1 ring-rose-200">
                      Failure reason: <span className="font-medium">{payout.failureReason}</span>
                    </div>
                  ) : null}
                </div>
              </LedgerObject>
            ))
          ) : (
            <EmptyState title="No worker payouts yet" description="Approved work that reaches payout state will appear here with wallet and release truth attached." />
          )}
        </div>
        {wallet?.status !== "connected" ? (
          <p className="mt-4 text-sm text-muted-foreground">Connect Phantom to set the live payout destination for future approved work.</p>
        ) : null}
      </SectionCard>
    </div>
  );
}
