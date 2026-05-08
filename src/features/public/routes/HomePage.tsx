import { ArrowRight, CheckCircle2, ClipboardCheck, FileCheck2, ShieldCheck, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { formatLamportsAsSol } from "@/features/solana/lib/payoutExecution";
import { seededPayouts, seededTasks } from "@/features/tasks/data/taskSeeds";
import { formatCategoryLabel, formatMoney, getPublicTasks } from "@/features/tasks/data/sampleData";
import { formatClaimAvailability } from "@/features/tasks/lib/claimSlots";

const publicTasks = getPublicTasks(seededTasks);
const featuredTask = publicTasks[0];
const releasedPayout = seededPayouts.find((payout) => payout.status === "released");

const operatingLoop = [
  {
    title: "Define work",
    description: "Scope reward, deadline, and proof requirements before the task is claimed.",
    icon: ClipboardCheck,
  },
  {
    title: "Submit proof",
    description: "Workers submit evidence against the same visible bar they accepted.",
    icon: FileCheck2,
  },
  {
    title: "Review evidence",
    description: "Posters approve or reject the proof package before payout state moves.",
    icon: ShieldCheck,
  },
  {
    title: "Release payout",
    description: "Approved work enters a poster-released payout flow.",
    icon: WalletCards,
  },
];

export function HomePage() {
  return (
    <div className="space-y-5">
      <section className="tv-surface overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_390px]">
          <div className="px-5 py-7 sm:px-7 md:py-8 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Human-verified micro-work</p>
            <h1 className="mt-3 max-w-3xl text-[2.35rem] font-semibold leading-[0.98] tracking-tight text-slate-950 md:text-[3.35rem] lg:text-[3.6rem]">
              Proof-first tasks with deliberate payout release.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
              TaskVerified turns small work into reviewable packets: a clear proof bar, a submitted evidence record, and a poster-released payout step.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-10 rounded-full px-5 font-semibold">
                <Link to="/signup">Start with TaskVerified</Link>
              </Button>
              <Button asChild variant="outline" className="h-10 rounded-full border-slate-300 bg-white px-5">
                <Link to="/tasks">
                  Browse examples <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="border-t border-slate-200/80 bg-slate-50/80 p-4 sm:p-5 lg:border-l lg:border-t-0">
            <div className="rounded-2xl bg-slate-950 p-4 text-white shadow-ledger-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-emerald-200">Proof object</p>
                  <h2 className="mt-2 text-lg font-semibold tracking-tight">{featuredTask?.title ?? "Task proof review"}</h2>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-950">
                  {featuredTask ? formatMoney(featuredTask.rewardAmount, featuredTask.rewardCurrency) : "$24"}
                </span>
              </div>
              <div className="mt-4 space-y-2.5">
                {(featuredTask?.proofRequirements ?? ["Screenshots", "Structured notes", "Device details"]).slice(0, 3).map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-xl bg-white/[0.07] px-3 py-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                    <span className="text-sm font-medium leading-5 text-slate-100">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 divide-x divide-white/10 rounded-xl border border-white/10 bg-white/[0.04] text-center">
                <div className="p-2.5">
                  <p className="text-sm font-semibold">Open</p>
                  <p className="mt-0.5 text-[0.68rem] uppercase tracking-[0.16em] text-slate-400">claim</p>
                </div>
                <div className="p-2.5">
                  <p className="text-sm font-semibold">Proof</p>
                  <p className="mt-0.5 text-[0.68rem] uppercase tracking-[0.16em] text-slate-400">required</p>
                </div>
                <div className="p-2.5">
                  <p className="text-sm font-semibold">Review</p>
                  <p className="mt-0.5 text-[0.68rem] uppercase tracking-[0.16em] text-slate-400">before pay</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="tv-surface px-4 py-4 sm:px-5">
        <div className="grid gap-0 md:grid-cols-4 md:divide-x md:divide-slate-200/80">
          {operatingLoop.map((step, index) => (
            <div key={step.title} className="flex gap-3 border-b border-slate-200/80 py-3 last:border-b-0 md:block md:border-b-0 md:px-4 md:py-2 md:first:pl-1 md:last:pr-1">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-primary">
                <step.icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400">0{index + 1}</div>
                <h2 className="mt-1 text-sm font-semibold tracking-tight text-slate-950 md:text-base">{step.title}</h2>
                <p className="mt-1 text-sm leading-5 text-slate-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {featuredTask ? (
        <section className="grid gap-4 lg:grid-cols-[0.82fr_1.18fr] lg:items-stretch">
          <div className="tv-surface p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Public task preview</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">The task is the contract.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Public examples show the reward, worker slots, category, deadline, proof bar, and current release model before a worker enters the claim flow.
            </p>
            <div className="mt-5">
              <Button asChild variant="outline" className="h-10 rounded-full border-slate-300 bg-white">
                <Link to="/tasks">
                  View public tasks <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="tv-surface overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200/80 bg-slate-50/80 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                  {formatCategoryLabel(featuredTask.category)}
                </p>
                <h3 className="mt-1.5 text-xl font-semibold tracking-tight text-slate-950">{featuredTask.title}</h3>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-950 ring-1 ring-slate-200">
                {formatMoney(featuredTask.rewardAmount, featuredTask.rewardCurrency)}
              </span>
            </div>
            <div className="p-5">
              <p className="text-sm leading-6 text-slate-600">{featuredTask.description}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <div className="tv-ledger-row">
                  <span>Worker slots</span>
                  <strong>{formatClaimAvailability(featuredTask)}</strong>
                </div>
                <div className="tv-ledger-row">
                  <span>Status</span>
                  <strong className="capitalize">{featuredTask.status}</strong>
                </div>
                <div className="tv-ledger-row">
                  <span>Deadline</span>
                  <strong>{new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(featuredTask.deadlineAt))}</strong>
                </div>
              </div>
              <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-600">
                <span className="font-medium text-slate-950">Release model:</span> Payouts are released by the poster after approved proof in this build.
              </div>
            </div>
            <div className="border-t border-slate-200/80 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Proof requirements</p>
              <div className="mt-3 flex flex-wrap gap-2">
              {featuredTask.proofRequirements.map((item) => (
                <span key={item} className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                  {item}
                </span>
              ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="tv-surface grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center md:p-6">
        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">Release is a decision, not a slogan.</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Approval prepares payout state; release remains poster-controlled in this build and depends on visible wallet context and transaction outcome. Escrow is planned for the next release model.
              {releasedPayout ? ` Latest sample: ${formatMoney(releasedPayout.amount, "USD")} reward released through a devnet SOL transfer target of ${formatLamportsAsSol(releasedPayout.transferAmountLamports)}.` : ""}
            </p>
          </div>
        </div>
        <Button asChild className="h-10 rounded-full px-5">
          <Link to="/signin">Enter workspace</Link>
        </Button>
      </section>
    </div>
  );
}
