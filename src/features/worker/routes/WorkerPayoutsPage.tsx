import { PageIntro } from "@/components/shell/PageIntro";
import { SectionCard } from "@/components/shell/SectionCard";

const payoutRules = [
  "Payout state must map cleanly to review state.",
  "Workers should see pending, processing, paid, and held statuses.",
  "Reputation updates should happen after review outcomes, not before.",
];

export function WorkerPayoutsPage() {
  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Worker"
        title="Payout visibility should follow approved proof."
        description="This route stays tightly scoped to payment status and hold explanations so workers understand how completed proof becomes released earnings."
      />
      <SectionCard title="Payout model">
        <ul className="space-y-3 text-sm text-muted-foreground">
          {payoutRules.map((rule) => (
            <li key={rule} className="rounded-xl border border-border/60 bg-background/70 px-4 py-3">
              {rule}
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
