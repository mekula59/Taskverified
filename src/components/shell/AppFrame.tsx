import { useEffect, useRef } from "react";
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
  const mobileNavRef = useRef<HTMLElement | null>(null);
  const navigation = navigationByArea[area];
  const isPublicArea = area === "public";
  const isAuthRoute = isPublicArea && (location.pathname === "/auth" || location.pathname === "/signin" || location.pathname === "/signup");
  const isSettingsRoute = location.pathname === "/app/settings";
  const publicNavigation = isPublicArea
    ? navigation
        .filter((item) =>
          item.to === "/" ||
          item.to === "/tasks" ||
          (!auth.isAuthenticated && !isAuthRoute && (item.to === "/signin" || item.to === "/signup")),
        )
        .map((item) => (item.to === "/signup" ? { ...item, label: "Get started" } : item))
    : navigation;
  const areaLabel =
    isPublicArea
      ? "Public"
      : area === "shared"
        ? auth.profile?.fullName ?? "Shared"
        : auth.profile?.fullName ?? `${area} area`;
  const shellClass = isPublicArea ? "tv-shell" : "tv-workspace-shell";

  useEffect(() => {
    const activeItem = mobileNavRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    activeItem?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [location.pathname]);

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-background text-foreground">
      <div
        className={
          isPublicArea
            ? "absolute inset-x-0 top-0 -z-10 h-[24rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(241,245,249,0.82)_55%,rgba(241,245,249,0))]"
            : "absolute inset-x-0 top-0 -z-10 h-[20rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(241,245,249,0.78)_60%,rgba(241,245,249,0))]"
        }
      />
      <header className="sticky top-0 z-40 border-b border-slate-200/75 bg-white/86 backdrop-blur-xl">
        <div className={cn(shellClass, "flex min-h-[3.8rem] min-w-0 items-center gap-3")}>
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-emerald-100 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.72)]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[0.95rem] font-semibold leading-5 tracking-tight">TaskVerified</div>
              <div className="text-xs leading-4 text-muted-foreground">{isPublicArea ? "Hire real people. Review proof. Pay on Solana." : "Human-verified micro-work"}</div>
            </div>
          </Link>

          <nav className="ml-auto hidden items-center gap-1.5 md:flex">
            {publicNavigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-slate-950 text-white shadow-[0_10px_28px_-22px_rgba(15,23,42,0.8)]"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {!isPublicArea ? (
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.14em]">
                {areaLabel}
              </Badge>
            ) : null}
            {auth.isAuthenticated ? (
              <>
                {!isSettingsRoute ? (
                  <Button asChild size="sm" variant="outline">
                    <Link to="/app/settings">Settings</Link>
                  </Button>
                ) : null}
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

        <div className={cn(shellClass, "min-w-0 overflow-hidden pb-3 md:hidden")}>
          <nav
            ref={mobileNavRef}
            className="-mx-3 flex max-w-[100vw] gap-1.5 overflow-x-auto px-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {publicNavigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-slate-950 text-white"
                      : "bg-white/88 text-slate-700 ring-1 ring-slate-200",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          {auth.isAuthenticated ? (
            <div className={cn("mt-3 grid gap-2", isSettingsRoute ? "grid-cols-1" : "grid-cols-2")}>
              {!isSettingsRoute ? (
                <Button asChild size="sm" variant="outline" className="h-10">
                  <Link to="/app/settings">Settings</Link>
                </Button>
              ) : null}
              <Button size="sm" variant="ghost" className="h-10" onClick={auth.signOut}>
                Sign out
              </Button>
            </div>
          ) : null}
        </div>
      </header>

      <main
        className={cn(shellClass, isPublicArea && isAuthRoute ? "tv-auth-rhythm" : "tv-page-rhythm")}
      >
        <Outlet />
      </main>
    </div>
  );
}
