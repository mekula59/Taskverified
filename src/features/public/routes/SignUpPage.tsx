import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { PageIntro } from "@/components/shell/PageIntro";
import { SectionCard } from "@/components/shell/SectionCard";
import { useAuth } from "@/features/auth/context/useAuth";
import { Button } from "@/components/ui/button";

export function SignUpPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async (role: "worker" | "poster") => {
    setError(null);

    try {
      await auth.continueDemoAsRole(role);
      navigate(role === "worker" ? "/worker" : "/poster");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to start the selected role path.");
    }
  };

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Auth"
        title="Start with a clean, role-aware foundation."
        description="You can enter onboarding with a new Supabase-backed session through sign in, or use a seeded backend demo path to inspect the worker and poster flows."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Worker demo path" description="Inspect claiming, proof, verification, and payout framing.">
          <Button onClick={() => handleContinue("worker")}>Open worker foundation</Button>
        </SectionCard>
        <SectionCard title="Poster demo path" description="Inspect task creation, review, and payout framing.">
          <Button onClick={() => handleContinue("poster")}>Open poster foundation</Button>
        </SectionCard>
      </div>
      {error ?? auth.error ? <p className="text-sm text-destructive">{error ?? auth.error}</p> : null}
    </div>
  );
}
