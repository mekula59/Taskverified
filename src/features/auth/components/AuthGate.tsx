import { Navigate, Outlet, useLocation } from "react-router-dom";

import { TaskVerifiedMark } from "@/components/brand/TaskVerifiedMark";
import { useAuth } from "@/features/auth/context/useAuth";
import type { UserRole } from "@/features/shared/types/domain";

interface AuthGateProps {
  role?: UserRole;
}

export function AuthGate({ role }: AuthGateProps) {
  const auth = useAuth();
  const location = useLocation();

  if (auth.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        <div className="tv-surface flex max-w-sm flex-col items-center gap-4 px-6 py-7 text-center">
          <TaskVerifiedMark className="h-11 w-11" />
          <div className="space-y-1.5">
            <p className="text-base font-semibold tracking-tight">Opening TaskVerified</p>
            <p className="text-sm leading-6 text-muted-foreground">
              Checking your session before loading the workspace.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  if (auth.needsRoleSelection && location.pathname !== "/onboarding/role") {
    return <Navigate to="/onboarding/role" replace />;
  }

  if (auth.user?.role && auth.needsProfileSetup && location.pathname !== "/onboarding/profile") {
    return <Navigate to="/onboarding/profile" replace />;
  }

  if (role && auth.user?.role !== role) {
    return <Navigate to={auth.routeForRole(auth.user?.role)} replace />;
  }

  return <Outlet />;
}
