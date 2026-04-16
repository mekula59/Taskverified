import { PageIntro } from "@/components/shell/PageIntro";
import { SectionCard } from "@/components/shell/SectionCard";

const reputationDrivers = [
  "Approved proof quality",
  "On-time completion",
  "Low dispute and revision rate",
  "Verified identity and payout readiness",
];

export function WorkerReputationPage() {
  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Worker"
        title="Reputation should be operational, not cosmetic."
        description="The reputation area is reserved for task trust signals tied to completion behavior. It should not drift into social profiles, feeds, or generic badges."
      />
      <SectionCard title="Reputation drivers">
        <ul className="grid gap-3 md:grid-cols-2">
          {reputationDrivers.map((driver) => (
            <li key={driver} className="rounded-xl border border-border/60 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
              {driver}
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
