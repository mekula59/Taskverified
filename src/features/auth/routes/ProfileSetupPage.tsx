import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { PageIntro } from "@/components/shell/PageIntro";
import { SectionCard } from "@/components/shell/SectionCard";
import { useAuth } from "@/features/auth/context/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ProfileSetupPage() {
  const auth = useAuth();
  const navigate = useNavigate();

  const initial = useMemo(
    () => ({
      fullName: auth.profile?.fullName ?? "",
      location: auth.profile?.location ?? "",
      bio: auth.profile?.bio ?? "",
    }),
    [auth.profile],
  );

  const [form, setForm] = useState(initial);

  const roleLabel = auth.user?.role === "worker" ? "worker" : "poster";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    auth.saveProfile(form);
    navigate(auth.routeForRole(auth.user?.role));
  };

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Onboarding"
        title="Set up a profile the review system can trust."
        description="This foundation keeps profile setup deliberately small: clear identity, location context, and a concise statement of intent."
      />
      <SectionCard title="Profile setup" description={`Current role: ${roleLabel}`}>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name or team name</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                placeholder={auth.user?.role === "worker" ? "Nadia Cole" : "TaskVerified Labs"}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                placeholder="Lagos, NG"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Short bio</Label>
            <Textarea
              id="bio"
              value={form.bio}
              onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
              placeholder={
                auth.user?.role === "worker"
                  ? "Reliable tester focused on clear proof and on-time completion."
                  : "Startup team posting tightly scoped, proof-based micro-work."
              }
              required
            />
          </div>
          <Button type="submit">Save profile</Button>
        </form>
      </SectionCard>
    </div>
  );
}
