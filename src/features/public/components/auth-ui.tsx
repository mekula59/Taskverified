import { type ReactNode } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, ShieldAlert, Wallet } from "lucide-react";

import { cn } from "@/lib/utils";

type AuthFeedbackTone = "success" | "warning" | "error";

declare global {
  interface Document {
    startViewTransition?: (callback: () => void) => { finished: Promise<void> };
  }
}

export function runAuthViewTransition(action: () => void) {
  if (typeof document !== "undefined" && document.startViewTransition) {
    document.startViewTransition(action);
    return;
  }

  action();
}

export function deriveAuthFeedbackFromError(message: string, fallbackTitle: string) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("rate limit") ||
    normalized.includes("throttl") ||
    normalized.includes("email sign-in is temporarily paused") ||
    normalized.includes("email requests were sent recently") ||
    normalized.includes("request a new one") ||
    normalized.includes("magic link")
  ) {
    return {
      tone: "warning" as const,
      title: "Email temporarily paused",
      hint: "Wait about a minute, then try email again. Your wallet sign-in state has not changed.",
    };
  }

  if (normalized.includes("user not found") || normalized.includes("no taskverified account")) {
    return {
      tone: "warning" as const,
      title: "No account found for this email",
      hint: "Create a new account, or use Phantom if this wallet already holds your TaskVerified access.",
    };
  }

  if (normalized.includes("couldn't verify") || normalized.includes("invalid login credentials")) {
    return {
      tone: "error" as const,
      title: "Sign-in could not be completed",
      hint: "Open the newest TaskVerified email in this browser, or request a fresh link.",
    };
  }

  if (normalized.includes("network") || normalized.includes("supabase")) {
    return {
      tone: "warning" as const,
      title: "Connection interrupted",
      hint: "Check your network, then retry. Your account state has not changed.",
    };
  }

  if (normalized.includes("not linked") || normalized.includes("linked wallet")) {
    return {
      tone: "warning" as const,
      title: "Wallet connected, not linked",
      hint: "Use the wallet linked to this TaskVerified account, or continue with email recovery.",
    };
  }

  if (
    normalized.includes("not detected") ||
    normalized.includes("not installed") ||
    normalized.includes("install phantom")
  ) {
    return {
      tone: "warning" as const,
      title: "Phantom is not installed",
      hint: "Install Phantom in this browser, then return here. Email fallback is still available.",
    };
  }

  if (
    normalized.includes("locked") ||
    normalized.includes("unlock") ||
    normalized.includes("unavailable") ||
    normalized.includes("cancelled") ||
    normalized.includes("message signing")
  ) {
    return {
      tone: "warning" as const,
      title: "Phantom needs attention",
      hint: "Unlock Phantom, keep this browser active, then approve the TaskVerified message.",
    };
  }

  if (normalized.includes("wallet") || normalized.includes("phantom")) {
    return {
      tone: "warning" as const,
      title: "Phantom needs attention",
      hint: "Confirm the wallet is available in this browser, then approve the TaskVerified message.",
    };
  }

  return {
    tone: "error" as const,
    title: fallbackTitle,
    hint: "Try again in this browser. If the issue persists, switch to the alternate sign-in method.",
  };
}

export function AuthFeedbackBanner({
  title,
  message,
  hint,
  tone,
  className,
}: {
  title: string;
  message: string;
  hint?: string;
  tone: AuthFeedbackTone;
  className?: string;
}) {
  const Icon = tone === "success" ? CheckCircle2 : tone === "warning" ? Clock3 : ShieldAlert;

  return (
    <div
      className={cn(
        "rounded-2xl px-4 py-3 ring-1",
        tone === "success" && "bg-emerald-50/90 text-emerald-950 ring-emerald-200",
        tone === "warning" && "bg-amber-50/90 text-amber-950 ring-amber-200",
        tone === "error" && "bg-rose-50/90 text-rose-950 ring-rose-200",
        className,
      )}
      role={tone === "success" ? "status" : "alert"}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
            tone === "success" && "bg-emerald-100 text-emerald-700",
            tone === "warning" && "bg-amber-100 text-amber-700",
            tone === "error" && "bg-rose-100 text-rose-700",
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-sm leading-5">{message}</p>
          {hint ? <p className="text-xs leading-5 opacity-80">{hint}</p> : null}
        </div>
      </div>
    </div>
  );
}

export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
      <div className="h-px flex-1 bg-slate-200" />
      <span>{label}</span>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

export function AuthTrustPill({
  label,
  isActive = true,
}: {
  label: string;
  isActive?: boolean;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ring-1",
        isActive
          ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
          : "bg-slate-50 text-slate-500 ring-slate-200",
      )}
    >
      {isActive ? <CheckCircle2 className="mr-2 h-3.5 w-3.5" /> : <AlertTriangle className="mr-2 h-3.5 w-3.5" />}
      {label}
    </div>
  );
}

interface AuthShellFeature {
  title: string;
  description: string;
  icon: ReactNode;
}

interface AuthShellInsight {
  title: string;
  description: string;
}

interface AuthShellProps {
  mode: "signin" | "signup";
  modeEyebrow: string;
  modeTitle: string;
  modeDescription: string;
  phantomTitle: string;
  phantomDescription: string;
  phantomHint: string;
  phantomReadyLabel: string;
  phantomUnavailableLabel: string;
  phantomButtonLabel: string;
  phantomBusyLabel: string;
  isPhantomAvailable: boolean;
  isWalletBusy: boolean;
  onPhantomContinue: () => void;
  feedback: ReactNode;
  emailFallback: ReactNode;
  oppositeTitle: string;
  oppositeDescription: string;
  oppositeButtonLabel: string;
  onSwitchMode: () => void;
  brandEyebrow: string;
  brandTitle: string;
  brandDescription: string;
  trustPills: string[];
  features: AuthShellFeature[];
  insightsEyebrow: string;
  insights: AuthShellInsight[];
}

export function AuthShell({
  mode,
  modeEyebrow,
  modeTitle,
  modeDescription,
  phantomTitle,
  phantomDescription,
  phantomHint,
  phantomReadyLabel,
  phantomUnavailableLabel,
  phantomButtonLabel,
  phantomBusyLabel,
  isPhantomAvailable,
  isWalletBusy,
  onPhantomContinue,
  feedback,
  emailFallback,
  oppositeTitle,
  oppositeDescription,
  oppositeButtonLabel,
  onSwitchMode,
  brandEyebrow,
  brandTitle,
  brandDescription,
  trustPills,
  insightsEyebrow,
  insights,
}: AuthShellProps) {
  const renderForm = () => (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full bg-slate-100 p-1 ring-1 ring-slate-200/80">
          <button
            type="button"
            onClick={mode === "signin" ? undefined : onSwitchMode}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              mode === "signin" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800",
            )}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={mode === "signup" ? undefined : onSwitchMode}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              mode === "signup" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800",
            )}
          >
            Create account
          </button>
        </div>
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{modeEyebrow}</div>
      </div>

      <div className="space-y-1.5">
        <h1
          className="max-w-xl text-[1.65rem] font-semibold leading-tight tracking-tight text-slate-950 md:text-[1.85rem]"
          style={{ viewTransitionName: "taskverified-auth-title" }}
        >
          {modeTitle}
        </h1>
        <p
          className="max-w-xl text-sm leading-5 text-slate-600"
          style={{ viewTransitionName: "taskverified-auth-description" }}
        >
          {modeDescription}
        </p>
      </div>

      <div
        className="rounded-2xl bg-slate-950 p-3 text-white shadow-ledger-sm"
        style={{ viewTransitionName: "taskverified-auth-phantom" }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-200">Primary access</p>
            <h2 className="text-base font-semibold tracking-tight">{phantomTitle}</h2>
            <p className="max-w-lg text-xs leading-5 text-slate-300">{phantomDescription}</p>
          </div>
          <div
            className={cn(
              "inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
              isPhantomAvailable ? "border-emerald-300/40 bg-emerald-300/10 text-emerald-100" : "border-amber-200/40 bg-amber-200/10 text-amber-100",
            )}
          >
            {isPhantomAvailable ? phantomReadyLabel : phantomUnavailableLabel}
          </div>
        </div>

        <button
          type="button"
          onClick={onPhantomContinue}
          disabled={isWalletBusy}
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-50 disabled:pointer-events-none disabled:opacity-60"
        >
          <Wallet className="h-4 w-4" />
          <span className="whitespace-nowrap">{isWalletBusy ? phantomBusyLabel : phantomButtonLabel}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
        <p className="mt-2 text-xs leading-5 text-slate-400">{phantomHint}</p>
      </div>

      {feedback}

      <div style={{ viewTransitionName: "taskverified-auth-email" }}>{emailFallback}</div>
    </div>
  );

  const primaryInsight = insights[0];
  const secondaryInsight = insights[1];

  return (
    <div className="relative isolate">
      <div className="mx-auto w-full max-w-[980px] px-3 py-1 sm:px-6 lg:px-8">
        <div
          className="overflow-hidden rounded-[1.5rem] bg-white shadow-ledger ring-1 ring-slate-200"
          style={{ viewTransitionName: "taskverified-auth-card" }}
        >
          <div className="grid lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="p-4 sm:p-5 lg:p-6">{renderForm()}</div>

            <aside className="border-t border-slate-200/80 bg-slate-50/80 p-4 lg:border-l lg:border-t-0 lg:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">{brandEyebrow}</p>
              <h2 className="mt-2 text-base font-semibold leading-snug tracking-tight text-slate-950">{brandTitle}</h2>
              <p className="mt-2 text-xs leading-5 text-slate-600">{brandDescription}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {trustPills.slice(0, 3).map((pill) => (
                  <AuthTrustPill key={pill} label={pill} />
                ))}
              </div>

              {primaryInsight ? (
                <div className="mt-4 rounded-2xl bg-white p-3 ring-1 ring-slate-200/80">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">{insightsEyebrow}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-950">{primaryInsight.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{primaryInsight.description}</p>
                </div>
              ) : null}

              {secondaryInsight ? (
                <div className="mt-2 rounded-2xl bg-white/70 p-3 ring-1 ring-slate-200/70">
                  <p className="text-xs font-semibold text-slate-950">{secondaryInsight.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{secondaryInsight.description}</p>
                </div>
              ) : null}

              <div className="mt-4 border-t border-slate-200 pt-4">
                <p className="text-xs font-semibold text-slate-950">{oppositeTitle}</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">{oppositeDescription}</p>
                <button
                  type="button"
                  onClick={onSwitchMode}
                  className="mt-3 inline-flex h-9 items-center justify-center rounded-full border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-900 transition-colors hover:bg-slate-100"
                >
                  {oppositeButtonLabel}
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
