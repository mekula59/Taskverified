import { type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, CircleDot, LockKeyhole } from "lucide-react";

import { cn } from "@/lib/utils";
import type { StatusTone } from "@/components/shell/workspaceStatus";

const statusToneClasses: Record<StatusTone, string> = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  success: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  warning: "bg-amber-50 text-amber-800 ring-amber-200",
  danger: "bg-rose-50 text-rose-800 ring-rose-200",
  info: "bg-cyan-50 text-cyan-800 ring-cyan-200",
  dark: "bg-slate-950 text-white ring-slate-950",
};

export function StatusPill({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: StatusTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ring-1",
        statusToneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function WorkspaceHero({
  eyebrow,
  title,
  description,
  action,
  aside,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="tv-surface overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-slate-950 md:text-[2.35rem]">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">{description}</p>
          {action ? <div className="mt-5">{action}</div> : null}
        </div>
        {aside ? <div className="border-t border-slate-200/80 bg-slate-50/80 p-4 lg:border-l lg:border-t-0">{aside}</div> : null}
      </div>
    </section>
  );
}

export function ActionPanel({
  eyebrow,
  title,
  description,
  children,
  tone = "dark",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
  tone?: "dark" | "light";
}) {
  return (
    <div className={cn("rounded-2xl p-4", tone === "dark" ? "bg-slate-950 text-white shadow-ledger-sm" : "bg-slate-50 text-slate-950 ring-1 ring-slate-200")}>
      <p className={cn("text-[11px] font-semibold uppercase tracking-[0.2em]", tone === "dark" ? "text-emerald-100/75" : "text-slate-500")}>{eyebrow}</p>
      <h2 className="mt-2 text-lg font-semibold tracking-tight">{title}</h2>
      {description ? <p className={cn("mt-2 text-sm leading-6", tone === "dark" ? "text-white/70" : "text-slate-600")}>{description}</p> : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}

export function LedgerObject({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <article className={cn("tv-surface overflow-hidden", className)}>{children}</article>;
}

export function LedgerHeader({
  eyebrow,
  title,
  description,
  meta,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200/80 bg-white px-5 py-4">
      <div className="min-w-0">
        {eyebrow ? <div className="mb-2">{eyebrow}</div> : null}
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
        {description ? <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {meta ? <div className="shrink-0">{meta}</div> : null}
    </div>
  );
}

export function LedgerRows({
  rows,
  className,
}: {
  rows: Array<{ label: ReactNode; value: ReactNode; valueClassName?: string }>;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      {rows.map((row, index) => (
        <div key={index} className="tv-ledger-row">
          <span>{row.label}</span>
          <strong className={row.valueClassName}>{row.value}</strong>
        </div>
      ))}
    </div>
  );
}

export function ProofList({
  title = "Proof requirements",
  items,
  dark = false,
}: {
  title?: string;
  items: string[];
  dark?: boolean;
}) {
  return (
    <div className={cn("rounded-2xl p-4", dark ? "bg-slate-950 text-white" : "bg-slate-50/80 ring-1 ring-slate-200/80")}>
      <p className={cn("text-[11px] font-semibold uppercase tracking-[0.18em]", dark ? "text-emerald-100/75" : "text-slate-500")}>{title}</p>
      <div className="mt-3 grid gap-2">
        {items.map((item) => (
          <div key={item} className={cn("flex items-start gap-2 rounded-xl px-3 py-2 text-sm font-medium", dark ? "bg-white/[0.07] text-white/80" : "bg-white text-slate-700 ring-1 ring-slate-200/80")}>
            <CheckCircle2 className={cn("mt-0.5 h-4 w-4 shrink-0", dark ? "text-emerald-200" : "text-primary")} />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon = "empty",
}: {
  title: string;
  description: string;
  icon?: "empty" | "locked" | "warning";
}) {
  const Icon = icon === "locked" ? LockKeyhole : icon === "warning" ? AlertTriangle : CircleDot;

  return (
    <div className="rounded-2xl bg-slate-50/80 px-5 py-4 text-sm leading-6 text-slate-600 ring-1 ring-slate-200/80">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-primary ring-1 ring-slate-200">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="font-semibold text-slate-950">{title}</p>
          <p className="mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}
