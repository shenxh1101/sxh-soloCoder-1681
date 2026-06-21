import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  Bell,
  Users,
  ThermometerSun,
  AlertTriangle,
  AlertOctagon,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import { formatTemperature } from '@/utils/formatters';

const routeTitles: Record<string, { title: string; breadcrumb: string[] }> = {
  '/': { title: '3D总览', breadcrumb: ['首页', '3D总览'] },
  '/forecast': { title: '预报中心', breadcrumb: ['首页', '预报中心'] },
  '/workorders': { title: '预警工单', breadcrumb: ['首页', '预警工单'] },
  '/briefings': { title: '天气简报', breadcrumb: ['首页', '天气简报'] },
  '/logs': { title: '操作日志', breadcrumb: ['首页', '操作日志'] },
  '/export': { title: '日报导出', breadcrumb: ['首页', '日报导出'] },
};

function getPageTitle(pathname: string) {
  if (routeTitles[pathname]) return routeTitles[pathname];
  for (const key of Object.keys(routeTitles)) {
    if (key !== '/' && pathname.startsWith(key)) {
      return routeTitles[key];
    }
  }
  return { title: '未知页面', breadcrumb: ['首页', '未知'] };
}

function formatClock(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatDateStr(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const weatherIcons = ['☀️', '⛅', '☁️', '🌧️', '⛈️', '❄️', '🌫️'];

export default function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { title, breadcrumb } = getPageTitle(location.pathname);
  const activeAlerts = useAppStore((s) => s.activeAlerts);
  const stations = useAppStore((s) => s.stations);
  const realtimeData = useAppStore((s) => s.realtimeData);
  const user = useAppStore((s) => s.user);

  const [now, setNow] = useState(new Date());
  const [onlineUsers] = useState(() => 3 + Math.floor(Math.random() * 3));

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const firstStationId = stations[0]?.id;
  const firstStationData = firstStationId ? realtimeData[firstStationId] : null;
  const weatherIcon = weatherIcons[Math.floor(((now.getHours() + (firstStationData?.temperature ?? 20)) % 7 + 7) % 7)];

  const alertCount = activeAlerts.length;
  const hasDanger = activeAlerts.some((a) => a.level === 'danger');

  return (
    <motion.header
      initial={{ y: -56, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut', delay: 0.1 }}
      className="fixed top-0 left-64 right-0 h-14 bg-space-800/50 backdrop-blur-md border-b border-white/5 flex items-center px-6 z-30"
    >
      <div className="flex items-center gap-6 flex-1 min-w-0">
        <div className="flex items-center gap-2 text-white/40 text-sm">
          {breadcrumb.map((item, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-white/20" />}
              <span
                className={cn(
                  i === breadcrumb.length - 1 ? 'text-white font-medium' : 'text-white/50',
                )}
              >
                {item}
              </span>
            </span>
          ))}
        </div>
        <div className="h-5 w-px bg-white/10" />
        <h1 className="font-orbitron font-semibold text-white text-base tracking-wider">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end leading-tight">
          <div className="font-orbitron font-bold text-cyber-300 text-lg tracking-wider">
            {formatClock(now)}
          </div>
          <div className="text-white/40 text-[10px] font-orbitron tracking-wider">
            {formatDateStr(now)}
          </div>
        </div>

        <div className="h-8 w-px bg-white/10" />

        <button
          onClick={() => navigate('/workorders')}
          className={cn(
            'relative flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all',
            alertCount > 0
              ? hasDanger
                ? 'bg-alert-500/15 border-alert-500/40 text-alert-400 hover:bg-alert-500/25'
                : 'bg-radar-500/15 border-radar-500/40 text-radar-400 hover:bg-radar-500/25'
              : 'bg-white/[0.03] border-white/10 text-white/50 hover:bg-white/5',
          )}
        >
          {hasDanger ? (
            <AlertOctagon className="w-4 h-4" />
          ) : alertCount > 0 ? (
            <AlertTriangle className="w-4 h-4" />
          ) : (
            <Bell className="w-4 h-4" />
          )}
          <span className="text-xs font-medium">
            {alertCount > 0 ? `${alertCount} 预警` : '无预警'}
          </span>
          {alertCount > 0 && (
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className={cn(
                'absolute -top-1 -right-1 w-2 h-2 rounded-full',
                hasDanger ? 'bg-alert-500' : 'bg-radar-500',
              )}
            />
          )}
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-white/60">
          <Users className="w-4 h-4 text-success-400" />
          <span className="text-xs font-medium">
            <span className="text-success-400">{onlineUsers}</span> 在线
          </span>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10">
          <span className="text-lg leading-none">{weatherIcon}</span>
          <div className="flex items-center gap-1.5">
            <ThermometerSun className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-white/80 font-orbitron text-sm font-semibold">
              {firstStationData ? formatTemperature(firstStationData.temperature) : '--'}
            </span>
          </div>
          {user && (
            <span className="text-white/30 text-xs border-l border-white/10 pl-2 ml-1 truncate max-w-[72px]">
              {stations[0]?.name ?? ''}
            </span>
          )}
        </div>
      </div>
    </motion.header>
  );
}
