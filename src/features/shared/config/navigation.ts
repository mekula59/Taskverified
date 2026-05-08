import type { AppArea } from "@/features/shared/types/domain";

interface NavigationItem {
  label: string;
  to: string;
  end?: boolean;
}

export const navigationByArea: Record<AppArea, NavigationItem[]> = {
  public: [
    { label: "Home", to: "/", end: true },
    { label: "Tasks", to: "/tasks" },
    { label: "Sign in", to: "/signin" },
    { label: "Sign up", to: "/signup" },
    { label: "Verify", to: "/verify" },
  ],
  worker: [
    { label: "Overview", to: "/worker", end: true },
    { label: "Tasks", to: "/worker/tasks" },
    { label: "Submissions", to: "/worker/submissions" },
    { label: "Payouts", to: "/worker/payouts" },
    { label: "Reputation", to: "/worker/reputation" },
  ],
  poster: [
    { label: "Overview", to: "/poster", end: true },
    { label: "Tasks", to: "/poster/tasks", end: true },
    { label: "Create task", to: "/poster/tasks/new" },
    { label: "Reviews", to: "/poster/reviews" },
    { label: "Payouts", to: "/poster/payouts" },
  ],
  shared: [
    { label: "Verify", to: "/verify" },
    { label: "Settings", to: "/app/settings", end: true },
  ],
};

export type { AppArea };
