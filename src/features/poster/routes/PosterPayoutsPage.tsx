import { PageIntro } from "@/components/shell/PageIntro";
import { SectionCard } from "@/components/shell/SectionCard";

const payoutControls = [
  "Funds reserved before or during task publication.",
  "Release only after approval or revision resolution.",
  "Visible payout status for poster and worker.",
  "Manual hold path for fraud or policy review.",
];

export function PosterPayoutsPage() {
  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Poster"
        title="Poster payouts follow review outcomes."
        description="The payout area remains tightly coupled to approval decisions so the product stays centered on verified work, not broad invoicing or marketplace billing."
      />
      <SectionCard title="Payout controls">
        <ul className="space-y-3 text-sm text-muted-foreground">
          {payoutControls.map((control) => (
            <li key={control} className="rounded-xl border border-border/60 bg-background/70 px-4 py-3">
              {control}
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
