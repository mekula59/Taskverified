import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

import { useAuth } from "@/features/auth/context/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { navigationByArea, type AppArea } from "@/features/shared/config/navigation";
import { cn } from "@/lib/utils";

interface AppFrameProps {
  area: AppArea;
}

export function AppFrame({ area }: AppFrameProps) {
  const auth = useAuth();
  const location = useLocation();
  const navigation = navigationByArea[area];
  const isPublicArea = area === "public";
  const isAuthRoute = isPublicArea && (location.pathname === "/auth" || location.pathname === "/signin" || location.pathname === "/signup");
  const publicNavigation = isPublicArea
    ? navigation
        .filter((item) =>
          item.to === "/" ||
          item.to === "/tasks" ||
          (!isAuthRoute && (item.to === "/signin" || item.to === "/signup")),
        )
        .map((item) => (item.to === "/signup" ? { ...item, label: "Get started" } : item))
    : navigation;
  const areaLabel =
    isPublicArea
      ? "Public"
      : area === "shared"
        ? "Shared"
        : auth.profile?.fullName ?? `${area} area`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div
        className={
          isPublicArea
            ? "absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.18),_transparent_28%),radial-gradient(circle_at_80%_0%,_rgba(34,211,238,0.14),_transparent_26%),linear-gradient(180deg,rgba(247,251,250,0.96),rgba(248,250,252,0.98))]"
            : "absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top,_rgba(14,116,144,0.18),_transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.98))]"
        }
      />
      <header className={isPublicArea ? "sticky top-0 z-40 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl" : "sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur"}>
        <div className={isPublicArea ? "mx-auto flex min-h-[4.5rem] w-full max-w-[1280px] items-center gap-4 px-4 sm:px-6 lg:px-8" : "container flex min-h-16 items-center gap-4"}>
          <Link to="/" className="flex items-center gap-3">
            <div className={isPublicArea ? "flex h-11 w-11 items-center justify-center rounded-2xl bg-[#04252a] text-emerald-200 shadow-[0_12px_30px_-18px_rgba(4,37,42,0.9)]" : "flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 text-primary"}>
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="font-heading text-base font-semibold">TaskVerified</div>
              <div className="text-xs text-muted-foreground">{isPublicArea ? "Hire real people. Review proof. Pay on Solana." : "Human-verified micro-work"}</div>
            </div>
          </Link>

          <nav className="ml-auto hidden items-center gap-2 md:flex">
            {publicNavigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    isPublicArea ? "rounded-full px-3 py-2 text-sm transition-colors" : "rounded-full px-3 py-2 text-sm transition-colors",
                    isPublicArea
                      ? isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-white hover:text-slate-950"
                      : isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {!isPublicArea ? (
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                {areaLabel}
              </Badge>
            ) : null}
            {auth.isAuthenticated ? (
              <>
                <Button asChild size="sm" variant="outline">
                  <Link to="/app/settings">Settings</Link>
                </Button>
                <Button size="sm" variant="ghost" onClick={auth.signOut}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                {isPublicArea ? null : (
                  <Button asChild size="sm" variant="outline">
                    <Link to="/signin">Sign in</Link>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        <div className={isPublicArea ? "mx-auto w-full max-w-[1280px] px-4 pb-3 sm:px-6 lg:px-8 md:hidden" : "container pb-3 md:hidden"}>
          <nav className="flex gap-2 overflow-x-auto">
            {publicNavigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "whitespace-nowrap rounded-full px-3 py-2 text-sm transition-colors",
                    isPublicArea
                      ? isActive
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-700"
                      : isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          {auth.isAuthenticated ? (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button asChild size="sm" variant="outline" className="h-10">
                <Link to="/app/settings">Settings</Link>
              </Button>
              <Button size="sm" variant="ghost" className="h-10" onClick={auth.signOut}>
                Sign out
              </Button>
            </div>
          ) : null}
        </div>
      </header>

      <main
        className={
          isPublicArea
            ? cn(
                "mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8",
                isAuthRoute ? "md:py-6" : "md:py-12",
              )
            : "container py-10 md:py-14"
        }
      >
        <Outlet />
      </main>
    </div>
  );
}
