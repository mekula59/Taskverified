import { useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/shell/PageIntro";
import { SectionCard } from "@/components/shell/SectionCard";
import { LedgerRows } from "@/components/shell/WorkspacePrimitives";
import { useAuth } from "@/features/auth/context/useAuth";
import { SolanaWalletStatusCard } from "@/features/solana/components/SolanaWalletStatusCard";
import { useTasks } from "@/features/tasks/context/useTasks";
import { getWalletProfile } from "@/features/tasks/data/sampleData";
import { payoutRailCopy } from "@/features/tasks/lib/payoutRail";

export function SettingsPage() {
  const auth = useAuth();
  const { walletProfiles, refresh } = useTasks();
  const role = auth.profile?.role ?? auth.user?.role;
  const displayName = auth.profile?.fullName ?? auth.user?.email ?? "TaskVerified user";
  const linkedWallet = auth.user?.id ? getWalletProfile(walletProfiles, auth.user.id) : undefined;
  const linkedWalletAddress = linkedWallet?.status === "connected" ? linkedWallet.walletAddress : undefined;

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <div className="space-y-5">
      <PageIntro
        eyebrow="Account"
        title="Settings show identity and wallet truth."
        description="This page keeps account controls tied to role, verification, wallet, and payout readiness."
      />

      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <SectionCard title="Signed-in identity" description="The account currently controlling this browser session.">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.14em]">
                {role ?? "No role"}
              </Badge>
              <Badge variant={auth.verification?.status === "verified" ? "success" : "outline"} className="rounded-full capitalize">
                {auth.verification?.status ?? "unverified"}
              </Badge>
            </div>
            <LedgerRows
              rows={[
                { label: "Name", value: displayName },
                { label: "Email", value: auth.user?.email ?? "No email on session" },
                { label: "Role", value: role ? <span className="capitalize">{role}</span> : "Role not selected" },
                {
                  label: "Linked TaskVerified wallet",
                  value: linkedWalletAddress ?? "No linked wallet",
                  valueClassName: linkedWalletAddress ? "font-mono text-xs leading-5 break-all" : undefined,
                },
              ]}
            />
            <Button variant="outline" onClick={auth.signOut}>
              Sign out
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="Phantom wallet link" description="Connect, link, or unlink the wallet TaskVerified should trust for this identity.">
          {auth.user?.id && role ? (
            <SolanaWalletStatusCard userId={auth.user.id} role={role} displayName={displayName} />
          ) : (
            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900 ring-1 ring-amber-200">
              Choose a worker or poster role before linking a TaskVerified wallet.
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Current trust model" description="How this build handles identity, release, and dispute visibility.">
        <LedgerRows
          rows={[
            { label: "Current role", value: role ? <span className="capitalize">{role}</span> : "Role not selected" },
            {
              label: "Linked wallet",
              value: linkedWalletAddress ?? "No linked wallet",
              valueClassName: linkedWalletAddress ? "font-mono text-xs leading-5 break-all" : undefined,
            },
            { label: "Active payout rail", value: "SOL" },
            { label: "Network", value: "Solana devnet" },
            { label: "Release model", value: "poster-released after approved proof" },
            { label: "Escrow", value: "planned for next release model" },
            { label: "Worker protection today", value: payoutRailCopy.workerProtection },
          ]}
        />
      </SectionCard>

      <SectionCard title="Ika-ready payout roadmap" description="A future payout rail direction, not an active integration in this build.">
        <LedgerRows
          rows={[
            { label: "Future rail", value: "Ika dWallet settlement" },
            {
              label: "Use case",
              value: "posters fund from native assets on other chains while Solana enforces proof/review/release policy",
            },
            { label: "Status", value: "planned, not active in this build" },
          ]}
        />
      </SectionCard>
    </div>
  );
}
