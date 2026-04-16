import { useNavigate } from "react-router-dom";
import { BriefcaseBusiness, UserRoundSearch } from "lucide-react";

import { PageIntro } from "@/components/shell/PageIntro";
import { SectionCard } from "@/components/shell/SectionCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context/useAuth";
import type { UserRole } from "@/features/shared/types/domain";

const roleCards: Array<{
  role: UserRole;
  title: string;
  description: string;
  bullets: string[];
  icon: typeof BriefcaseBusiness;
}> = [
  {
    role: "worker",
    title: "Worker",
    description: "Claim trusted micro-tasks, submit proof, and build a reputation from real delivery.",
    bullets: ["Claim available tasks", "Submit structured proof", "Track payouts and trust score"],
    icon: UserRoundSearch,
  },
  {
    role: "poster",
    title: "Poster",
    description: "Publish tightly scoped tasks, review proof, and release payouts with clear rules.",
    bullets: ["Create proof-based tasks", "Review submissions", "Manage payout and trust signals"],
    icon: BriefcaseBusiness,
  },
];

export function RoleSelectionPage() {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSelect = (role: UserRole) => {
    auth.chooseRole(role);
    navigate("/onboarding/profile");
  };

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Onboarding"
        title="Choose the side of the workflow you’re entering first."
        description="TaskVerified separates workers and posters early so trust, proof, review, and payouts can stay clear throughout the product."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        {roleCards.map((card) => (
          <SectionCard key={card.role} title={card.title} description={card.description}>
            <div className="space-y-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <card.icon className="h-6 w-6" />
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {card.bullets.map((bullet) => (
                  <li key={bullet} className="rounded-xl border border-border/60 bg-background/70 px-4 py-3">
                    {bullet}
                  </li>
                ))}
              </ul>
              <Button onClick={() => handleSelect(card.role)} className="w-full">
                Continue as {card.title}
              </Button>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
