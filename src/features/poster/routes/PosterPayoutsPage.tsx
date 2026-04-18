import { useState } from "react";
import { AlertTriangle, ArrowRight, ShieldCheck, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/shell/SectionCard";
import { useAuth } from "@/features/auth/context/useAuth";
import { formatLamportsAsSol, executeDevnetPayoutTransfer } from "@/features/solana/lib/payoutExecution";
import { SolanaWalletStatusCard } from "@/features/solana/components/SolanaWalletStatusCard";
import { useTasks } from "@/features/tasks/context/useTasks";
import { formatMoney, getPayoutsForPoster, getWalletProfile } from "@/features/tasks/data/sampleData";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { cn } from "@/lib/utils";

function formatPayoutStatus(status: string) {
  return status.replaceAll("_", " ");
}

function getPayoutStatusClasses(status: string) {
  if (status === "released") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (status === "ready_to_release") {
    return "border-cyan-200 bg-cyan-50 text-cyan-800";
  }

  if (status === "failed") {
    return "border-rose-200 bg-rose-50 text-rose-800";
  }

  return "border-amber-200 bg-amber-50 text-amber-800";
}

export function PosterPayoutsPage() {
  const auth = useAuth();
  const { payouts, walletProfiles, preparePayoutRelease, completePayoutRelease, failPayoutRelease } = useTasks();
  const { connection } = useConnection();
  const { connected, publicKey, sendTransaction } = useWallet();
  const posterId = auth.user?.id ?? "";
  const posterName = auth.profile?.fullName ?? "Poster";
  const wallet = getWalletProfile(walletProfiles, posterId);
  const posterPayouts = getPayoutsForPoster(payouts, posterId);
  const readyCount = posterPayouts.filter((payout) => payout.status === "ready_to_release").length;
  const releasedCount = posterPayouts.filter((payout) => payout.status === "released").length;
  const totalReadyUsd = posterPayouts
    .filter((payout) => payout.status === "ready_to_release")
    .reduce((sum, payout) => sum + payout.amount, 0);
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
      <section className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] p-6 shadow-sm sm:p-8">
        <div className="space-y-4">
          <div className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Poster
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">Payout release is where approval becomes final.</h1>
          <p className="max-w-3xl text-base leading-7 text-slate-600">
            Accepted work only becomes complete when you sign the release with the right wallet and the transfer lands on Solana. This should feel like the final movement of value, not a routine admin step.
          </p>
        </div>
      </section>

      <SectionCard title="Release queue" description="Each payout below is a custody event with visible wallet, transfer, and onchain state.">
        {releaseError ? <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-800">{releaseError}</div> : null}
        {!isLivePosterWalletConnected ? (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            Release stays blocked until the connected Phantom wallet matches the poster payout wallet on Solana devnet.
          </div>
        ) : null}

        <div className="space-y-4">
          {posterPayouts.map((payout) => (
            <div key={payout.id} className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
              <div className={cn("border-b px-5 py-5", payout.status === "ready_to_release" ? "border-cyan-200 bg-cyan-50/70" : payout.status === "released" ? "border-emerald-200 bg-emerald-50/70" : payout.status === "failed" ? "border-rose-200 bg-rose-50/70" : "border-slate-200 bg-slate-50/70")}>
                <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
                  <div className="space-y-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-950">{formatMoney(payout.amount, "USD")} ready for {payout.currencyToken} release</p>
                        <p className="text-sm leading-6 text-slate-600">
                          Devnet transfer target {formatLamportsAsSol(payout.transferAmountLamports)}.
                        </p>
                      </div>
                      <div className={cn("inline-flex items-center self-start rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]", getPayoutStatusClasses(payout.status))}>
                        {formatPayoutStatus(payout.status)}
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-slate-200 bg-[#07141a] p-5 text-white">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-emerald-200" />
                        <p className="text-sm font-semibold">Solana release state</p>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-white/72">
                        {payout.status === "ready_to_release"
                          ? "Proof is approved, wallet custody is aligned, and this release is waiting on the final poster signature."
                          : payout.status === "pending"
                            ? "The release path exists, but one or both payout wallets are still missing so the chain step cannot open."
                            : payout.status === "released"
                              ? "This payout has already crossed the line: signed, transferred, and recorded back into TaskVerified."
                              : "The release attempt failed and needs inspection before another signature attempt."}
                      </p>

                      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-white/50">Transaction signature</p>
                        <p className="mt-2 break-all text-sm font-semibold text-white">{payout.txSignature ?? "Not released yet"}</p>
                      </div>

                      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-white/50">Release credibility checks</p>
                        <div className="mt-3 space-y-3 text-sm">
                          <div className="flex items-start justify-between gap-4">
                            <span className="text-white/70">Approved proof exists</span>
                            <span className="font-semibold text-white">{payout.submissionId ? "Yes" : "Missing"}</span>
                          </div>
                          <div className="flex items-start justify-between gap-4">
                            <span className="text-white/70">Worker wallet destination</span>
                            <span className="font-semibold text-white">{payout.workerWalletAddress ? "Ready" : "Missing"}</span>
                          </div>
                          <div className="flex items-start justify-between gap-4">
                            <span className="text-white/70">Poster release wallet</span>
                            <span className="font-semibold text-white">{payout.posterWalletAddress ? "Ready" : "Missing"}</span>
                          </div>
                          <div className="flex items-start justify-between gap-4">
                            <span className="text-white/70">Onchain release recorded</span>
                            <span className="font-semibold text-white">{payout.txSignature ? "Yes" : "Not yet"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {payout.status === "ready_to_release" ? (
                      <div className="flex justify-start">
                        <Button
                          className="h-12 rounded-xl bg-slate-950 px-5 text-white hover:bg-slate-800"
                          onClick={() => handleRelease(payout.id)}
                          disabled={!isLivePosterWalletConnected || activeReleaseId === payout.id}
                        >
                          {activeReleaseId === payout.id ? "Releasing on Solana..." : "Sign and release"}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : null}

                    {payout.status === "ready_to_release" ? (
                      <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm leading-6 text-cyan-900">
                        Ready for signature. This is the final release moment between approved work and onchain completion.
                      </div>
                    ) : null}
                    {payout.status === "pending" ? (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                        Waiting on both payout wallets before release can open.
                      </div>
                    ) : null}
                    {payout.status === "released" ? (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
                        Released on Solana and written back into TaskVerified.
                      </div>
                    ) : null}
                    {payout.status === "failed" ? (
                      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-800">
                        Release failed. Review the reason below before retrying.
                      </div>
                    ) : null}

                    {payout.failureReason ? (
                      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-800">
                        Failure reason: <span className="font-medium text-rose-900">{payout.failureReason}</span>
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Amount</p>
                        <p className="mt-2 text-sm font-semibold text-slate-950">
                          {formatMoney(payout.amount, "USD")} / {payout.currencyToken}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Transfer</p>
                        <p className="mt-2 text-sm font-semibold text-slate-950">{formatLamportsAsSol(payout.transferAmountLamports)}</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Worker wallet</p>
                      <p className="mt-2 break-all text-sm font-semibold text-slate-950">{payout.workerWalletAddress ?? "Not connected"}</p>
                      <p className="mt-2 text-xs leading-5 text-slate-500">This is the destination that receives the demo payout if release clears.</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Poster wallet</p>
                      <p className="mt-2 break-all text-sm font-semibold text-slate-950">{payout.posterWalletAddress ?? "Not connected"}</p>
                      <p className="mt-2 text-xs leading-5 text-slate-500">The connected Phantom wallet must match this address before signature is allowed.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {posterPayouts.length === 0 ? (
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5 text-sm leading-6 text-slate-600">
              No payouts are visible for this poster yet. Approved work that reaches payout state will appear here.
            </div>
          ) : null}
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <SectionCard title="Release wallet" description="The release only opens when the connected Phantom wallet matches the poster payout wallet on Solana devnet.">
          <div className="space-y-4">
            <div className={cn("rounded-[1.5rem] border p-4", isLivePosterWalletConnected ? "border-emerald-200 bg-emerald-50/80" : "border-amber-200 bg-amber-50/80")}>
              <div className="flex items-start gap-3">
                <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", isLivePosterWalletConnected ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                  {isLivePosterWalletConnected ? <ShieldCheck className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                </div>
                <div>
                  <p className={cn("text-sm font-semibold", isLivePosterWalletConnected ? "text-emerald-900" : "text-amber-900")}>
                    {isLivePosterWalletConnected ? "Release path is unlocked" : "Release path is blocked"}
                  </p>
                  <p className={cn("mt-1 text-sm leading-6", isLivePosterWalletConnected ? "text-emerald-800" : "text-amber-800")}>
                    {isLivePosterWalletConnected
                      ? "The live Phantom wallet matches the poster payout wallet, so ready payouts can move to signature."
                      : "Connect the exact poster payout wallet before any ready release can be signed."}
                  </p>
                </div>
              </div>
            </div>

            <SolanaWalletStatusCard userId={posterId} role="poster" displayName={posterName} />
          </div>
        </SectionCard>

        <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm sm:p-8">
          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/55">Ready to release</p>
              <p className="mt-2 text-4xl font-semibold">{readyCount}</p>
            </div>
            <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/55">Release value</p>
              <p className="mt-2 text-4xl font-semibold">{formatMoney(totalReadyUsd, "USD")}</p>
            </div>
            <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/55">Released</p>
              <p className="mt-2 text-4xl font-semibold">{releasedCount}</p>
            </div>
            <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold">Loop standard</p>
              <p className="mt-2 text-sm leading-6 text-white/68">Credible release means approved proof, both wallets present, the correct poster wallet connected, and a visible signature written back into the product.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
