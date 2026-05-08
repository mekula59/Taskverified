import { useState } from "react";
import { AlertTriangle, ArrowRight, ShieldCheck, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/shell/SectionCard";
import { ActionPanel, WorkspaceHero } from "@/components/shell/WorkspacePrimitives";
import { useAuth } from "@/features/auth/context/useAuth";
import { formatLamportsAsSol, executeDevnetPayoutTransfer } from "@/features/solana/lib/payoutExecution";
import { SolanaWalletStatusCard } from "@/features/solana/components/SolanaWalletStatusCard";
import { useTasks } from "@/features/tasks/context/useTasks";
import { formatMoney, getPayoutsForPoster, getWalletProfile } from "@/features/tasks/data/sampleData";
import { getPosterReleaseRecord, payoutRailCopy } from "@/features/tasks/lib/payoutRail";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { cn } from "@/lib/utils";
import type { PayoutRecord } from "@/features/shared/types/domain";

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

function hasBothPayoutWallets(payout: PayoutRecord) {
  return Boolean(payout.workerWalletAddress && payout.posterWalletAddress);
}

function isRecoverableFailedPayout(payout: PayoutRecord) {
  return payout.status === "failed" && hasBothPayoutWallets(payout) && !payout.txSignature;
}

function isFinalizationAttentionPayout(payout: PayoutRecord) {
  return payout.status === "failed" && Boolean(payout.txSignature);
}

function isHistoryPayout(payout: PayoutRecord) {
  return payout.status === "released" || payout.status === "pending" || (payout.status === "failed" && !hasBothPayoutWallets(payout));
}

function getFailedPayoutMessage(payout: PayoutRecord) {
  if (payout.txSignature) {
    return "Transaction signed on Solana. Finalization needs retry before this payout can be marked released.";
  }

  if (!payout.workerWalletAddress && !payout.posterWalletAddress) {
    return "Release failed and both wallet truths are missing. Reconnect the required wallets before retrying.";
  }

  if (!payout.workerWalletAddress) {
    return "Release failed and the worker payout wallet is missing. Reconnect the worker wallet before retrying.";
  }

  if (!payout.posterWalletAddress) {
    return "Release failed and the poster release wallet is missing. Reconnect the poster wallet before retrying.";
  }

  return "Release failed, but both wallets are present. Retry release when the poster Phantom wallet matches the payout wallet.";
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
  const releaseRecord = getPosterReleaseRecord(payouts, posterId);
  const activeReleasePayouts = posterPayouts.filter((payout) => payout.status === "ready_to_release" || isRecoverableFailedPayout(payout));
  const finalizationAttentionPayouts = posterPayouts.filter(isFinalizationAttentionPayout);
  const historyPayouts = posterPayouts.filter(isHistoryPayout);
  const readyCount = posterPayouts.filter((payout) => payout.status === "ready_to_release").length;
  const releasedCount = posterPayouts.filter((payout) => payout.status === "released").length;
  const totalReadyUsd = posterPayouts
    .filter((payout) => payout.status === "ready_to_release")
    .reduce((sum, payout) => sum + payout.amount, 0);
  const payoutSections = [
    {
      title: "Active release queue",
      description: "Ready payouts and recoverable failed releases that can be signed again.",
      payouts: activeReleasePayouts,
    },
    {
      title: "Finalization attention",
      description: "Transactions that have a recorded signature but still need finalization retry.",
      payouts: finalizationAttentionPayouts,
    },
    {
      title: "History",
      description: "Released payouts, pending wallet setup, and failed records that are not currently retryable.",
      payouts: historyPayouts,
    },
  ];
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
    let txSignature: string | null = null;

    try {
      const preparation = await preparePayoutRelease(payoutId);
      txSignature = await executeDevnetPayoutTransfer({
        connection,
        walletPublicKey: publicKey,
        sendTransaction,
        preparation,
      });

      await completePayoutRelease({
        payoutId,
        txSignature,
      });
    } catch (nextError) {
      const failureReason = nextError instanceof Error ? nextError.message : "Unable to release the payout.";
      setReleaseError(failureReason);

      try {
        await failPayoutRelease({
          payoutId,
          failureReason,
          txSignature: txSignature ?? undefined,
        });
      } catch {
        // Keep the original error visible even if backend failure recording also fails.
      }
    } finally {
      setActiveReleaseId(null);
    }
  };

  return (
    <div className="space-y-5">
      <WorkspaceHero
        eyebrow="Poster payouts"
        title="Payout release is where approval becomes final."
        description="Accepted work only becomes complete when you sign the poster-released SOL transfer with the right wallet and the devnet transaction is recorded. Escrow is planned for the next release model."
        aside={
          <ActionPanel
            eyebrow="Release queue"
            title={`${readyCount} ready · ${formatMoney(totalReadyUsd, "USD")}`}
            description={`${releasedCount} payouts have already reached released state.`}
          />
        }
      />

      <SectionCard title="Release queue" description="Each payout below is a custody event with visible wallet, transfer, and onchain state.">
        <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50/85 px-4 py-3 text-sm leading-6 text-slate-600">
          <span className="font-medium text-slate-950">{payoutRailCopy.payoutAsset}.</span> {payoutRailCopy.network}. {payoutRailCopy.releaseModel}. Escrow is planned for the next release model.
        </div>
        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-cyan-200 bg-cyan-50/85 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">Release obligation</p>
            <p className="mt-2 text-sm font-semibold text-cyan-950">{payoutRailCopy.releaseObligation}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Approved payouts</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{releaseRecord.approvedPayouts}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Released payouts</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{releaseRecord.releasedPayouts}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Awaiting release</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{releaseRecord.awaitingRelease}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 md:col-span-4">
            <p className="text-sm leading-6 text-slate-600">
              Failed/recoverable: <span className="font-semibold text-slate-950">{releaseRecord.failedRecoverable}</span>. Wallet-pending: <span className="font-semibold text-slate-950">{releaseRecord.pendingWalletSetup}</span>. Finalization attention: <span className="font-semibold text-slate-950">{releaseRecord.failedFinalization}</span>.
            </p>
          </div>
        </div>
        {releaseError ? <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-800">{releaseError}</div> : null}
        {!isLivePosterWalletConnected ? (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            Release stays blocked until the connected Phantom wallet matches the poster payout wallet.
          </div>
        ) : null}

        <div className="space-y-6">
          {posterPayouts.length === 0 ? (
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5 text-sm leading-6 text-slate-600">
              No payouts are visible for this poster yet. Approved work that reaches payout state will appear here.
            </div>
          ) : (
            payoutSections.map((group) => (
            <div key={group.title} className="space-y-3">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-slate-950">{group.title}</p>
                <p className="text-sm leading-6 text-slate-600">{group.description}</p>
              </div>

              {group.payouts.length === 0 ? (
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5 text-sm leading-6 text-slate-600">
                  No payouts in this section.
                </div>
              ) : null}

              {group.payouts.map((payout) => {
            const canAttemptRelease = payout.status === "ready_to_release" || isRecoverableFailedPayout(payout);
            const releaseButtonLabel = payout.status === "failed" ? "Retry release" : "Sign and release";

            return (
            <div key={payout.id} className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
              <div className={cn("border-b px-5 py-5", payout.status === "ready_to_release" ? "border-cyan-200 bg-cyan-50/70" : payout.status === "released" ? "border-emerald-200 bg-emerald-50/70" : payout.status === "failed" ? "border-rose-200 bg-rose-50/70" : "border-slate-200 bg-slate-50/70")}>
                <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
                  <div className="space-y-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-950">{formatMoney(payout.amount, "USD")} reward value on the SOL payout rail</p>
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
                          ? "Proof is approved, wallet custody is aligned, and this SOL release is waiting on the final poster signature. The poster is expected to release after approval."
                          : payout.status === "pending"
                            ? "The release path exists, but one or both payout wallets are still missing so the chain step cannot open."
                            : payout.status === "released"
                              ? "This payout has already crossed the line: signed, transferred on Solana devnet, and recorded back into TaskVerified."
                              : getFailedPayoutMessage(payout)}
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

                    {canAttemptRelease ? (
                      <div className="flex justify-start">
                        <Button
                          className="h-12 rounded-xl bg-slate-950 px-5 text-white hover:bg-slate-800"
                          onClick={() => handleRelease(payout.id)}
                          disabled={!isLivePosterWalletConnected || activeReleaseId === payout.id}
                        >
                          {activeReleaseId === payout.id ? "Releasing on Solana..." : releaseButtonLabel}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : null}

                    {payout.status === "ready_to_release" ? (
                      <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm leading-6 text-cyan-900">
                        Approved, awaiting SOL release. The poster is expected to release after approval; proof history and payout records keep the review trail visible while dispute handling is being formalized.
                      </div>
                    ) : null}
                    {payout.status === "pending" ? (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                        Waiting on both payout wallets before release can open.
                      </div>
                    ) : null}
                    {payout.status === "released" ? (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
                        Released on Solana devnet and written back into TaskVerified.
                      </div>
                    ) : null}
                    {payout.status === "failed" ? (
                      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-800">
                        {getFailedPayoutMessage(payout)}
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
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Reward value</p>
                        <p className="mt-2 text-sm font-semibold text-slate-950">
                          {formatMoney(payout.amount, "USD")}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Devnet SOL transfer</p>
                        <p className="mt-2 text-sm font-semibold text-slate-950">{formatLamportsAsSol(payout.transferAmountLamports)}</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Worker wallet</p>
                      <p className="mt-2 break-all text-sm font-semibold text-slate-950">{payout.workerWalletAddress ?? "Not connected"}</p>
                      <p className="mt-2 text-xs leading-5 text-slate-500">This is the destination that receives the payout if release clears.</p>
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
            );
          })}
            </div>
          ))
          )}
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <SectionCard title="Release wallet" description="The release only opens when the connected Phantom wallet matches the poster payout wallet.">
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
              <p className="mt-2 text-sm leading-6 text-white/68">Credible release means approved proof, both wallets present, the correct poster wallet connected, and a visible signature written back into the product. Escrow is planned for the next release model.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
