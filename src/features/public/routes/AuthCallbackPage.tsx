import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { TaskVerifiedMark } from "@/components/brand/TaskVerifiedMark";
import { Button } from "@/components/ui/button";
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
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-[620px] items-center justify-center px-4 py-10 text-center sm:px-6">
      <div className="tv-surface w-full overflow-hidden">
        <div className="border-b border-slate-200/80 bg-slate-50/80 px-5 py-4">
          <TaskVerifiedMark alt="" className="mx-auto h-11 w-11" />
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary">TaskVerified auth</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {error ? "Email sign-in needs attention" : "Finishing secure sign-in"}
          </h1>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm leading-6 text-slate-600">
            {error
              ? "This sign-in link could not be completed. Request a new link or sign in with Phantom."
              : "We are verifying your email session and routing you into the right TaskVerified workspace."}
          </p>
          {!error ? (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking session
            </div>
          ) : (
            <>
              <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-950 ring-1 ring-rose-200">
                {error}
              </div>
              <div className="mt-4 grid gap-2">
                <Button asChild variant="outline" className="rounded-xl">
                  <Link to="/signin">Return to sign in</Link>
                </Button>
                <Button asChild className="rounded-xl">
                  <Link to="/signin#email">Request a new magic link</Link>
                </Button>
                <Button asChild variant="secondary" className="rounded-xl">
                  <Link to="/signin">Use Phantom instead</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
