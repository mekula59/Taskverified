import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/shell/PageIntro";
import { SectionCard } from "@/components/shell/SectionCard";
import { useAuth } from "@/features/auth/context/useAuth";
import { useTasks } from "@/features/tasks/context/useTasks";
import { formatMoney, getPayoutsForWorker, getWalletProfile } from "@/features/tasks/data/sampleData";

export function WorkerPayoutsPage() {
  const auth = useAuth();
  const { payouts, walletProfiles, connectWallet } = useTasks();
  const workerId = auth.user?.id ?? "";
  const workerName = auth.profile?.fullName ?? "Worker";
  const wallet = getWalletProfile(walletProfiles, workerId);
  const workerPayouts = getPayoutsForWorker(payouts, workerId);

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Worker"
        title="Payout visibility follows approved proof through Solana-ready release."
        description="Workers can connect a Solana wallet here and see whether approved work is pending, ready to release, released, or failed."
      />
      <SectionCard title="Worker wallet" description="Frontend-safe Solana wallet connection scaffolding.">
        <div className="space-y-4">
          <div className="rounded-xl border border-border/60 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
            {wallet?.status === "connected" ? (
              <>
                Connected to Solana wallet
                <div className="mt-2 break-all font-medium text-foreground">{wallet.walletAddress}</div>
              </>
            ) : (
              "No Solana wallet connected yet."
            )}
          </div>
          {wallet?.status !== "connected" ? (
            <Button
              onClick={() =>
                connectWallet({
                  userId: workerId,
                  role: "worker",
                  displayName: workerName,
                })
              }
            >
              Connect Solana wallet
            </Button>
          ) : null}
        </div>
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
      </SectionCard>
    </div>
  );
}
