import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import { Mail, ShieldCheck, Sparkles, Wallet } from "lucide-react";

import { useAuth } from "@/features/auth/context/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatAuthError } from "@/lib/supabase/auth";
import { AuthDivider, AuthFeedbackBanner, AuthShell, deriveAuthFeedbackFromError, runAuthViewTransition } from "@/features/public/components/auth-ui";

const EMAIL_RESEND_COOLDOWN_SECONDS = 60;

export function SignUpPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState<string | null>(null);
  const [emailCooldownRemaining, setEmailCooldownRemaining] = useState(0);
  const [isWalletSubmitting, setIsWalletSubmitting] = useState(false);
  const { wallets, wallet, connecting, select } = useWallet();
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

    navigate(auth.routeForRole(auth.user?.role), { replace: true });
  }, [auth, navigate]);

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

    setError(null);
    setWalletError(null);
    setEmailSent(null);

    try {
      await auth.signUpWithEmail(email);
      setEmailSent(email.trim().toLowerCase());
      setEmailCooldownRemaining(EMAIL_RESEND_COOLDOWN_SECONDS);
    } catch (nextError) {
      setError(formatAuthError(nextError, "Unable to create your account right now."));
    }
  };

  const handleWalletContinue = async () => {
    setWalletError(null);
    setEmailSent(null);

    if (!phantomWallet || !isPhantomAvailable) {
      setWalletError("Phantom was not detected. Install or unlock Phantom to continue.");
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

      navigate(destination);
    } catch (nextError) {
      setWalletError(formatAuthError(nextError, "Unable to continue with Phantom."));
    } finally {
      setIsWalletSubmitting(false);
    }
  };

  const currentError = walletError ?? error ?? auth.error;
  const errorFeedback = currentError ? deriveAuthFeedbackFromError(currentError, "Account creation unavailable") : null;
  const isWalletBusy = connecting || isWalletSubmitting || auth.isLoading;
  const isEmailCooldownActive = emailCooldownRemaining > 0;
  const emailButtonLabel = isEmailCooldownActive
    ? `Resend available in ${emailCooldownRemaining}s`
    : auth.isLoading
      ? "Sending secure link..."
      : "Continue with Email";

  return (
    <AuthShell
      mode="signup"
      modeEyebrow="Create account"
      modeTitle="Create your verified identity"
      modeDescription="Start with Phantom so proof, reputation, and Solana payout custody resolve to the same account from day one."
      phantomTitle="Continue with Phantom"
      phantomDescription="Sign one message to create or restore the TaskVerified identity your future Solana payouts will settle to."
      phantomHint="Best for contributors and teams who want account creation, reputation, and payout custody to begin in one place."
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
          <form className="mt-4 rounded-[1.35rem] border border-slate-200 bg-slate-50/80 p-5" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-900">Create an account by email</p>
                <p className="text-sm leading-6 text-slate-600">
                  Use a secure magic link when you cannot access Phantom yet and still need a clear path into onboarding.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-slate-700">
                  Email
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="h-12 border-slate-200 bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={auth.isLoading || isEmailCooldownActive}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-50"
              >
                <Mail className="h-4 w-4" />
                {emailButtonLabel}
              </button>

              {emailSent ? (
                <AuthFeedbackBanner
                  tone="success"
                  title="Check your inbox"
                  message={`A secure TaskVerified link was sent to ${emailSent}.`}
                  hint="Open the newest email in this browser to create your account and continue onboarding."
                />
              ) : null}
            </div>
          </form>
        </>
      }
      oppositeTitle="Already have an account?"
      oppositeDescription="Sign in to keep your proof history, payout identity, and reputation record in one place."
      oppositeButtonLabel="Sign in"
      onSwitchMode={() => runAuthViewTransition(() => navigate("/signin"))}
      brandEyebrow="Solana Frontier build"
      brandTitle="Create the identity that will carry your trust record."
      brandDescription="Start with a Phantom-signed identity so proof, reputation, and Solana payouts resolve to the same account from day one."
      trustPills={["Wallet-first onboarding", "Reputation held in one place", "Email fallback available"]}
      features={[
        {
          icon: <Wallet className="h-5 w-5" />,
          title: "Native to Solana",
          description: "Phantom keeps account creation aligned with the payout address you will actually use.",
        },
        {
          icon: <ShieldCheck className="h-5 w-5" />,
          title: "Trust-first by default",
          description: "Verification starts from one identity instead of being split across temporary entry points.",
        },
        {
          icon: <Sparkles className="h-5 w-5" />,
          title: "Clear recovery path",
          description: "Email stays available when you need it, but it now reads as secondary and deliberate.",
        },
      ]}
      insightsEyebrow="After access is verified"
      insights={[
        {
          title: "Choose how you operate",
          description: "Set your role as worker or poster before reputation and payout states begin to accumulate.",
        },
        {
          title: "Complete your profile once",
          description: "Your identity stays consistent across proof submission, review, and release activity.",
        },
      ]}
    />
  );
}
