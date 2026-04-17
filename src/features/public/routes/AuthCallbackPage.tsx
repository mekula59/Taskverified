import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "@/features/auth/context/useAuth";
import { completeEmailAuthCallback, formatAuthError } from "@/lib/supabase/auth";

export function AuthCallbackPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const errorDescription = searchParams.get("error_description");
  const errorCode = searchParams.get("error_code");

  useEffect(() => {
    if (errorDescription) {
      setError(formatAuthError(errorDescription, errorDescription));
      return;
    }

    void (async () => {
      try {
        await completeEmailAuthCallback();

        if (typeof window !== "undefined") {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (nextError) {
        setError(formatAuthError(nextError, "Unable to complete email authentication."));
      }
    })();
  }, [errorCode, errorDescription]);

  useEffect(() => {
    if (auth.isLoading || !auth.isAuthenticated) {
      return;
    }

    if (auth.needsRoleSelection) {
      navigate("/onboarding/role", { replace: true });
      return;
    }

    if (auth.user?.role && auth.needsProfileSetup) {
      navigate("/onboarding/profile", { replace: true });
      return;
    }

    navigate(auth.routeForRole(auth.user?.role), { replace: true });
  }, [auth, navigate]);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-xl items-center justify-center px-4 py-16 text-center sm:px-6">
      <div className="space-y-4 rounded-[2rem] border border-border/60 bg-background px-8 py-10 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)]">
        <div className="inline-flex items-center rounded-full border border-border/70 bg-muted/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          TaskVerified Auth
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Finishing secure sign-in</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          We’re verifying your email session and routing you into the right TaskVerified workspace.
        </p>
        {!error ? <p className="text-sm text-muted-foreground">If the link is valid, this should complete in a moment.</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}
