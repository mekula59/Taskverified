import { useNavigate } from "react-router-dom";

import { PageIntro } from "@/components/shell/PageIntro";
import { SectionCard } from "@/components/shell/SectionCard";
import { useAuth } from "@/features/auth/context/useAuth";
import { Button } from "@/components/ui/button";

export function SignUpPage() {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleContinue = (role: "worker" | "poster") => {
    auth.continueDemoAsRole(role);
    navigate(role === "worker" ? "/worker" : "/poster");
  };

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Auth"
        title="Start with a clean, role-aware foundation."
        description="Sign-up remains frontend-safe in this phase. You can enter onboarding through sign-in with a new email or use a demo path to inspect the worker and poster foundations."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Worker demo path" description="Inspect claiming, proof, verification, and payout framing.">
          <Button onClick={() => handleContinue("worker")}>Open worker foundation</Button>
        </SectionCard>
        <SectionCard title="Poster demo path" description="Inspect task creation, review, and payout framing.">
          <Button onClick={() => handleContinue("poster")}>Open poster foundation</Button>
        </SectionCard>
      </div>
    </div>
  );
}
