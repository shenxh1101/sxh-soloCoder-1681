import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Globe,
  LayoutDashboard,
  CloudSun,
  ClipboardCheck,
  FileText,
  ScrollText,
  Download,
  LogOut,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { ROLE_LABELS } from '@/utils/constants';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '3D总览' },
  { to: '/forecast', icon: CloudSun, label: '预报中心' },
  { to: '/workorders', icon: ClipboardCheck, label: '预警工单', badge: true },
  { to: '/briefings', icon: FileText, label: '天气简报' },
  { to: '/logs', icon: ScrollText, label: '操作日志', role: ['forecaster', 'director'] },
  { to: '/export', icon: Download, label: '日报导出', role: ['forecaster', 'director'] },
];

export default function Sidebar() {
  const location = useLocation();
  const user = useAppStore((s) => s.user);
  const logout = useAppStore((s) => s.logout);
  const workOrders = useAppStore((s) => s.workOrders);
  const pendingCount = workOrders.filter((o) => o.status.startsWith('pending_')).length;

  const visibleItems = navItems.filter(
    (item) => !item.role || (user && item.role.includes(user.role)),
  );

  const initial = user?.name?.charAt?.(0) ?? '?';
  const avatarColor = user?.avatar ?? '#00D4FF';

  return (
    <motion.aside
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: '16rem', opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed left-0 top-0 w-64 h-screen bg-space-800/80 backdrop-blur-xl border-r border-white/5 flex flex-col z-40"
    >
      <div className="h-14 flex items-center px-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyber-500/20 border border-cyber-500/40 flex items-center justify-center">
            <Globe className="w-5 h-5 text-cyber-400" />
          </div>
          <span className="font-orbitron font-bold text-lg text-white tracking-wider">
            Weather<span className="text-cyber-400">Cmd</span>
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.to);
          const showBadge = item.badge && pendingCount > 0;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'relative group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200',
                isActive
                  ? 'bg-cyber-500/15 text-cyber-300 shadow-[0_0_20px_rgba(0,212,255,0.25)]'
                  : 'text-white/60 hover:text-white/90 hover:bg-white/5',
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-cyber-400 shadow-[0_0_10px_rgba(0,212,255,0.8)]"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <Icon
                className={cn(
                  'w-4.5 h-4.5 flex-shrink-0',
                  isActive ? 'text-cyber-400' : 'text-white/50 group-hover:text-white/80',
                )}
              />
              <span className="font-medium flex-1">{item.label}</span>
              {showBadge && (
                <span className="ml-auto min-w-[1.25rem] h-5 px-1.5 rounded-full bg-alert-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {pendingCount > 99 ? '99+' : pendingCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03]">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: avatarColor }}
          >
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-medium text-sm truncate">
              {user?.name ?? '未登录'}
            </div>
            <div className="text-white/40 text-xs">
              {user ? ROLE_LABELS[user.role] : ''}
            </div>
          </div>
          <button
            onClick={logout}
            className="w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-alert-500/15 text-white/50 hover:text-alert-400 flex items-center justify-center transition-colors"
            title="退出登录"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
