import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface TopNavProps {
  isAuthenticated?: boolean;
  role?: 'worker' | 'poster';
}

const TopNav = ({ isAuthenticated = false, role }: TopNavProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navLinkClass = (path: string) =>
    `text-sm font-medium transition-colors relative py-1 ${isActive(path) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`;

  const navLinkIndicator = (path: string) =>
    isActive(path) ? 'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-primary' : '';

  const closeMobile = () => setMobileOpen(false);

  const workerLinks = [
    { to: '/worker/dashboard', label: 'Dashboard' },
    { to: '/tasks', label: 'Browse' },
    { to: '/worker/my-tasks', label: 'My Tasks' },
    { to: '/worker/earnings', label: 'Earnings' },
  ];

  const posterLinks = [
    { to: '/poster/dashboard', label: 'Dashboard' },
    { to: '/poster/create-task', label: 'Create Task' },
    { to: '/poster/my-tasks', label: 'My Tasks' },
    { to: '/poster/payments', label: 'Payments' },
  ];

  const links = isAuthenticated ? (role === 'worker' ? workerLinks : posterLinks) : [{ to: '/tasks', label: 'Browse Tasks' }];

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
      <div className="container flex h-14 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-heading text-base font-bold tracking-tight">TaskVerified</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className={`${navLinkClass(l.to)} ${navLinkIndicator(l.to)} px-3`}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <Link to="/settings">
              <Button variant="ghost" size="sm">Settings</Button>
            </Link>
          ) : (
            <>
              <Link to="/signin"><Button variant="ghost" size="sm">Sign In</Button></Link>
              <Link to="/signup"><Button size="sm">Get Started</Button></Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-1" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="animate-fade-in border-t bg-background px-4 pb-5 pt-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={closeMobile}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive(l.to) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
              >
                {l.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link to="/settings" onClick={closeMobile} className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted">
                Settings
              </Link>
            )}
            {!isAuthenticated && (
              <div className="mt-3 flex flex-col gap-2 border-t pt-3">
                <Link to="/signin" onClick={closeMobile}><Button variant="outline" className="w-full">Sign In</Button></Link>
                <Link to="/signup" onClick={closeMobile}><Button className="w-full">Get Started</Button></Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default TopNav;
