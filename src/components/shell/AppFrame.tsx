import { Link, NavLink, Outlet } from "react-router-dom";
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
  const navigation = navigationByArea[area];
  const areaLabel =
    area === "public"
      ? "Public"
      : area === "shared"
        ? "Shared"
        : auth.profile?.fullName ?? `${area} area`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top,_rgba(14,116,144,0.18),_transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.98))]" />
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="container flex min-h-16 items-center gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="font-heading text-base font-semibold">TaskVerified</div>
              <div className="text-xs text-muted-foreground">Human-verified micro-work</div>
            </div>
          </Link>

          <nav className="ml-auto hidden items-center gap-2 md:flex">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-3 py-2 text-sm transition-colors",
                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              {areaLabel}
            </Badge>
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
              <Button asChild size="sm" variant="outline">
                <Link to="/signin">Sign in</Link>
              </Button>
            )}
          </div>
        </div>

        <div className="container pb-3 md:hidden">
          <nav className="flex gap-2 overflow-x-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "whitespace-nowrap rounded-full px-3 py-2 text-sm transition-colors",
                    isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="container py-10 md:py-14">
        <Outlet />
      </main>
    </div>
  );
}
