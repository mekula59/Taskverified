import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { MetricCard } from "@/components/shell/MetricCard";
import { PageIntro } from "@/components/shell/PageIntro";
import { SectionCard } from "@/components/shell/SectionCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { lifecycleSteps, publicTrustSignals } from "@/features/shared/data/appShell";

const areaCards = [
  {
    title: "Public",
    description: "Landing, task discovery, and product explanation.",
    route: "/tasks",
  },
  {
    title: "Worker",
    description: "Claim tasks, submit proof, monitor payouts, and build reputation.",
    route: "/worker",
  },
  {
    title: "Poster",
    description: "Create tasks, review proof, release payouts, and maintain trust.",
    route: "/poster",
  },
  {
    title: "Shared",
    description: "Verification and settings that support both sides of the marketplace.",
    route: "/verify",
  },
] as const;

export function HomePage() {
  return (
    <div className="space-y-10">
      <PageIntro
        eyebrow="Public"
        title="A cleaner shell for trust-first micro-work."
        description="This repo now centers the actual TaskVerified loop: create task, claim task, submit proof, review, payout, and reputation update. The shell keeps that loop visible without pretending the product is already implemented."
        actions={
          <>
            <Button asChild>
              <Link to="/poster/tasks/new">Explore poster flow</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/worker/tasks">Explore worker flow</Link>
            </Button>
          </>
        }
      />

      <SectionCard
        title="Core MVP loop"
        description="The starter should keep implementation anchored to this sequence."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {lifecycleSteps.map((step, index) => (
            <div key={step.title} className="rounded-3xl border border-border/60 bg-background/70 p-5">
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                Step {index + 1}
              </Badge>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {publicTrustSignals.map((signal) => (
          <MetricCard key={signal.label} label={signal.label} value={signal.value} detail={signal.detail} icon={signal.icon} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {areaCards.map((area) => (
          <SectionCard key={area.title} title={area.title} description={area.description}>
            <Button asChild variant="ghost" className="px-0 text-primary">
              <Link to={area.route}>
                Open area <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
