import { SectionCard } from "@/components/shell/SectionCard";
import { EmptyState, LedgerHeader, LedgerObject, LedgerRows, StatusPill, WorkspaceHero } from "@/components/shell/WorkspacePrimitives";
import { getStatusTone } from "@/components/shell/workspaceStatus";
import { useAuth } from "@/features/auth/context/useAuth";
import { formatLamportsAsSol } from "@/features/solana/lib/payoutExecution";
import { SolanaWalletStatusCard } from "@/features/solana/components/SolanaWalletStatusCard";
import { useTasks } from "@/features/tasks/context/useTasks";
import { formatMoney, getPayoutsForWorker, getWalletProfile } from "@/features/tasks/data/sampleData";

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
        description="Workers can connect a real Phantom wallet on Solana devnet here and route approved payouts to the connected destination address."
      />
      <SectionCard title="Worker wallet" description="Real Phantom-first connection for demo payouts on Solana devnet.">
        <SolanaWalletStatusCard userId={workerId} role="worker" displayName={workerName} />
      </SectionCard>

      <SectionCard title="Payout records" description="Wallet-linked payout visibility tied to approved proof.">
        <div className="space-y-4">
          {workerPayouts.length > 0 ? (
            workerPayouts.map((payout) => (
              <LedgerObject key={payout.id}>
                <LedgerHeader
                  eyebrow={<StatusPill tone={getStatusTone(payout.status)}>{payout.status.replaceAll("_", " ")}</StatusPill>}
                  title={`${formatMoney(payout.amount, "USD")} / ${payout.currencyToken}`}
                  description={`Devnet transfer target ${formatLamportsAsSol(payout.transferAmountLamports)}.`}
                />
                <div className="space-y-4 p-5">
                  <LedgerRows
                    rows={[
                      { label: "Status", value: <span className="capitalize">{payout.status.replaceAll("_", " ")}</span> },
                      { label: "Worker wallet", value: payout.workerWalletAddress ?? "Not connected", valueClassName: "font-mono text-xs leading-5 break-all" },
                      { label: "Poster wallet", value: payout.posterWalletAddress ?? "Not connected", valueClassName: "font-mono text-xs leading-5 break-all" },
                      { label: "Tx signature", value: payout.txSignature ?? "Not released yet", valueClassName: "font-mono text-xs leading-5 break-all" },
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
