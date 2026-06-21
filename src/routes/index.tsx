import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import LoginPage from '@/pages/LoginPage';
import NotFoundPage from '@/pages/NotFoundPage';
import DashboardPage from '@/pages/DashboardPage';
import ForecastPage from '@/pages/ForecastPage';
import WorkOrderPage from '@/pages/WorkOrderPage';
import BriefingPage from '@/pages/BriefingPage';
import LogPage from '@/pages/LogPage';
import ExportPage from '@/pages/ExportPage';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

function ProtectedLayout() {
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

function RoleGuard({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles: ('forecaster' | 'director')[];
}) {
  useAuthGuard(roles);
  return <>{children}</>;
}

function ForbiddenPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-14rem)]">
      <div className="text-center">
        <div className="font-orbitron text-7xl font-bold text-alert-500 mb-4">403</div>
        <div className="text-white/60 text-lg mb-6">您没有权限访问此页面</div>
        <button
          onClick={() => (window.location.href = '/')}
          className="px-6 py-2.5 rounded-xl bg-cyber-500/15 border border-cyber-500/30 text-cyber-300 hover:bg-cyber-500/25 transition-colors font-medium"
        >
          返回首页
        </button>
      </div>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/403',
    element: <ForbiddenPage />,
  },
  {
    element: <ProtectedLayout />,
    children: [
      {
        path: '/',
        element: <DashboardPage />,
      },
      {
        path: '/forecast',
        element: <ForecastPage />,
      },
      {
        path: '/workorders',
        element: <WorkOrderPage />,
      },
      {
        path: '/briefings',
        element: <BriefingPage />,
      },
      {
        path: '/logs',
        element: (
          <RoleGuard roles={['forecaster', 'director']}>
            <LogPage />
          </RoleGuard>
        ),
        errorElement: <Navigate to="/403" replace />,
      },
      {
        path: '/export',
        element: (
          <RoleGuard roles={['forecaster', 'director']}>
            <ExportPage />
          </RoleGuard>
        ),
        errorElement: <Navigate to="/403" replace />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export { router };

export function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;
