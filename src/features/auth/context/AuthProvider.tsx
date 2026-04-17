import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { AuthContext, type AuthContextValue } from "@/features/auth/context/AuthContext";
import type { AuthState, UserRole } from "@/features/shared/types/domain";
import {
  chooseSupabaseRole,
  getAuthStateFromSupabase,
  provisionDemoSupabaseAccount,
  saveSupabaseProfile,
  signInWithSupabaseEmail,
  signOutFromSupabase,
} from "@/lib/supabase/auth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

const emptyAuthState: AuthState = {
  user: null,
  profile: null,
  verification: null,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(emptyAuthState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAuthState = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setError("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable backend truth.");
      setState(emptyAuthState);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextState = await getAuthStateFromSupabase();
      setState(nextState);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to load auth state.");
      setState(emptyAuthState);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAuthState();

    if (!supabase) {
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadAuthState();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadAuthState]);

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

    return {
      ...state,
      isAuthenticated,
      isLoading,
      error,
      needsRoleSelection,
      needsProfileSetup,
      signInWithEmail: async (email: string) => {
        setError(null);

        try {
          await signInWithSupabaseEmail(email);

          const normalized = email.trim().toLowerCase();
          if (normalized === "worker@taskverified.demo") {
            await provisionDemoSupabaseAccount("worker");
          }

          if (normalized === "poster@taskverified.demo") {
            await provisionDemoSupabaseAccount("poster");
          }

          await loadAuthState();
        } catch (nextError) {
          setError(nextError instanceof Error ? nextError.message : "Unable to sign in.");
          throw nextError;
        }
      },
      continueDemoAsRole: async (role: UserRole) => {
        setError(null);

        try {
          await provisionDemoSupabaseAccount(role);
          await loadAuthState();
        } catch (nextError) {
          setError(nextError instanceof Error ? nextError.message : "Unable to start the demo account.");
          throw nextError;
        }
      },
      chooseRole: async (role: UserRole) => {
        setError(null);

        try {
          await chooseSupabaseRole(role);
          await loadAuthState();
        } catch (nextError) {
          setError(nextError instanceof Error ? nextError.message : "Unable to save the selected role.");
          throw nextError;
        }
      },
      saveProfile: async (input: { fullName: string; location: string; bio: string }) => {
        if (!state.user?.role) {
          return;
        }

        setError(null);

        try {
          await saveSupabaseProfile({
            ...input,
            role: state.user.role,
          });
          await loadAuthState();
        } catch (nextError) {
          setError(nextError instanceof Error ? nextError.message : "Unable to save the profile.");
          throw nextError;
        }
      },
      signOut: async () => {
        setError(null);

        try {
          await signOutFromSupabase();
          setState(emptyAuthState);
        } catch (nextError) {
          setError(nextError instanceof Error ? nextError.message : "Unable to sign out.");
          throw nextError;
        }
      },
      routeForRole,
    };
  }, [error, isLoading, loadAuthState, state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
