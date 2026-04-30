import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { seededPayouts, seededTasks } from "@/features/tasks/data/taskSeeds";
import { formatCategoryLabel, formatMoney, getPublicTasks } from "@/features/tasks/data/sampleData";

const publicTasks = getPublicTasks(seededTasks);
const featuredTask = publicTasks[0];
const releasedPayout = seededPayouts.find((payout) => payout.status === "released");

const operatingLoop = [
  {
    title: "Define work",
    description: "Scope the task, reward, deadline, and proof requirements before anyone commits.",
  },
  {
    title: "Submit proof",
    description: "Workers complete the job against a visible bar instead of vague instructions.",
  },
  {
    title: "Review",
    description: "Posters judge the submitted evidence before payout state can advance.",
  },
  {
    title: "Release payout",
    description: "Approved work moves through an explicit Solana release path.",
  },
];

export function HomePage() {
  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[1.75rem] bg-slate-950 text-white shadow-[0_28px_90px_-60px_rgba(15,23,42,0.9)]">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="px-6 py-6 md:px-8 md:py-7 lg:px-9 lg:py-7">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">Human-verified micro-work</p>
              <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-[1.03] tracking-tight md:text-[2.9rem]">
                Work is only trusted when the proof can be judged.
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-6 text-slate-300">
                TaskVerified turns small tasks into accountable work packets: requirements first, proof second, review third, payout last.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button asChild className="h-10 rounded-full bg-white px-5 font-semibold text-slate-950 hover:bg-emerald-50">
                  <Link to="/signup">Create account</Link>
                </Button>
                <Button asChild variant="outline" className="h-10 rounded-full border-white/18 bg-transparent px-5 text-white hover:bg-white/10 hover:text-white">
                  <Link to="/tasks">Browse task examples</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 bg-white/[0.045] p-4 lg:border-l lg:border-t-0 lg:p-4">
            <div className="rounded-[1.2rem] bg-white p-3.5 text-slate-950 shadow-[0_24px_70px_-52px_rgba(0,0,0,0.8)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Proof packet</p>
                  <h2 className="mt-1.5 text-lg font-semibold tracking-tight">{featuredTask?.title ?? "Task proof review"}</h2>
                </div>
                <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                  {featuredTask ? formatMoney(featuredTask.rewardAmount, featuredTask.rewardCurrency) : "$24"}
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {(featuredTask?.proofRequirements ?? ["Screenshots", "Structured notes", "Device details"]).slice(0, 3).map((item) => (
                  <div key={item} className="flex items-center gap-3 border-b border-slate-100 pb-2 last:border-b-0 last:pb-0">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span className="text-sm font-medium text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl bg-slate-50 p-2">
                  <p className="font-semibold text-slate-950">Open</p>
                  <p className="mt-1 text-slate-500">claim</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-2">
                  <p className="font-semibold text-slate-950">Proof</p>
                  <p className="mt-1 text-slate-500">required</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-2">
                  <p className="font-semibold text-slate-950">Review</p>
                  <p className="mt-1 text-slate-500">before pay</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[1.5rem] bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200 md:px-6">
        <div className="grid gap-3 md:grid-cols-4">
          {operatingLoop.map((step, index) => (
            <div key={step.title} className="relative border-l border-slate-200 pl-4 first:border-l-0 first:pl-0 md:first:border-l md:first:pl-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">0{index + 1}</div>
              <h2 className="mt-2 text-base font-semibold tracking-tight text-slate-950">{step.title}</h2>
              <p className="mt-1.5 text-sm leading-5 text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {featuredTask ? (
        <section className="grid gap-4 rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-slate-200 md:p-5 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Public task preview</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">A task should show the standard before the claim.</h2>
            <p className="mt-2 text-sm leading-5 text-slate-600">
              The public directory stays restrained, but every example still exposes reward, claim state, category, and proof requirements.
            </p>
            <Button asChild variant="outline" className="mt-4 h-10 rounded-full border-slate-300 bg-white">
              <Link to="/tasks">
                View public tasks <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="rounded-[1.2rem] bg-slate-50 p-4 ring-1 ring-slate-200">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  {formatCategoryLabel(featuredTask.category)}
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">{featuredTask.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{featuredTask.description}</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-950 ring-1 ring-slate-200">
                {formatMoney(featuredTask.rewardAmount, featuredTask.rewardCurrency)}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {featuredTask.proofRequirements.map((item) => (
                <span key={item} className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-slate-200 md:grid-cols-[1fr_auto] md:items-center md:p-7">
        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-emerald-200">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Release is deliberate.</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Approval prepares payout state; release still depends on a visible decision, wallet context, and transaction outcome.
              {releasedPayout ? ` Latest sample: ${formatMoney(releasedPayout.amount, "USD")} released via ${releasedPayout.currencyToken}.` : ""}
            </p>
          </div>
        </div>
        <Button asChild className="h-11 rounded-full bg-slate-950 px-5 text-white hover:bg-slate-800">
          <Link to="/signin">Enter workspace</Link>
        </Button>
      </section>
    </div>
  );
}
