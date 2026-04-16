import { Badge } from "@/components/ui/badge";
import { PageIntro } from "@/components/shell/PageIntro";
import { SectionCard } from "@/components/shell/SectionCard";
import { useAuth } from "@/features/auth/context/useAuth";

const statusCopy = {
  unverified: {
    label: "Unverified",
    detail: "Verification has not been submitted yet. Worker claiming should remain blocked.",
  },
  pending: {
    label: "Pending review",
    detail: "Verification has been submitted and is awaiting review.",
  },
  verified: {
    label: "Verified",
    detail: "Identity and readiness checks passed. Claiming can proceed.",
  },
  flagged: {
    label: "Flagged",
    detail: "Manual review is required before access can continue.",
  },
};

export function VerificationPage() {
  const auth = useAuth();
  const currentStatus = auth.verification?.status ?? "unverified";
  const copy = statusCopy[currentStatus];

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Shared"
        title="Verification is modeled as a real state, not a marketing badge."
        description="This page now reflects the current frontend-safe auth state so a Supabase-backed verification record can slot in later without changing the UI contract."
      />
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <SectionCard title="Current status">
          <div className="space-y-4">
            <Badge className="rounded-full px-3 py-1">{copy.label}</Badge>
            <p className="text-sm text-muted-foreground">{copy.detail}</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>User: <span className="font-medium text-foreground">{auth.profile?.fullName ?? "No profile yet"}</span></div>
              <div>Role: <span className="font-medium capitalize text-foreground">{auth.user?.role ?? "unassigned"}</span></div>
              {auth.verification?.submittedAt ? <div>Submitted: <span className="font-medium text-foreground">{new Date(auth.verification.submittedAt).toLocaleString()}</span></div> : null}
              {auth.verification?.reviewedAt ? <div>Reviewed: <span className="font-medium text-foreground">{new Date(auth.verification.reviewedAt).toLocaleString()}</span></div> : null}
            </div>
          </div>
        </SectionCard>
        <SectionCard title="Review notes">
          <div className="rounded-2xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
            {auth.verification?.notes ?? "No verification notes are available yet."}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
