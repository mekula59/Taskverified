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
  trustPills,
  insightsEyebrow,
  insights,
}: AuthShellProps) {
  const renderForm = () => (
    <div className="min-w-0 space-y-3">
      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{modeEyebrow}</div>

      <div className="space-y-1.5">
        <h1
          className="max-w-[18rem] break-words text-[1.45rem] font-semibold leading-tight tracking-tight text-slate-950 sm:max-w-xl md:text-[1.75rem]"
          style={{ viewTransitionName: "taskverified-auth-title" }}
        >
          {modeTitle}
        </h1>
        <p
          className="max-w-[18.5rem] text-sm leading-5 text-slate-600 sm:max-w-xl"
          style={{ viewTransitionName: "taskverified-auth-description" }}
        >
          {modeDescription}
        </p>
      </div>

      <div
        className="min-w-0 rounded-2xl bg-slate-950 p-3 text-white shadow-ledger-sm"
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
          <span className="min-w-0 truncate">{isWalletBusy ? phantomBusyLabel : phantomButtonLabel}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
        <p className="mt-2 text-xs leading-5 text-slate-400">{phantomHint}</p>
      </div>

      {feedback}

      <div className="min-w-0" style={{ viewTransitionName: "taskverified-auth-email" }}>
        {emailFallback}
      </div>
    </div>
  );

  const primaryInsight = insights[0];
  const trustSteps = ["Proof", "Review", "Payout"];
  const compactTrustPills = trustPills.slice(0, 2);

  const renderSwitchPrompt = (variant: "desktop" | "mobile") => (
    <div
      className={cn(
        "flex flex-col",
        variant === "desktop"
          ? "h-full justify-between rounded-[1.25rem] bg-slate-950 p-6 text-white shadow-ledger-sm"
          : "mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200",
      )}
    >
      <div>
        <p
          className={cn(
            "text-[10px] font-semibold uppercase tracking-[0.24em]",
            variant === "desktop" ? "text-emerald-200" : "text-primary",
          )}
        >
          {brandEyebrow}
        </p>
        <h2
          className={cn(
            "mt-3 font-semibold tracking-tight",
            variant === "desktop" ? "text-xl leading-tight text-white" : "text-base leading-snug text-slate-950",
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

      {variant === "desktop" ? (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {trustSteps.map((step) => (
              <div key={step} className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{step}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {compactTrustPills.map((pill) => (
              <span
                key={pill}
                className="inline-flex rounded-full border border-emerald-200/20 bg-emerald-200/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100"
              >
                {pill}
              </span>
            ))}
          </div>

          {primaryInsight ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{insightsEyebrow}</p>
              <p className="mt-1 text-xs font-semibold text-white">{primaryInsight.title}</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">{primaryInsight.description}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        onClick={onSwitchMode}
        className={cn(
          "mt-4 inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-semibold transition-colors",
          variant === "desktop"
            ? "bg-white text-slate-950 hover:bg-emerald-50"
            : "border border-slate-300 bg-white text-slate-900 hover:bg-slate-100",
        )}
      >
        {oppositeButtonLabel}
      </button>
    </div>
  );

  return (
    <div className="relative isolate">
      <div className="mx-auto w-full max-w-[920px] px-3 py-1 sm:px-6 lg:px-8">
        <div
          className="mx-auto w-full max-w-[calc(100vw-2rem)] overflow-hidden rounded-[1.5rem] bg-white p-4 shadow-ledger ring-1 ring-slate-200 lg:hidden"
          style={{ viewTransitionName: "taskverified-auth-card" }}
        >
          {renderForm()}
          {renderSwitchPrompt("mobile")}
        </div>

        <div
          className="relative hidden min-h-[520px] overflow-hidden rounded-[1.6rem] bg-white shadow-ledger ring-1 ring-slate-200 lg:block"
          style={{ viewTransitionName: "taskverified-auth-card" }}
        >
          <div
            className={cn(
              "absolute top-0 h-full w-1/2 p-6 transition-all duration-500 ease-out",
              mode === "signin" ? "left-0" : "left-1/2",
            )}
          >
            <div className="flex h-full items-center">
              <div className="w-full">{renderForm()}</div>
            </div>
          </div>

          <div
            className={cn(
              "absolute left-0 top-0 z-10 h-full w-1/2 p-4 transition-transform duration-500 ease-out",
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
