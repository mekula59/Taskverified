import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/shell/PageIntro";
import { SectionCard } from "@/components/shell/SectionCard";
import { useAuth } from "@/features/auth/context/useAuth";
import { useTasks } from "@/features/tasks/context/useTasks";
import { formatMoney, getPayoutsForPoster, getWalletProfile } from "@/features/tasks/data/sampleData";

export function PosterPayoutsPage() {
  const auth = useAuth();
  const { payouts, walletProfiles, connectWallet, releasePayout } = useTasks();
  const posterId = auth.user?.id ?? "";
  const posterName = auth.profile?.fullName ?? "Poster";
  const wallet = getWalletProfile(walletProfiles, posterId);
  const posterPayouts = getPayoutsForPoster(payouts, posterId);

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Poster"
        title="Poster payouts follow approved proof through Solana-ready release."
        description="This area now tracks Solana wallet readiness and lets posters release approved payouts once both wallets are connected."
      />
      <SectionCard title="Poster wallet" description="Frontend-safe Solana wallet scaffolding for release actions.">
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
                  userId: posterId,
                  role: "poster",
                  displayName: posterName,
                })
              }
            >
              Connect Solana wallet
            </Button>
          ) : null}
        </div>
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
                  <p>Status: <span className="font-medium capitalize text-foreground">{payout.status.replaceAll("_", " ")}</span></p>
                  <p className="break-all">Worker wallet: {payout.workerWalletAddress ?? "Not connected"}</p>
                  <p className="break-all">Poster wallet: {payout.posterWalletAddress ?? "Not connected"}</p>
                  <p className="break-all">Tx signature: {payout.txSignature ?? "Not released yet"}</p>
                </div>
                {payout.status === "ready_to_release" ? (
                  <Button onClick={() => releasePayout(payout.id)}>Release on Solana</Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
