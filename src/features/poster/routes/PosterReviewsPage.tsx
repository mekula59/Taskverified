import { PageIntro } from "@/components/shell/PageIntro";
import { SectionCard } from "@/components/shell/SectionCard";

const reviewDecisions = [
  "Approve proof and release to payout queue.",
  "Reject with reason tied to missing or invalid proof.",
  "Request revision without losing earlier evidence.",
  "Escalate suspicious activity for manual verification.",
];

export function PosterReviewsPage() {
  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Poster"
        title="Review is where trust is enforced."
        description="This route stays dedicated to proof review decisions and auditability. It should not become a generic comment thread or chat experience."
      />
      <SectionCard title="Review decision model">
        <ul className="space-y-3 text-sm text-muted-foreground">
          {reviewDecisions.map((decision) => (
            <li key={decision} className="rounded-xl border border-border/60 bg-background/70 px-4 py-3">
              {decision}
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
