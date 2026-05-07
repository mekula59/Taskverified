import { useMemo, useState } from "react";

import { WalletReadyState } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";

import { Button } from "@/components/ui/button";
import { useTasks } from "@/features/tasks/context/useTasks";
import { getWalletProfile } from "@/features/tasks/data/sampleData";
import { formatWalletAddress } from "@/features/tasks/lib/wallet";
import type { WalletRole } from "@/features/shared/types/domain";

interface SolanaWalletStatusCardProps {
  userId: string;
  role: WalletRole;
  displayName: string;
  className?: string;
}

export function SolanaWalletStatusCard({ userId, role, displayName, className }: SolanaWalletStatusCardProps) {
  const { walletProfiles, connectWallet, disconnectWallet } = useTasks();
  const { wallets, wallet, publicKey, connected, connecting, disconnecting, select, connect, disconnect } = useWallet();
  const [error, setError] = useState<string | null>(null);

  const localWallet = getWalletProfile(walletProfiles, userId);
  const phantomWallet = useMemo(() => wallets.find((item) => item.adapter.name === "Phantom"), [wallets]);
  const adapterWalletAddress = publicKey?.toBase58();
  const isPhantomAvailable =
    phantomWallet?.readyState === WalletReadyState.Installed || phantomWallet?.readyState === WalletReadyState.Loadable;

  const handleConnect = async () => {
    if (!phantomWallet || !isPhantomAvailable) {
      setError("Phantom was not detected. Install or unlock Phantom to connect on Solana devnet.");
      return;
    }

    setError(null);

    try {
      if (wallet?.adapter.name !== phantomWallet.adapter.name) {
        select(phantomWallet.adapter.name);
      }

      await connect();
    } catch {
      setError("Wallet connection was cancelled or unavailable. Unlock Phantom and try again.");
    }
  };

  const handleLinkWallet = async () => {
    if (!userId || !adapterWalletAddress) {
      setError("Connect Phantom before linking this wallet to TaskVerified.");
      return;
    }

    setError(null);

    try {
      await connectWallet({
        userId,
        role,
        displayName,
        walletAddress: adapterWalletAddress,
        provider: "phantom",
        cluster: "devnet",
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to link this wallet to TaskVerified.");
    }
  };

  const handleUnlinkWallet = async () => {
    if (!userId) {
      setError("Sign in before unlinking a TaskVerified wallet.");
      return;
    }

    setError(null);

    let disconnectError: unknown = null;

    try {
      if (connected) {
        await disconnect();
      }
    } catch (nextError) {
      disconnectError = nextError;
    }

    try {
      await disconnectWallet({ userId, role });
      if (disconnectError) {
        setError("TaskVerified unlinked this wallet, but Phantom did not fully disconnect. You can disconnect it from Phantom directly.");
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to unlink this wallet from TaskVerified.");
    }
  };

  const isLiveConnected = connected && Boolean(adapterWalletAddress);
  const linkedWalletAddress = localWallet?.status === "connected" ? localWallet.walletAddress : undefined;
  const isCurrentWalletLinked =
    isLiveConnected && Boolean(linkedWalletAddress) && linkedWalletAddress === adapterWalletAddress && localWallet?.provider === "phantom";
  const hasLinkedWallet = Boolean(linkedWalletAddress);

  return (
    <div className={className ?? "min-w-0 space-y-4"}>
      <div className="min-w-0 rounded-2xl bg-slate-50/80 px-4 py-3 text-sm leading-6 text-slate-600 ring-1 ring-slate-200/80">
        {isLiveConnected ? (
          <>
            Connected with Phantom on Solana devnet
            <div className="tv-long-token mt-2 max-w-full font-mono text-xs font-semibold leading-5 text-slate-950">{adapterWalletAddress}</div>
            {isCurrentWalletLinked ? (
              <div className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-emerald-800 ring-1 ring-emerald-200">This Phantom wallet is linked to TaskVerified.</div>
            ) : (
              <div className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-amber-800 ring-1 ring-amber-200">Phantom is connected, but this wallet is not linked to TaskVerified yet.</div>
            )}
          </>
        ) : (
          <>
            No live Solana wallet connected.
            <div className="mt-2">TaskVerified expects Phantom on devnet for the current payout flow.</div>
          </>
        )}
        {hasLinkedWallet && !isCurrentWalletLinked ? (
          <div className="mt-3 rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200/80">
            TaskVerified linked wallet
            <div className="tv-long-token mt-1 max-w-full font-mono text-xs font-semibold leading-5 text-slate-950">{linkedWalletAddress}</div>
          </div>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
        {!isLiveConnected ? (
          <Button onClick={handleConnect} disabled={connecting}>
            {connecting ? "Connecting..." : "Connect Phantom"}
          </Button>
        ) : null}
        {isLiveConnected && !isCurrentWalletLinked ? (
          <Button onClick={handleLinkWallet} disabled={!userId}>
            Link this wallet to TaskVerified
          </Button>
        ) : null}
        {hasLinkedWallet ? (
          <Button variant="outline" onClick={handleUnlinkWallet} disabled={disconnecting}>
            {disconnecting ? "Disconnecting..." : `Unlink ${formatWalletAddress(linkedWalletAddress)}`}
          </Button>
        ) : null}
      </div>

      <div className="text-xs text-slate-500">
        Provider: <span className="font-semibold text-slate-950">{wallet?.adapter.name ?? "Phantom"}</span> · Network:{" "}
        <span className="font-semibold text-slate-950">Solana devnet</span>
      </div>

      {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-800 ring-1 ring-rose-200">{error}</p> : null}
    </div>
  );
}
