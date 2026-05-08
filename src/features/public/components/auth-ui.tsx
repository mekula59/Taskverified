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
      hint: "Wait a few minutes before requesting another email link. Your wallet sign-in state has not changed.",
    };
  }

  if (normalized.includes("email access is not fully enabled") || normalized.includes("email access is not available")) {
    return {
      tone: "warning" as const,
      title: "Email access unavailable",
      hint: "Use Phantom or try the email linked to your TaskVerified account.",
    };
  }

  if (normalized.includes("no account found") || normalized.includes("create your taskverified account")) {
    return {
      tone: "warning" as const,
      title: "Create an account",
      hint: "Switch to sign up to create the TaskVerified identity for this email.",
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
}: AuthShellProps) {
  const renderForm = () => (
    <div className="mx-auto w-full max-w-[22.5rem] min-w-0 space-y-2.5 text-left">
      <div className="space-y-1.5 text-center">
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">{modeEyebrow}</div>
        <h1
          className="break-words text-[1.4rem] font-semibold leading-tight tracking-tight text-slate-950"
          style={{ viewTransitionName: "taskverified-auth-title" }}
        >
          {modeTitle}
        </h1>
        <p
          className="mx-auto max-w-[18rem] text-[13px] leading-5 text-slate-600"
          style={{ viewTransitionName: "taskverified-auth-description" }}
        >
          {modeDescription}
        </p>
      </div>

      <div
        className="min-w-0 rounded-[1rem] bg-slate-950 p-3 text-white shadow-ledger-sm"
        style={{ viewTransitionName: "taskverified-auth-phantom" }}
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-200">Primary access</p>
              <h2 className="text-base font-semibold tracking-tight">{phantomTitle}</h2>
            </div>
            <div
              className={cn(
                "shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em]",
                isPhantomAvailable ? "border-emerald-300/40 bg-emerald-300/10 text-emerald-100" : "border-amber-200/40 bg-amber-200/10 text-amber-100",
              )}
            >
              {isPhantomAvailable ? phantomReadyLabel : phantomUnavailableLabel}
            </div>
          </div>
          <p className="text-xs leading-[1.35rem] text-slate-300">{phantomDescription}</p>
        </div>

        <button
          type="button"
          onClick={onPhantomContinue}
          disabled={isWalletBusy}
          className="mt-2.5 flex h-10 w-full items-center justify-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-50 disabled:pointer-events-none disabled:opacity-60"
        >
          <Wallet className="h-4 w-4" />
          <span className="min-w-0 truncate">{isWalletBusy ? phantomBusyLabel : phantomButtonLabel}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
        <p className="mt-1.5 text-center text-[11px] leading-4 text-slate-400">{phantomHint}</p>
      </div>

      {feedback}

      <div className="min-w-0" style={{ viewTransitionName: "taskverified-auth-email" }}>
        {emailFallback}
      </div>
    </div>
  );

  const renderSwitchPrompt = (variant: "desktop" | "mobile") => (
    <div
      className={cn(
        "flex flex-col text-center",
        variant === "desktop"
          ? "h-full items-center justify-center bg-primary px-10 py-12 text-white"
          : "mt-4 items-center rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200",
      )}
    >
      <div className="max-w-[18rem]">
        <p
          className={cn(
            "text-[10px] font-semibold uppercase tracking-[0.24em]",
            variant === "desktop" ? "text-emerald-100" : "text-primary",
          )}
        >
          {brandEyebrow}
        </p>
        <h2
          className={cn(
            "mt-3 font-semibold tracking-tight",
            variant === "desktop" ? "text-2xl leading-tight text-white" : "text-base leading-snug text-slate-950",
          )}
        >
          {oppositeTitle}
        </h2>
        <p
          className={cn(
            "mt-2 text-sm leading-6",
            variant === "desktop" ? "text-slate-300" : "text-slate-600",
          )}
        >
          {oppositeDescription}
        </p>
      </div>

      <button
        type="button"
        onClick={onSwitchMode}
        className={cn(
          "mt-5 inline-flex h-11 items-center justify-center rounded-full px-7 text-sm font-semibold transition-colors",
          variant === "desktop"
            ? "border border-white/70 bg-transparent text-white hover:bg-white/10"
            : "border border-slate-300 bg-white text-slate-900 hover:bg-slate-100",
        )}
      >
        {oppositeButtonLabel}
      </button>
    </div>
  );

  return (
    <div className="relative isolate">
      <div className="mx-auto flex min-h-[calc(100vh-7.25rem)] w-full items-center px-3 py-3 sm:px-6 lg:px-8">
        <div
          className="mx-auto w-full max-w-[calc(100vw-2rem)] overflow-hidden rounded-[1.25rem] bg-white p-5 shadow-ledger ring-1 ring-slate-200 lg:hidden"
          style={{ viewTransitionName: "taskverified-auth-card" }}
        >
          {renderForm()}
          {renderSwitchPrompt("mobile")}
        </div>

        <div
          className="relative mx-auto hidden h-[545px] w-full max-w-[920px] overflow-hidden rounded-[1.35rem] bg-white shadow-ledger ring-1 ring-slate-200 lg:block"
          style={{ viewTransitionName: "taskverified-auth-card" }}
        >
          <div
            className={cn(
              "absolute top-0 h-full w-1/2 px-9 py-6 transition-all duration-500 ease-in-out",
              mode === "signin" ? "left-0" : "left-1/2",
            )}
          >
            <div className="flex h-full items-center justify-center">
              <div className="w-full">{renderForm()}</div>
            </div>
          </div>

          <div
            className={cn(
              "absolute left-0 top-0 z-10 h-full w-1/2 overflow-hidden transition-transform duration-500 ease-in-out",
              mode === "signin" ? "translate-x-full" : "translate-x-0",
            )}
          >
            {renderSwitchPrompt("desktop")}
          </div>
        </div>
      </div>
    </div>
  );
}
