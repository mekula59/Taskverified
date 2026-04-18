import { ArrowRight, BadgeCheck, Eye, ShieldCheck, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { lifecycleSteps } from "@/features/shared/data/appShell";
import { seededPayouts, seededTasks } from "@/features/tasks/data/taskSeeds";
import { formatCategoryLabel, formatMoney, getPublicTasks } from "@/features/tasks/data/sampleData";

const publicTasks = getPublicTasks(seededTasks);
const homepageExamples = publicTasks.slice(0, 2);
const releasedPayouts = seededPayouts.filter((payout) => payout.status === "released");

const operatingPrinciples = [
  {
    title: "Real people, tightly scoped work",
    description: "TaskVerified is built for small operational jobs that still need a human in the loop: testing, research, community verification, and structured content work.",
    icon: <BadgeCheck className="h-5 w-5" />,
  },
  {
    title: "Proof before approval",
    description: "Every task ships with explicit proof requirements so review is based on evidence, not vague completion claims or back-and-forth chat.",
    icon: <Eye className="h-5 w-5" />,
  },
  {
    title: "Solana where it matters",
    description: "Solana gives the payout rail speed, low-cost settlement, and wallet-native custody without turning the whole product into crypto theater.",
    icon: <Wallet className="h-5 w-5" />,
  },
] as const;

export function HomePage() {
  return (
    <div className="space-y-8 md:space-y-12">
      <section className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr] xl:items-stretch">
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] p-6 shadow-[0_35px_120px_-55px_rgba(15,23,42,0.45)] sm:p-8 xl:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.14),_transparent_28%),radial-gradient(circle_at_88%_14%,_rgba(34,211,238,0.12),_transparent_26%)]" />
          <div className="relative space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-800">
                Frontier
              </Badge>
              <div className="space-y-4">
                <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl xl:text-[4.35rem]">
                  Hire real people for small tasks. Review proof. Pay on Solana.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-600">
                  TaskVerified turns lightweight operational work into a trust-first system: clear tasks, evidence-based review, and wallet-native payouts that actually close the loop.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 rounded-full bg-slate-950 px-6 text-white hover:bg-slate-800">
                <Link to="/signup">Get started</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-slate-300 bg-white px-6">
                <Link to="/tasks">Browse example tasks</Link>
              </Button>
            </div>

            <div className="grid gap-4 border-t border-slate-200 pt-6 sm:grid-cols-[1.18fr_0.82fr]">
              <div className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Why this reads as real</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <p className="text-sm font-semibold text-slate-950">Work is scoped before anyone starts</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Each task already carries a single clear claim slot, evidence requirements, and payout consequence. The trust model is visible before commitment.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <p className="text-sm font-semibold text-slate-950">Release only happens after review</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">TaskVerified does not ask for blind trust. Proof is submitted, reviewed, and only then can value move to the wallet rail.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-950 p-5 text-white">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-100/70">Concrete proof points</p>
                <div className="mt-4 space-y-4">
                  {homepageExamples.map((task) => (
                    <div key={task.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm font-semibold text-white">{task.title}</p>
                      <p className="mt-2 text-sm leading-6 text-white/70">{task.proofRequirements.slice(0, 2).join(" · ")}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#07141a] p-6 text-white shadow-[0_35px_120px_-55px_rgba(2,8,23,0.8)] sm:p-8 xl:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.16),_transparent_28%)]" />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div className="space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-100/75">Why this feels trustworthy</p>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">The loop is visible from the first screen.</h2>
              <p className="max-w-lg text-base leading-7 text-white/72">
                TaskVerified is not selling vague marketplace magic. It shows the operating model clearly: define the work, require proof, review against evidence, and release payment through a wallet-native rail.
              </p>
            </div>

            <div className="space-y-3">
              {lifecycleSteps.map((step, index) => (
                <div key={step.title} className="rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur">
                  <div className="flex items-start gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-emerald-100">
                      {index + 1}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-white">{step.title}</p>
                      <p className="text-sm leading-6 text-white/68">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm sm:p-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              Product story
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Why Solana belongs here</h2>
            <p className="text-base leading-7 text-slate-600">
              Solana is not the headline. It is the infrastructure choice that makes small payouts practical, fast, and visible without adding operational drag.
            </p>
          </div>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-sm font-semibold text-slate-950">Low-value tasks need low-friction settlement</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">If the work is small, payout overhead cannot dominate the economics. Solana keeps release lightweight.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-sm font-semibold text-slate-950">Wallets make payout custody explicit</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">The same identity that does the work can remain tied to the address that receives the payout.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-sm font-semibold text-slate-950">The product stays operational, not speculative</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">TaskVerified uses chain where it improves execution, not as a substitute for a clear trust model.</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] p-6 shadow-sm sm:p-8">
          <div className="grid gap-4">
            {operatingPrinciples.map((principle, index) => (
              <div key={principle.title} className="grid gap-4 rounded-[1.5rem] border border-slate-200 bg-white/85 p-5 md:grid-cols-[auto_1fr_auto] md:items-start">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-emerald-200">
                  {principle.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold tracking-tight text-slate-950">{principle.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{principle.description}</p>
                </div>
                <div className="text-sm font-semibold text-slate-400">0{index + 1}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] p-6 shadow-sm sm:p-8 xl:p-10">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-4">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              Live examples
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Tasks that look like real work, not growth-hack filler</h2>
            <p className="text-base leading-7 text-slate-600">
              The public queue makes the product legible immediately: scoped work, explicit proof bars, and visible payout consequence instead of demo-style metric theater.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-full border-slate-300 bg-white">
            <Link to="/tasks">
              View all tasks <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="grid gap-4">
            {homepageExamples.map((task) => (
              <div key={task.id} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                    {formatCategoryLabel(task.category)}
                  </div>
                  <div className="text-sm font-semibold text-emerald-700">{formatMoney(task.rewardAmount, task.rewardCurrency)}</div>
                </div>
                <h3 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">{task.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{task.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {task.proofRequirements.map((item) => (
                    <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                      {item}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
                  <span>{task.claimCount >= task.claimLimit ? "Claim slot filled" : "Claim slot open"}</span>
                  <span className="capitalize">{task.status}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-100/70">What judges should notice</p>
              <ShieldCheck className="h-5 w-5 text-emerald-200" />
            </div>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">The review bar is explicit</p>
                <p className="mt-2 text-sm leading-6 text-white/70">Proof requirements are part of the task itself, so approval is tied to evidence instead of vague delivery claims.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">The payout consequence is visible</p>
                <p className="mt-2 text-sm leading-6 text-white/70">Released payouts are recorded as the end of the trust loop, not treated as background bookkeeping.</p>
              </div>
              {releasedPayouts[0] ? (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-emerald-100/70">Observed release state</p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {formatMoney(releasedPayouts[0].amount, "USD")} released via {releasedPayouts[0].currencyToken}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-emerald-100/75">
                    The important signal is not scale theater. It is that review and release already connect cleanly inside one operating loop.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_auto] xl:items-center">
        <div className="space-y-4">
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            Start here
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">A tighter way to run small human tasks</h2>
          <p className="max-w-3xl text-base leading-7 text-slate-600">
            TaskVerified is built for teams that need real human work done, want review discipline, and care about payout clarity. The product story is simple because the operating model is simple.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg" className="h-12 rounded-full bg-slate-950 px-6 text-white hover:bg-slate-800">
            <Link to="/signup">Create an account</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-slate-300 bg-white px-6">
            <Link to="/signin">Sign in</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
