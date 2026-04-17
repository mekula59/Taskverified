import { PageIntro } from "@/components/shell/PageIntro";
import { SectionCard } from "@/components/shell/SectionCard";
import { useAuth } from "@/features/auth/context/useAuth";
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
    <div className="space-y-8">
      <PageIntro
        eyebrow="Worker"
        title="Payout visibility follows approved proof through Solana-ready release."
        description="Workers can connect a real Phantom wallet on Solana devnet here and route approved payouts to the connected destination address."
      />
      <SectionCard title="Worker wallet" description="Real Phantom-first connection for demo payouts on Solana devnet.">
        <SolanaWalletStatusCard userId={workerId} role="worker" displayName={workerName} />
      </SectionCard>

      <SectionCard title="Payout records" description="Wallet-linked payout visibility tied to your approved work.">
        <div className="space-y-3">
          {workerPayouts.map((payout) => (
            <div key={payout.id} className="rounded-2xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
              <p>
                Amount: <span className="font-medium text-foreground">{formatMoney(payout.amount, "USD")} / {payout.currencyToken}</span>
              </p>
              <p className="mt-2">
                Status: <span className="font-medium capitalize text-foreground">{payout.status.replaceAll("_", " ")}</span>
              </p>
              <p className="mt-2 break-all">Worker wallet: {payout.workerWalletAddress ?? "Not connected"}</p>
              <p className="mt-2 break-all">Poster wallet: {payout.posterWalletAddress ?? "Not connected"}</p>
              <p className="mt-2 break-all">Tx signature: {payout.txSignature ?? "Not released yet"}</p>
            </div>
          ))}
        </div>
        {wallet?.status !== "connected" ? (
          <p className="mt-4 text-sm text-muted-foreground">Connect Phantom to set the live payout destination for future approved work.</p>
        ) : null}
      </SectionCard>
    </div>
  );
}
