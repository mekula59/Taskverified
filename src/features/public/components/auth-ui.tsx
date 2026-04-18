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

  if (normalized.includes("rate limit") || normalized.includes("throttl")) {
    return {
      tone: "warning" as const,
      title: "Rate limit reached",
      hint: "Wait about a minute, then try email again or continue with Phantom now.",
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

  if (normalized.includes("wallet") || normalized.includes("phantom")) {
    return {
      tone: "warning" as const,
      title: "Phantom needs attention",
      hint: "Unlock the wallet, approve the exact TaskVerified message, and try again.",
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
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
          : "border-white/10 bg-white/5 text-white/65",
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
  features,
  insightsEyebrow,
  insights,
}: AuthShellProps) {
  const isSignUp = mode === "signup";

  const renderFormStage = (compact = false) => (
    <div className={cn("flex h-full flex-col justify-between", compact ? "gap-4" : "gap-4.5")}>
      <div className={cn("space-y-4", compact ? "space-y-3" : "space-y-3.5")}>
        <div className={cn("space-y-3", compact && "space-y-2.5")}>
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-100/90 p-1 shadow-sm">
            <button
              type="button"
              onClick={mode === "signin" ? undefined : onSwitchMode}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-all",
                mode === "signin" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800",
              )}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={mode === "signup" ? undefined : onSwitchMode}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-all",
                mode === "signup" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800",
              )}
            >
              Create account
            </button>
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 shadow-sm">
              {modeEyebrow}
            </div>
            <div className="space-y-2">
              <h1
                className={cn(
                  "font-semibold tracking-tight text-slate-950",
                  compact ? "text-[1.8rem] leading-tight" : "text-[2rem] leading-tight xl:text-[2.1rem]",
                )}
                style={{ viewTransitionName: "taskverified-auth-title" }}
              >
                {modeTitle}
              </h1>
              <p
                className={cn(
                  "max-w-xl text-slate-600",
                  compact ? "text-sm leading-6" : "text-sm leading-6 sm:text-[15px]",
                )}
                style={{ viewTransitionName: "taskverified-auth-description" }}
              >
                {modeDescription}
              </p>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "rounded-[1.5rem] border border-emerald-200 bg-[linear-gradient(180deg,rgba(236,253,245,0.98),rgba(240,253,250,0.92))] shadow-[0_16px_45px_-34px_rgba(5,150,105,0.5)]",
            compact ? "p-4" : "p-3.5",
          )}
          style={{ viewTransitionName: "taskverified-auth-phantom" }}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700">Primary access</p>
              <h2 className={cn("font-semibold tracking-tight text-slate-950", compact ? "text-lg" : "text-lg sm:text-[1.35rem]")}>
                {phantomTitle}
              </h2>
              <p className="max-w-lg text-sm leading-6 text-slate-600">{phantomDescription}</p>
            </div>
            <div
              className={cn(
                "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]",
                isPhantomAvailable ? "border-emerald-300 bg-white text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700",
              )}
            >
              {isPhantomAvailable ? phantomReadyLabel : phantomUnavailableLabel}
            </div>
          </div>

          <button
            type="button"
            onClick={onPhantomContinue}
            disabled={isWalletBusy}
            className="mt-3.5 flex h-13 w-full items-center justify-center gap-3 rounded-2xl bg-[linear-gradient(135deg,#032b2a_0%,#0f766e_52%,#22c55e_100%)] px-5 text-sm font-semibold text-white shadow-[0_20px_50px_-28px_rgba(6,95,70,0.7)] transition-all hover:scale-[1.01] disabled:pointer-events-none disabled:opacity-60 sm:h-14 sm:text-base"
          >
            <Wallet className="h-5 w-5" />
            {isWalletBusy ? phantomBusyLabel : phantomButtonLabel}
            <ArrowRight className="h-5 w-5" />
          </button>

          <p className="mt-2 text-sm leading-6 text-slate-600">{phantomHint}</p>
        </div>

        {feedback}

        <div style={{ viewTransitionName: "taskverified-auth-email" }}>{emailFallback}</div>
      </div>

    </div>
  );

  const renderBrandStage = (compact = false) => (
    <div
      className={cn(
        "relative overflow-hidden text-white",
        compact ? "rounded-[1.6rem] px-4 pb-4 pt-4" : "h-full rounded-[1.9rem] px-5 py-4.5 xl:px-6 xl:py-5",
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.22),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.16),_transparent_30%),linear-gradient(145deg,#05262a_0%,#0b4a48_48%,#19a56f_100%)]" />
      <div className="absolute -left-12 top-8 h-36 w-36 rounded-full bg-emerald-300/18 blur-3xl" />
      <div className="absolute -right-10 bottom-6 h-40 w-40 rounded-full bg-cyan-300/18 blur-3xl" />

      <div className="relative flex h-full flex-col justify-between gap-3.5">
        <div className="space-y-3">
          <div className="space-y-3">
            <div className="inline-flex items-center rounded-full border border-white/14 bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-50/90">
              {brandEyebrow}
            </div>
            <div className="space-y-3" style={{ viewTransitionName: "taskverified-auth-brand-copy" }}>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/55">TaskVerified</p>
              <h2 className={cn("max-w-md font-semibold leading-tight tracking-tight", compact ? "text-[1.75rem]" : "text-[1.8rem] sm:text-[1.95rem]")}>
                {brandTitle}
              </h2>
              <p className={cn("max-w-md text-white/78", compact ? "text-sm leading-6" : "text-sm leading-6 sm:text-[15px]")}>
                {brandDescription}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {trustPills.map((pill, index) => (
              <AuthTrustPill key={pill} label={pill} isActive={compact ? index < 2 : true} />
            ))}
          </div>

          {!compact ? null : (
            <div className="rounded-[1.35rem] border border-white/10 bg-white/8 p-4 backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/58">{features[0]?.title}</p>
              <p className="mt-2 text-sm leading-6 text-white/75">{features[0]?.description}</p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className={cn("rounded-[1.5rem] border border-white/10 bg-black/18 backdrop-blur", compact ? "p-3.5" : "p-4")}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/52">{insightsEyebrow}</p>
            <div className="mt-3 space-y-3">
              {insights.slice(0, compact ? 1 : 1).map((insight) => (
                <div key={insight.title} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5">
                  <p className="text-sm font-semibold">{insight.title}</p>
                  <p className="mt-1.5 text-sm leading-5 text-white/70">{insight.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.14),_transparent_30%),radial-gradient(circle_at_82%_12%,_rgba(34,211,238,0.1),_transparent_26%),linear-gradient(180deg,_#f7fbfb_0%,_#eef4f4_48%,_#f8fafc_100%)]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-48 bg-[linear-gradient(180deg,rgba(7,19,25,0.04),transparent)]" />

      <div className="mx-auto flex min-h-[calc(100vh-8.5rem)] max-w-[980px] items-start px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4">
        <div
          className="relative w-full overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/70 shadow-[0_30px_110px_-60px_rgba(15,23,42,0.55)] backdrop-blur"
          style={{ viewTransitionName: "taskverified-auth-card" }}
        >
          <div className="relative lg:hidden">
            <div
              className={cn(
                "relative overflow-hidden rounded-t-[2rem] px-4 pt-4 sm:px-5 sm:pt-5",
              )}
              style={{ viewTransitionName: "taskverified-auth-green-slab-mobile" }}
            >
              {renderBrandStage(true)}
            </div>
            <div className="relative z-10 px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
              <div
                className="rounded-[1.65rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(248,250,252,0.95))] p-4 shadow-[0_26px_72px_-40px_rgba(15,23,42,0.42)] backdrop-blur"
                style={{ viewTransitionName: "taskverified-auth-form-stage-mobile" }}
              >
                {renderFormStage(true)}
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(248,250,252,0.62))]" />
            <div className="relative grid gap-4 p-4 lg:grid-cols-[minmax(360px,420px)_minmax(0,1fr)] xl:gap-5 xl:p-5">
              <div
                className={cn(
                  "rounded-[1.7rem] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.95))] p-4.5 shadow-[0_32px_88px_-44px_rgba(15,23,42,0.46)] backdrop-blur xl:p-5",
                  isSignUp ? "lg:order-2" : "lg:order-1",
                )}
                style={{ viewTransitionName: "taskverified-auth-form-stage" }}
              >
                {renderFormStage(false)}
              </div>

              <div
                className={cn(
                  "min-h-full",
                  isSignUp ? "lg:order-1" : "lg:order-2",
                )}
                style={{
                  viewTransitionName: "taskverified-auth-green-slab",
                  transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                {renderBrandStage(false)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
