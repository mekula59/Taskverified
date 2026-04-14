import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';

interface AppLayoutProps {
  isAuthenticated?: boolean;
  role?: 'worker' | 'poster';
}

const AppLayout = ({ isAuthenticated = false, role }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <TopNav isAuthenticated={isAuthenticated} role={role} />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
