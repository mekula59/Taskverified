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

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) =>
    `text-sm font-medium transition-colors ${isActive(path) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`;

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-heading text-lg font-bold">TaskVerified</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {isAuthenticated && role === 'worker' && (
            <>
              <Link to="/worker/dashboard" className={navLinkClass('/worker/dashboard')}>Dashboard</Link>
              <Link to="/tasks" className={navLinkClass('/tasks')}>Browse Tasks</Link>
              <Link to="/worker/my-tasks" className={navLinkClass('/worker/my-tasks')}>My Tasks</Link>
              <Link to="/worker/earnings" className={navLinkClass('/worker/earnings')}>Earnings</Link>
            </>
          )}
          {isAuthenticated && role === 'poster' && (
            <>
              <Link to="/poster/dashboard" className={navLinkClass('/poster/dashboard')}>Dashboard</Link>
              <Link to="/poster/create-task" className={navLinkClass('/poster/create-task')}>Create Task</Link>
              <Link to="/poster/my-tasks" className={navLinkClass('/poster/my-tasks')}>My Tasks</Link>
              <Link to="/poster/payments" className={navLinkClass('/poster/payments')}>Payments</Link>
            </>
          )}
          {!isAuthenticated && (
            <>
              <Link to="/tasks" className={navLinkClass('/tasks')}>Browse Tasks</Link>
            </>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
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
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="animate-fade-in border-t bg-card px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-3">
            {isAuthenticated && role === 'worker' && (
              <>
                <Link to="/worker/dashboard" className={navLinkClass('/worker/dashboard')} onClick={() => setMobileOpen(false)}>Dashboard</Link>
                <Link to="/tasks" className={navLinkClass('/tasks')} onClick={() => setMobileOpen(false)}>Browse Tasks</Link>
                <Link to="/worker/my-tasks" className={navLinkClass('/worker/my-tasks')} onClick={() => setMobileOpen(false)}>My Tasks</Link>
                <Link to="/worker/earnings" className={navLinkClass('/worker/earnings')} onClick={() => setMobileOpen(false)}>Earnings</Link>
                <Link to="/settings" className={navLinkClass('/settings')} onClick={() => setMobileOpen(false)}>Settings</Link>
              </>
            )}
            {isAuthenticated && role === 'poster' && (
              <>
                <Link to="/poster/dashboard" className={navLinkClass('/poster/dashboard')} onClick={() => setMobileOpen(false)}>Dashboard</Link>
                <Link to="/poster/create-task" className={navLinkClass('/poster/create-task')} onClick={() => setMobileOpen(false)}>Create Task</Link>
                <Link to="/poster/my-tasks" className={navLinkClass('/poster/my-tasks')} onClick={() => setMobileOpen(false)}>My Tasks</Link>
                <Link to="/poster/payments" className={navLinkClass('/poster/payments')} onClick={() => setMobileOpen(false)}>Payments</Link>
                <Link to="/settings" className={navLinkClass('/settings')} onClick={() => setMobileOpen(false)}>Settings</Link>
              </>
            )}
            {!isAuthenticated && (
              <>
                <Link to="/tasks" className={navLinkClass('/tasks')} onClick={() => setMobileOpen(false)}>Browse Tasks</Link>
                <Link to="/signin" className={navLinkClass('/signin')} onClick={() => setMobileOpen(false)}>Sign In</Link>
                <Link to="/signup" className={navLinkClass('/signup')} onClick={() => setMobileOpen(false)}>Get Started</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default TopNav;
