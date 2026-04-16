import { CheckCheck, Coins, Fingerprint, ShieldCheck, Star, Wallet } from "lucide-react";

import { seededTasks } from "@/features/tasks/data/taskSeeds";
import { formatMoney, getPublicTasks } from "@/features/tasks/data/sampleData";

export const lifecycleSteps = [
  {
    title: "Create task",
    description: "Poster defines the task, reward, proof requirements, and review deadline.",
  },
  {
    title: "Claim task",
    description: "Verified workers claim available work within clear queue limits.",
  },
  {
    title: "Submit proof",
    description: "Completion requires structured proof, not vague status updates.",
  },
  {
    title: "Review",
    description: "Poster approves, rejects, or requests revision against proof requirements.",
  },
  {
    title: "Payout",
    description: "Approved work moves into payout processing with an auditable status trail.",
  },
  {
    title: "Reputation update",
    description: "Reliable completion and review behavior strengthen future trust decisions.",
  },
] as const;

export const publicTrustSignals = [
  {
    label: "Live tasks",
    value: String(getPublicTasks(seededTasks).length),
    detail: "Public queue stays small and proof-forward.",
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    label: "Verification gate",
    value: "On",
    detail: "Worker claiming remains tied to verification state.",
    icon: <Fingerprint className="h-5 w-5" />,
  },
  {
    label: "Review loop",
    value: "Proof-first",
    detail: "Approval decisions follow evidence, not chat.",
    icon: <CheckCheck className="h-5 w-5" />,
  },
  {
    label: "Reward pool",
    value: formatMoney(getPublicTasks(seededTasks).reduce((sum, task) => sum + task.rewardAmount, 0), "USD"),
    detail: "Sample rewards model payout visibility.",
    icon: <Coins className="h-5 w-5" />,
  },
] as const;

export const posterTrustSignals = [
  {
    label: "Trust policy",
    value: "Tight scope",
    detail: "Tasks should stay proof-based and auditable.",
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    label: "Review intent",
    value: "24h target",
    detail: "Workers should know when to expect decisions.",
    icon: <CheckCheck className="h-5 w-5" />,
  },
  {
    label: "Payout behavior",
    value: "After approval",
    detail: "Release follows proof review, not vague completion status.",
    icon: <Wallet className="h-5 w-5" />,
  },
  {
    label: "Reputation effect",
    value: "Bidirectional",
    detail: "Workers and posters both accrue trust from behavior.",
    icon: <Star className="h-5 w-5" />,
  },
] as const;
