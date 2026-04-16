import { PageIntro } from "@/components/shell/PageIntro";
import { SectionCard } from "@/components/shell/SectionCard";

const settingsGroups = [
  {
    title: "Identity and payouts",
    items: ["Verification status", "Payout destination", "Tax and compliance placeholders"],
  },
  {
    title: "Notifications",
    items: ["Claim alerts", "Review reminders", "Payout status updates"],
  },
  {
    title: "Policy visibility",
    items: ["Worker proof rules", "Poster review expectations", "Appeal and hold notices"],
  },
];

export function SettingsPage() {
  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Shared"
        title="Settings should reinforce trust operations."
        description="This shell keeps configuration scoped to verification, payout readiness, and policy visibility instead of adding generic account clutter."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        {settingsGroups.map((group) => (
          <SectionCard key={group.title} title={group.title}>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {group.items.map((item) => (
                <li key={item} className="rounded-xl border border-border/60 bg-background/70 px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
