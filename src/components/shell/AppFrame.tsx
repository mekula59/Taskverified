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
  const mobileGlobalNavRef = useRef<HTMLElement | null>(null);
  const mobileWorkspaceNavRef = useRef<HTMLElement | null>(null);
  const isPublicArea = area === "public";
  const isAuthRoute = isPublicArea && (location.pathname === "/auth" || location.pathname === "/signin" || location.pathname === "/signup");
  const userRole = auth.user?.role;
  const roleArea = userRole === "poster" || userRole === "worker" ? userRole : null;
  const workspaceRoute = auth.routeForRole(userRole);
  const isWorkspaceArea = area === "poster" || area === "worker";
  const workspaceNavigation = isWorkspaceArea ? navigationByArea[area] : [];
  const globalNavigation = auth.isAuthenticated
    ? [
        { label: "Home", to: "/", end: true },
        { label: "Tasks", to: "/tasks", end: true },
        { label: "Workspace", to: workspaceRoute },
        { label: "Settings", to: "/app/settings", end: true },
      ]
    : [
        { label: "Home", to: "/", end: true },
        { label: "Tasks", to: "/tasks", end: true },
        { label: "Sign in", to: "/signin", end: true },
        { label: "Get started", to: "/signup", end: true },
      ];
  const accountLabel = auth.profile?.fullName ?? auth.user?.email ?? (roleArea ? `${roleArea} area` : "Signed in");
  const mainShellClass = isPublicArea ? "tv-shell" : "tv-workspace-shell";

  const isGlobalItemActive = (item: (typeof globalNavigation)[number]) => {
    if (item.label === "Workspace") {
      return location.pathname.startsWith("/worker") || location.pathname.startsWith("/poster");
    }

    if (item.end) {
      return location.pathname === item.to;
    }

    return location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
  };

  useEffect(() => {
    const activeGlobalItem = mobileGlobalNavRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    const activeWorkspaceItem = mobileWorkspaceNavRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    activeGlobalItem?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    activeWorkspaceItem?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
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
        <div className={cn("tv-workspace-shell flex min-h-[3.8rem] min-w-0 items-center gap-3")}>
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-emerald-100 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.72)]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[0.95rem] font-semibold leading-5 tracking-tight">TaskVerified</div>
              <div className="text-xs leading-4 text-muted-foreground">Hire real people. Review proof. Pay on Solana.</div>
            </div>
          </Link>

          <nav className="ml-auto hidden items-center gap-1.5 md:flex">
            {globalNavigation.map((item) => {
              const isActive = isGlobalItemActive(item);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-slate-950 text-white shadow-[0_10px_28px_-22px_rgba(15,23,42,0.8)]"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {auth.isAuthenticated ? (
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.14em]">
                {accountLabel}
              </Badge>
            ) : null}
            {auth.isAuthenticated ? (
              <Button size="sm" variant="ghost" onClick={auth.signOut}>
                Sign out
              </Button>
            ) : (
              null
            )}
          </div>
        </div>

        {isWorkspaceArea ? (
          <div className="hidden border-t border-slate-200/70 md:block">
            <div className="tv-workspace-shell py-2">
              <nav className="flex min-w-0 items-center gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {workspaceNavigation.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end ?? false}
                    className={({ isActive }) =>
                      cn(
                        "whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                        isActive ? "bg-primary text-primary-foreground" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        ) : null}

        <div className={cn("tv-workspace-shell min-w-0 overflow-hidden pb-3 md:hidden")}>
          <nav
            ref={mobileGlobalNavRef}
            className="-mx-3 flex max-w-[100vw] gap-1.5 overflow-x-auto px-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {globalNavigation.map((item) => {
              const isActive = isGlobalItemActive(item);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm font-medium transition-colors",
                    isActive ? "bg-slate-950 text-white" : "bg-white/88 text-slate-700 ring-1 ring-slate-200",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          {isWorkspaceArea ? (
            <nav
              ref={mobileWorkspaceNavRef}
              className="-mx-3 mt-2 flex max-w-[100vw] gap-1.5 overflow-x-auto px-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {workspaceNavigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end ?? false}
                  className={({ isActive }) =>
                    cn(
                      "whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm font-medium transition-colors",
                      isActive ? "bg-primary text-primary-foreground" : "bg-emerald-50 text-primary ring-1 ring-emerald-100",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          ) : null}
          {auth.isAuthenticated ? (
            <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
              <Badge variant="secondary" className="min-w-0 justify-center rounded-full px-3 py-2 text-[11px] uppercase tracking-[0.14em]">
                <span className="truncate">{accountLabel}</span>
              </Badge>
              <Button size="sm" variant="ghost" className="h-10" onClick={auth.signOut}>
                Sign out
              </Button>
            </div>
          ) : null}
        </div>
      </header>

      <main
        className={cn(mainShellClass, isPublicArea && isAuthRoute ? "tv-auth-rhythm" : "tv-page-rhythm")}
      >
        <Outlet />
      </main>
    </div>
  );
}
