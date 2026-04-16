import { PageIntro } from "@/components/shell/PageIntro";
import { SectionCard } from "@/components/shell/SectionCard";

const submissionStates = [
  "Draft proof should support structured text, links, and required attachments.",
  "Submitted proof should lock edits and wait for poster review.",
  "Revision requests should preserve the audit trail instead of overwriting history.",
  "Approved proof should hand off directly into payout processing.",
];

export function WorkerSubmissionsPage() {
  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Worker"
        title="Proof submission is the center of worker execution."
        description="This shell exists to keep proof handling explicit before backend work begins. Implementation should treat proof as the unit of review, not loose comments."
      />
      <SectionCard title="Submission states" description="Expected responsibilities for the worker proof flow.">
        <ul className="space-y-3 text-sm text-muted-foreground">
          {submissionStates.map((state) => (
            <li key={state} className="rounded-xl border border-border/60 bg-background/70 px-4 py-3">
              {state}
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
