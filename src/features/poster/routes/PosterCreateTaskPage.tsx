import { PageIntro } from "@/components/shell/PageIntro";
import { SectionCard } from "@/components/shell/SectionCard";
import { posterTrustSignals } from "@/features/shared/data/appShell";
import { MetricCard } from "@/components/shell/MetricCard";

const taskFields = [
  "Task title and concise scope",
  "Reward amount and payout policy",
  "Claim limit and deadline",
  "Required proof checklist",
  "Review SLA and rejection criteria",
];

export function PosterCreateTaskPage() {
  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Poster"
        title="Task creation should produce reviewable work."
        description="This shell preserves the structure the real form will need: tight scope, explicit proof requirements, payout clarity, and review rules."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {posterTrustSignals.map((signal) => (
          <MetricCard key={signal.label} label={signal.label} value={signal.value} detail={signal.detail} icon={signal.icon} />
        ))}
      </div>
      <SectionCard title="Creation checklist">
        <ul className="space-y-3 text-sm text-muted-foreground">
          {taskFields.map((field) => (
            <li key={field} className="rounded-xl border border-border/60 bg-background/70 px-4 py-3">
              {field}
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
