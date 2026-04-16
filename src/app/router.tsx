import { createBrowserRouter } from "react-router-dom";

import { AppFrame } from "@/components/shell/AppFrame";
import { AuthGate } from "@/features/auth/components/AuthGate";
import { ProfileSetupPage } from "@/features/auth/routes/ProfileSetupPage";
import { RoleSelectionPage } from "@/features/auth/routes/RoleSelectionPage";
import { NotFoundPage } from "@/features/shared/routes/NotFoundPage";
import { SettingsPage } from "@/features/shared/routes/SettingsPage";
import { VerificationPage } from "@/features/shared/routes/VerificationPage";
import { PosterCreateTaskPage } from "@/features/poster/routes/PosterCreateTaskPage";
import { PosterHomePage } from "@/features/poster/routes/PosterHomePage";
import { PosterPayoutsPage } from "@/features/poster/routes/PosterPayoutsPage";
import { PosterReviewsPage } from "@/features/poster/routes/PosterReviewsPage";
import { PosterTasksPage } from "@/features/poster/routes/PosterTasksPage";
import { HomePage } from "@/features/public/routes/HomePage";
import { SignInPage } from "@/features/public/routes/SignInPage";
import { SignUpPage } from "@/features/public/routes/SignUpPage";
import { TaskDirectoryPage } from "@/features/public/routes/TaskDirectoryPage";
import { WorkerHomePage } from "@/features/worker/routes/WorkerHomePage";
import { WorkerPayoutsPage } from "@/features/worker/routes/WorkerPayoutsPage";
import { WorkerReputationPage } from "@/features/worker/routes/WorkerReputationPage";
import { WorkerSubmissionsPage } from "@/features/worker/routes/WorkerSubmissionsPage";
import { WorkerTasksPage } from "@/features/worker/routes/WorkerTasksPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppFrame area="public" />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "tasks", element: <TaskDirectoryPage /> },
      { path: "signin", element: <SignInPage /> },
      { path: "signup", element: <SignUpPage /> },
      { path: "verify", element: <VerificationPage /> },
    ],
  },
  {
    path: "/onboarding",
    element: <AppFrame area="shared" />,
    children: [
      {
        element: <AuthGate />,
        children: [
          { path: "role", element: <RoleSelectionPage /> },
          { path: "profile", element: <ProfileSetupPage /> },
        ],
      },
    ],
  },
  {
    element: <AuthGate role="worker" />,
    children: [
      {
        path: "/worker",
        element: <AppFrame area="worker" />,
        children: [
          { index: true, element: <WorkerHomePage /> },
          { path: "tasks", element: <WorkerTasksPage /> },
          { path: "submissions", element: <WorkerSubmissionsPage /> },
          { path: "payouts", element: <WorkerPayoutsPage /> },
          { path: "reputation", element: <WorkerReputationPage /> },
        ],
      },
    ],
  },
  {
    element: <AuthGate role="poster" />,
    children: [
      {
        path: "/poster",
        element: <AppFrame area="poster" />,
        children: [
          { index: true, element: <PosterHomePage /> },
          { path: "tasks", element: <PosterTasksPage /> },
          { path: "tasks/new", element: <PosterCreateTaskPage /> },
          { path: "reviews", element: <PosterReviewsPage /> },
          { path: "payouts", element: <PosterPayoutsPage /> },
        ],
      },
    ],
  },
  {
    element: <AuthGate />,
    children: [
      {
        path: "/app",
        element: <AppFrame area="shared" />,
        children: [{ path: "settings", element: <SettingsPage /> }],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
