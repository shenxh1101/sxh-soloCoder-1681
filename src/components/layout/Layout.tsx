import { Outlet } from 'react-router-dom';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useScheduler } from '@/hooks/useScheduler';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import AlertValidationToast from '@/components/common/AlertValidationToast';

export default function Layout() {
  useAuthGuard();
  useScheduler();

  return (
    <div className="min-h-screen bg-space-900">
      <Sidebar />
      <TopBar />
      <AlertValidationToast />
      <main className="ml-64 mt-14 min-h-[calc(100vh-3.5rem)]">
        <Outlet />
      </main>
    </div>
  );
}
