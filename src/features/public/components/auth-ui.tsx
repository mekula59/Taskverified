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
        "rounded-2xl border px-4 py-4 shadow-sm",
        tone === "success" && "border-emerald-200 bg-emerald-50/90 text-emerald-950",
        tone === "warning" && "border-amber-200 bg-amber-50/90 text-amber-950",
        tone === "error" && "border-rose-200 bg-rose-50/90 text-rose-950",
        className,
      )}
      role={tone === "success" ? "status" : "alert"}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            tone === "success" && "bg-emerald-100 text-emerald-700",
            tone === "warning" && "bg-amber-100 text-amber-700",
            tone === "error" && "bg-rose-100 text-rose-700",
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-sm leading-6">{message}</p>
          {hint ? <p className="text-sm leading-6 opacity-80">{hint}</p> : null}
        </div>
      </div>
    </div>
  );
}

export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
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
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
        isActive
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-slate-200 bg-slate-50 text-slate-500",
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
        <div className="inline-flex rounded-full bg-slate-100 p-1">
          <button
            type="button"
            onClick={mode === "signin" ? undefined : onSwitchMode}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              mode === "signin" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800",
            )}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={mode === "signup" ? undefined : onSwitchMode}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
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
          className="max-w-2xl text-[1.7rem] font-semibold leading-tight tracking-tight text-slate-950"
          style={{ viewTransitionName: "taskverified-auth-title" }}
        >
          {modeTitle}
        </h1>
        <p
          className="max-w-2xl text-sm leading-5 text-slate-600"
          style={{ viewTransitionName: "taskverified-auth-description" }}
        >
          {modeDescription}
        </p>
      </div>

      <div
        className="rounded-[1.25rem] bg-slate-950 p-3.5 text-white shadow-[0_24px_58px_-40px_rgba(15,23,42,0.85)]"
        style={{ viewTransitionName: "taskverified-auth-phantom" }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-200">Primary access</p>
            <h2 className="text-lg font-semibold tracking-tight">{phantomTitle}</h2>
            <p className="max-w-lg text-sm leading-5 text-slate-300">{phantomDescription}</p>
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
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-50 disabled:pointer-events-none disabled:opacity-60"
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

  return (
    <div className="relative isolate">
      <div className="absolute inset-x-0 top-0 -z-10 h-40 bg-[linear-gradient(180deg,rgba(20,184,166,0.08),transparent)]" />
      <div className="mx-auto w-full max-w-[760px] px-3 py-1 sm:px-6 lg:px-8">
        <div
          className="rounded-[1.5rem] bg-white p-4 shadow-[0_30px_86px_-62px_rgba(15,23,42,0.65)] ring-1 ring-slate-200 md:p-5"
          style={{ viewTransitionName: "taskverified-auth-card" }}
        >
          {renderForm()}
        </div>

        <div className="mt-3 rounded-[1.1rem] bg-white/75 p-3 shadow-sm ring-1 ring-slate-200 backdrop-blur">
          <div className="grid gap-3 md:grid-cols-[1fr_1.25fr] md:items-center">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">{brandEyebrow}</p>
              <h2 className="mt-1.5 text-sm font-semibold leading-snug text-slate-950">{brandTitle}</h2>
              <p className="mt-1 text-xs leading-5 text-slate-600">{brandDescription}</p>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {trustPills.slice(0, 3).map((pill) => (
                  <AuthTrustPill key={pill} label={pill} />
                ))}
              </div>
              {primaryInsight ? (
                <div className="border-t border-slate-200 pt-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">{insightsEyebrow}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-950">{primaryInsight.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{primaryInsight.description}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
