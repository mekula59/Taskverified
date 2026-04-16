import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@/features/auth/context/useAuth";
import type { UserRole } from "@/features/shared/types/domain";

interface AuthGateProps {
  role?: UserRole;
}

export function AuthGate({ role }: AuthGateProps) {
  const auth = useAuth();
  const location = useLocation();

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
