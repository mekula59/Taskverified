import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { PageIntro } from "@/components/shell/PageIntro";
import { SectionCard } from "@/components/shell/SectionCard";
import { useAuth } from "@/features/auth/context/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignInPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");

  const next = (location.state as { from?: string } | null)?.from;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    auth.signInWithEmail(email);
    const normalized = email.trim().toLowerCase();

    if (normalized === "worker@taskverified.demo") {
      navigate(next ?? "/worker");
      return;
    }

    if (normalized === "poster@taskverified.demo") {
      navigate(next ?? "/poster");
      return;
    }

    navigate("/onboarding/role");
  };

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Auth"
        title="Sign in to continue through a trust-first flow."
        description="Auth is frontend-safe for now, but the session shape is ready to swap behind a Supabase adapter later."
      />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Sign in" description="Use a real email shape. Demo entries are available below.">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <Button type="submit">Continue</Button>
          </form>
        </SectionCard>
        <SectionCard title="Demo accounts" description="Useful while backend auth is not wired.">
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="rounded-xl border border-border/60 bg-background/70 px-4 py-3">
              Worker demo: <span className="font-medium text-foreground">worker@taskverified.demo</span>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/70 px-4 py-3">
              Poster demo: <span className="font-medium text-foreground">poster@taskverified.demo</span>
            </div>
            <p>New emails enter the onboarding flow: role selection, profile setup, then verification-aware access.</p>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
