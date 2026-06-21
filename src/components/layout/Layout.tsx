import { Outlet } from 'react-router-dom';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function Layout() {
  useAuthGuard();

  return (
    <div className="min-h-screen bg-space-900">
      <Sidebar />
      <TopBar />
      <main className="ml-64 mt-14 min-h-[calc(100vh-3.5rem)]">
        <Outlet />
      </main>
    </div>
  );
}
