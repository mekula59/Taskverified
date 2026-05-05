import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import { Mail, ShieldCheck, Sparkles, Wallet } from "lucide-react";

import { useAuth } from "@/features/auth/context/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatAuthError } from "@/lib/supabase/auth";
import { AuthDivider, AuthFeedbackBanner, AuthShell, deriveAuthFeedbackFromError, runAuthViewTransition } from "@/features/public/components/auth-ui";

const EMAIL_RESEND_COOLDOWN_SECONDS = 60;

export function SignInPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState<string | null>(null);
  const [emailCooldownRemaining, setEmailCooldownRemaining] = useState(0);
  const [isWalletSubmitting, setIsWalletSubmitting] = useState(false);
  const { wallets, wallet, connecting, select } = useWallet();

  const next = (location.state as { from?: string } | null)?.from;
  const isProtectedRedirect = Boolean(next);
  const phantomWallet = wallets.find((item) => item.adapter.name === "Phantom");
  const isPhantomAvailable =
    phantomWallet?.readyState === WalletReadyState.Installed || phantomWallet?.readyState === WalletReadyState.Loadable;

  useEffect(() => {
    if (auth.isLoading || !auth.isAuthenticated) {
      return;
    }

    if (auth.needsRoleSelection) {
      navigate("/onboarding/role", { replace: true });
      return;
    }

    if (auth.user?.role && auth.needsProfileSetup) {
      navigate("/onboarding/profile", { replace: true });
      return;
    }

    navigate(next ?? auth.routeForRole(auth.user?.role), { replace: true });
  }, [auth, navigate, next]);

  useEffect(() => {
    if (emailCooldownRemaining <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setEmailCooldownRemaining((remaining) => Math.max(remaining - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [emailCooldownRemaining]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (emailCooldownRemaining > 0) {
      return;
    }

    setSubmitError(null);
    setWalletError(null);
    setEmailSent(null);

    try {
      await auth.signInWithEmail(email);
      setEmailSent(email.trim().toLowerCase());
      setEmailCooldownRemaining(EMAIL_RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      setSubmitError(formatAuthError(error, "Unable to sign in right now."));
    }
  };

  const handleWalletContinue = async () => {
    setWalletError(null);
    setEmailSent(null);

    if (!phantomWallet || !isPhantomAvailable) {
      setWalletError("Phantom is not installed in this browser. Install Phantom or use email fallback to continue.");
      return;
    }

    try {
      setIsWalletSubmitting(true);

      if (wallet?.adapter.name !== phantomWallet.adapter.name) {
        select(phantomWallet.adapter.name);
      }

      if (!phantomWallet.adapter.connected) {
        await phantomWallet.adapter.connect();
      }

      const walletAddress = phantomWallet.adapter.publicKey?.toBase58();
      const signWalletMessage = phantomWallet.adapter.signMessage?.bind(phantomWallet.adapter);

      if (!walletAddress || !signWalletMessage) {
        throw new Error("Phantom connected, but message signing is unavailable.");
      }

      const destination = await auth.signInWithWallet({
        walletAddress,
        signMessage: signWalletMessage,
      });

      navigate(next ?? destination);
    } catch (error) {
      setWalletError(formatAuthError(error, "Unable to continue with Phantom."));
    } finally {
      setIsWalletSubmitting(false);
    }
  };

  const currentError = walletError ?? submitError ?? auth.error;
  const errorFeedback = currentError ? deriveAuthFeedbackFromError(currentError, "Sign-in unavailable") : null;
  const isWalletBusy = connecting || isWalletSubmitting || auth.isLoading;
  const isEmailCooldownActive = emailCooldownRemaining > 0;
  const emailButtonLabel = isEmailCooldownActive
    ? `Resend available in ${emailCooldownRemaining}s`
    : auth.isLoading
      ? "Sending secure link..."
      : "Continue with Email";

  return (
    <AuthShell
      mode="signin"
      modeEyebrow={isProtectedRedirect ? "Workspace access" : "Returning member"}
      modeTitle={isProtectedRedirect ? "Sign in to continue to your workspace" : "Enter your TaskVerified workspace"}
      modeDescription={
        isProtectedRedirect
          ? "Continue with Phantom to restore the workspace identity you tried to open. Email remains available as fallback."
          : "Use Phantom first to restore the identity tied to proof history, payout trail, and trust record."
      }
      phantomTitle="Continue with Phantom"
      phantomDescription="Sign one wallet message to restore the identity attached to your payout address and proof record."
      phantomHint="No transaction is sent. TaskVerified only verifies wallet control."
      phantomReadyLabel="Phantom detected"
      phantomUnavailableLabel="Install Phantom"
      phantomButtonLabel="Continue with Phantom"
      phantomBusyLabel="Connecting to Phantom..."
      isPhantomAvailable={isPhantomAvailable}
      isWalletBusy={isWalletBusy}
      onPhantomContinue={handleWalletContinue}
      feedback={
        currentError && errorFeedback ? (
          <AuthFeedbackBanner
            tone={errorFeedback.tone}
            title={errorFeedback.title}
            message={currentError}
            hint={errorFeedback.hint}
          />
        ) : null
      }
      emailFallback={
        <>
          <AuthDivider label="Email fallback" />
          <form className="mt-2.5 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200" onSubmit={handleSubmit}>
            <div className="space-y-2.5">
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-slate-900">Continue by email</p>
                <p className="text-sm leading-5 text-slate-600 lg:hidden">
                  Use a secure magic link if Phantom is unavailable or you need account recovery in this browser.
                </p>
              </div>

              <div className="grid gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-slate-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className="h-10 border-slate-200 bg-white shadow-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={auth.isLoading || isEmailCooldownActive}
                  className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-50"
                >
                  <Mail className="h-4 w-4" />
                  {emailButtonLabel}
                </button>
              </div>

              {emailSent ? (
                <AuthFeedbackBanner
                  tone="success"
                  title="Check your inbox"
                  message={`A secure TaskVerified link was sent to ${emailSent}.`}
                  hint="Open the newest email in this browser to complete sign-in."
                />
              ) : null}
            </div>
          </form>
        </>
      }
      oppositeTitle="New to TaskVerified?"
      oppositeDescription="Create the identity that carries proof, review, and payout state."
      oppositeButtonLabel="Create account"
      onSwitchMode={() => runAuthViewTransition(() => navigate("/signup"))}
      brandEyebrow="Solana-native access"
      brandTitle="Sign in to the workspace your wallet already trusts."
      brandDescription="Restore the identity tied to your proof history, review decisions, and payout trail with the cleanest path first."
      trustPills={["Wallet-signed session", "Proof-linked reputation", "Devnet payout rail"]}
      features={[
        {
          icon: <Wallet className="h-5 w-5" />,
          title: "Phantom first",
          description: "Identity and payout custody stay aligned from the first tap.",
        },
        {
          icon: <ShieldCheck className="h-5 w-5" />,
          title: "Trust preserved",
          description: "Task history, proof approvals, and release signals remain tied to one account.",
        },
        {
          icon: <Sparkles className="h-5 w-5" />,
          title: "Fallback ready",
          description: "Email remains available without taking over the primary identity story.",
        },
      ]}
      insightsEyebrow="Trust model"
      insights={[
        {
          title: "Primary access through Phantom",
          description: "Signing a wallet message is the fastest route back to the identity that controls your payout-facing activity.",
        },
        {
          title: "Email only when you need a fallback",
          description: "Secure magic links stay available for recovery, but they no longer compete with the wallet-first path.",
        },
      ]}
    />
  );
}
