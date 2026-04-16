import { useEffect, useMemo, useState, type ReactNode } from "react";

import { AuthContext, type AuthContextValue } from "@/features/auth/context/AuthContext";
import { clearStoredAuthState, demoAuthStates, readStoredAuthState, writeStoredAuthState } from "@/features/auth/lib/storage";
import type { AuthState, SessionUser, UserProfile, UserRole, VerificationRecord } from "@/features/shared/types/domain";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => readStoredAuthState());

  useEffect(() => {
    writeStoredAuthState(state);
  }, [state]);

  const value = useMemo<AuthContextValue>(() => {
    const isAuthenticated = Boolean(state.user);
    const needsRoleSelection = Boolean(state.user && !state.user.role);
    const needsProfileSetup = Boolean(state.user?.role && !state.profile);

    const routeForRole = (role?: UserRole | null) => {
      if (role === "worker") {
        return "/worker";
      }

      if (role === "poster") {
        return "/poster";
      }

      return "/onboarding/role";
    };

    const signInWithEmail = (email: string) => {
      const normalized = email.trim().toLowerCase();

      if (normalized === "worker@taskverified.demo") {
        setState(demoAuthStates.worker);
        return;
      }

      if (normalized === "poster@taskverified.demo") {
        setState(demoAuthStates.poster);
        return;
      }

      const nextUser: SessionUser = {
        id: `user-${Date.now()}`,
        email: normalized,
        role: null,
        createdAt: new Date().toISOString(),
      };

      setState({ user: nextUser, profile: null, verification: null });
    };

    const continueDemoAsRole = (role: UserRole) => {
      setState(demoAuthStates[role]);
    };

    const chooseRole = (role: UserRole) => {
      setState((current) => {
        if (!current.user) {
          return current;
        }

        return {
          user: { ...current.user, role },
          profile: current.profile ? { ...current.profile, role } : null,
          verification: current.verification,
        };
      });
    };

    const saveProfile = (input: { fullName: string; location: string; bio: string }) => {
      setState((current) => {
        if (!current.user?.role) {
          return current;
        }

        const profile: UserProfile = {
          userId: current.user.id,
          fullName: input.fullName.trim(),
          location: input.location.trim(),
          bio: input.bio.trim(),
          role: current.user.role,
          setupCompletedAt: new Date().toISOString(),
        };

        const verification: VerificationRecord = current.verification ?? {
          userId: current.user.id,
          status: current.user.role === "worker" ? "pending" : "unverified",
          submittedAt: current.user.role === "worker" ? new Date().toISOString() : undefined,
          notes:
            current.user.role === "worker"
              ? "Verification has been submitted. Claims stay gated until review clears."
              : "Poster identity review has not started yet.",
        };

        return { ...current, profile, verification };
      });
    };

    const signOut = () => {
      clearStoredAuthState();
      setState({ user: null, profile: null, verification: null });
    };

    return {
      ...state,
      isAuthenticated,
      needsRoleSelection,
      needsProfileSetup,
      signInWithEmail,
      continueDemoAsRole,
      chooseRole,
      saveProfile,
      signOut,
      routeForRole,
    };
  }, [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
