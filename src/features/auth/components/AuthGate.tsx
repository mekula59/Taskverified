import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

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
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <p className="font-heading text-base font-semibold">Opening TaskVerified</p>
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
