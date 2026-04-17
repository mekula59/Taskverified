import { useState } from "react";

import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/shell/PageIntro";
import { SectionCard } from "@/components/shell/SectionCard";
import { useAuth } from "@/features/auth/context/useAuth";
import { formatLamportsAsSol, executeDevnetPayoutTransfer } from "@/features/solana/lib/payoutExecution";
import { SolanaWalletStatusCard } from "@/features/solana/components/SolanaWalletStatusCard";
import { useTasks } from "@/features/tasks/context/useTasks";
import { formatMoney, getPayoutsForPoster, getWalletProfile } from "@/features/tasks/data/sampleData";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

export function PosterPayoutsPage() {
  const auth = useAuth();
  const { payouts, walletProfiles, preparePayoutRelease, completePayoutRelease, failPayoutRelease } = useTasks();
  const { connection } = useConnection();
  const { connected, publicKey, sendTransaction } = useWallet();
  const posterId = auth.user?.id ?? "";
  const posterName = auth.profile?.fullName ?? "Poster";
  const wallet = getWalletProfile(walletProfiles, posterId);
  const posterPayouts = getPayoutsForPoster(payouts, posterId);
  const isLivePosterWalletConnected = connected && publicKey?.toBase58() === wallet?.walletAddress;
  const [releaseError, setReleaseError] = useState<string | null>(null);
  const [activeReleaseId, setActiveReleaseId] = useState<string | null>(null);

  const handleRelease = async (payoutId: string) => {
    if (!publicKey || !isLivePosterWalletConnected) {
      setReleaseError("Connect the poster Phantom wallet before releasing a payout.");
      return;
    }

    setReleaseError(null);
    setActiveReleaseId(payoutId);

    try {
      const preparation = await preparePayoutRelease(payoutId);
      const signature = await executeDevnetPayoutTransfer({
        connection,
        walletPublicKey: publicKey,
        sendTransaction,
        preparation,
      });

      await completePayoutRelease({
        payoutId,
        txSignature: signature,
      });
    } catch (nextError) {
      const failureReason = nextError instanceof Error ? nextError.message : "Unable to release the payout.";
      setReleaseError(failureReason);

      try {
        await failPayoutRelease({
          payoutId,
          failureReason,
        });
      } catch {
        // Keep the original error visible even if backend failure recording also fails.
      }
    } finally {
      setActiveReleaseId(null);
    }
  };

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Poster"
        title="Poster payouts follow approved proof through Solana-ready release."
        description="This area now submits a real Phantom-signed Solana devnet transfer and only marks the payout released after onchain confirmation succeeds."
      />
      <SectionCard title="Poster wallet" description="Real Phantom-first connection for payout release on Solana devnet.">
        <SolanaWalletStatusCard userId={posterId} role="poster" displayName={posterName} />
      </SectionCard>

      <SectionCard title="Release queue" description="Approved submissions become Solana-shaped payouts here.">
        <div className="space-y-3">
          {posterPayouts.map((payout) => (
            <div key={payout.id} className="rounded-2xl border border-border/60 bg-background/70 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    Amount: <span className="font-medium text-foreground">{formatMoney(payout.amount, "USD")} / {payout.currencyToken}</span>
                  </p>
                  <p>
                    Devnet transfer: <span className="font-medium text-foreground">{formatLamportsAsSol(payout.transferAmountLamports)}</span>
                  </p>
                  <p>Status: <span className="font-medium capitalize text-foreground">{payout.status.replaceAll("_", " ")}</span></p>
                  <p className="break-all">Worker wallet: {payout.workerWalletAddress ?? "Not connected"}</p>
                  <p className="break-all">Poster wallet: {payout.posterWalletAddress ?? "Not connected"}</p>
                  <p className="break-all">Tx signature: {payout.txSignature ?? "Not released yet"}</p>
                  {payout.failureReason ? <p>Failure reason: <span className="text-foreground">{payout.failureReason}</span></p> : null}
                </div>
                {payout.status === "ready_to_release" ? (
                  <Button onClick={() => handleRelease(payout.id)} disabled={!isLivePosterWalletConnected || activeReleaseId === payout.id}>
                    {activeReleaseId === payout.id ? "Releasing..." : "Release on Solana"}
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
        {releaseError ? <p className="mt-4 text-sm text-destructive">{releaseError}</p> : null}
        {!isLivePosterWalletConnected ? (
          <p className="mt-4 text-sm text-muted-foreground">Poster release stays blocked until the live Phantom wallet is connected on Solana devnet.</p>
        ) : null}
      </SectionCard>
    </div>
  );
}
