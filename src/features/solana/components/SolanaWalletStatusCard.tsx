import { useEffect, useMemo, useState } from "react";

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

  useEffect(() => {
    if (!userId) {
      return;
    }

    if (connected && adapterWalletAddress) {
      if (
        localWallet?.status !== "connected" ||
        localWallet.walletAddress !== adapterWalletAddress ||
        localWallet.provider !== "phantom"
      ) {
        connectWallet({
          userId,
          role,
          displayName,
          walletAddress: adapterWalletAddress,
          provider: "phantom",
          cluster: "devnet",
        });
      }

      return;
    }

    if (!connecting && localWallet?.status === "connected") {
      disconnectWallet({ userId, role });
    }
  }, [adapterWalletAddress, connectWallet, connected, connecting, disconnectWallet, displayName, localWallet?.provider, localWallet?.status, localWallet?.walletAddress, role, userId]);

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

  const handleDisconnect = async () => {
    setError(null);

    try {
      await disconnect();
    } finally {
      disconnectWallet({ userId, role });
    }
  };

  const isConnected = connected && Boolean(adapterWalletAddress);
  const visibleAddress = isConnected ? adapterWalletAddress : localWallet?.walletAddress;

  return (
    <div className={className ?? "space-y-4"}>
      <div className="rounded-xl border border-border/60 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
        {isConnected ? (
          <>
            Connected with Phantom on Solana devnet
            <div className="mt-2 break-all font-medium text-foreground">{visibleAddress}</div>
          </>
        ) : (
          <>
            No live Solana wallet connected.
            <div className="mt-2">TaskVerified expects Phantom on devnet for this demo payout flow.</div>
          </>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        {isConnected ? (
          <Button variant="outline" onClick={handleDisconnect} disabled={disconnecting}>
            {disconnecting ? "Disconnecting..." : `Disconnect ${formatWalletAddress(visibleAddress)}`}
          </Button>
        ) : (
          <Button onClick={handleConnect} disabled={connecting}>
            {connecting ? "Connecting..." : "Connect Phantom"}
          </Button>
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        Provider: <span className="font-medium text-foreground">{wallet?.adapter.name ?? "Phantom"}</span> · Network:{" "}
        <span className="font-medium text-foreground">Solana devnet</span>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
