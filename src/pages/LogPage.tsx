import { useMemo, useState } from 'react';
import { useAppStore } from '@/store';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import GlassCard from '@/components/common/GlassCard';
import { USER_ROLE_LABELS } from '@/utils/constants';
import type { UserRole, OperationLog } from '@/types';
import {
  ScrollText,
  Search,
  CalendarDays,
  Filter,
  ChevronLeft,
  ChevronRight,
  Lock,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const ROLE_OPTIONS: { value: UserRole | 'all'; label: string }[] = [
  { value: 'all', label: '全部角色' },
  { value: 'observer', label: '观测员' },
  { value: 'forecaster', label: '预报员' },
  { value: 'director', label: '局长' },
];

const ACTION_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: '全部操作' },
  { value: '登录', label: '登录' },
  { value: '退出登录', label: '登出' },
  { value: '审批通过', label: '审批' },
  { value: '退回工单', label: '审批' },
  { value: '数据查看', label: '数据查看' },
  { value: '预警触发', label: '数据查看' },
  { value: '导出日报', label: '导出' },
];

const ALLOWED_ROLES: UserRole[] = ['forecaster', 'director'];
const PAGE_SIZE = 20;

export default function LogPage() {
  const { user, loading } = useAuthGuard(ALLOWED_ROLES);
  const { operationLogs } = useAppStore();

  const today = useMemo(() => formatDate(new Date()), []);
  const thirtyDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return formatDate(d);
  }, []);

  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(1);

  const filteredLogs = useMemo(() => {
    let result = [...operationLogs];

    if (roleFilter !== 'all') {
      result = result.filter((l) => l.role === roleFilter);
    }

    if (actionFilter !== 'all') {
      if (actionFilter === '审批') {
        result = result.filter((l) => l.action.includes('审批') || l.action.includes('退回'));
      } else if (actionFilter === '数据查看') {
        result = result.filter((l) => l.action.includes('数据') || l.action.includes('预警') || l.action.includes('查看'));
      } else if (actionFilter === '导出') {
        result = result.filter((l) => l.action.includes('导出'));
      } else {
        result = result.filter((l) => l.action.includes(actionFilter));
      }
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    result = result.filter((l) => l.timestamp >= start.getTime() && l.timestamp <= end.getTime());

    if (searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase();
      result = result.filter(
        (l) =>
          l.userName.toLowerCase().includes(kw) ||
          l.action.toLowerCase().includes(kw) ||
          l.target.toLowerCase().includes(kw) ||
          l.detail.toLowerCase().includes(kw) ||
          l.ip.toLowerCase().includes(kw),
      );
    }

    return result;
  }, [operationLogs, roleFilter, actionFilter, startDate, endDate, searchKeyword]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredLogs.slice(start, start + PAGE_SIZE);
  }, [filteredLogs, currentPage]);

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  };

  const selectClass =
    'px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm focus:outline-none focus:border-cyber-500/50 focus:ring-1 focus:ring-cyber-500/30 transition-all cursor-pointer';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-cyber-400 font-orbitron">加载中...</div>
      </div>
    );
  }

  if (user && !ALLOWED_ROLES.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <GlassCard className="max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-alert-500/10 border border-alert-500/30 flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-alert-400" />
          </div>
          <h2 className="text-2xl font-bold text-white/90 mb-3 flex items-center justify-center gap-2">
            <Lock className="w-6 h-6 text-alert-400" />
            403 无权限访问
          </h2>
          <p className="text-white/50 text-sm mb-6 leading-relaxed">
            您当前的角色是「{USER_ROLE_LABELS[user.role]}」，
            操作日志页面仅允许「预报员」或「局长」访问。
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-orbitron text-white/95 mb-2 flex items-center gap-3">
            <ScrollText className="w-8 h-8 text-cyber-400" />
            操作日志
          </h1>
          <p className="text-white/50 text-sm">记录系统所有操作行为，支持多维度筛选查询</p>
        </div>

        <GlassCard className="p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-cyber-400" />
              <span className="text-sm text-white/60">筛选：</span>
            </div>

            <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value as UserRole | 'all'); setPage(1); }} className={selectClass}>
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-space-900">
                  {opt.label}
                </option>
              ))}
            </select>

            <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }} className={selectClass}>
              {ACTION_OPTIONS.map((opt, idx) => (
                <option key={`${opt.value}-${idx}`} value={opt.value} className="bg-space-900">
                  {opt.label}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <CalendarDays className="w-4 h-4 text-white/40" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                  max={endDate}
                  className={cn(selectClass, 'w-auto')}
                />
              </div>
              <span className="text-white/30">至</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                min={startDate}
                max={today}
                className={cn(selectClass, 'w-auto')}
              />
            </div>

            <div className="ml-auto relative flex-1 sm:flex-none sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => { setSearchKeyword(e.target.value); setPage(1); }}
                placeholder="搜索用户名/操作/详情/IP..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm placeholder-white/30 focus:outline-none focus:border-cyber-500/50 focus:ring-1 focus:ring-cyber-500/30 transition-all"
              />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-white/50">
                  <th className="text-left py-3 px-4 font-medium whitespace-nowrap">时间</th>
                  <th className="text-left py-3 px-4 font-medium whitespace-nowrap">用户名</th>
                  <th className="text-left py-3 px-4 font-medium whitespace-nowrap">角色</th>
                  <th className="text-left py-3 px-4 font-medium whitespace-nowrap">操作类型</th>
                  <th className="text-left py-3 px-4 font-medium whitespace-nowrap">目标</th>
                  <th className="text-left py-3 px-4 font-medium">详情</th>
                  <th className="text-left py-3 px-4 font-medium whitespace-nowrap">IP</th>
                </tr>
              </thead>
              <tbody>
                {pageData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-white/30">
                      <div className="flex flex-col items-center">
                        <ScrollText className="w-12 h-12 text-white/15 mb-3" />
                        <p className="text-white/40">暂无符合条件的日志</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageData.map((log: OperationLog, idx) => (
                    <tr
                      key={log.id}
                      className={cn(
                        'border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors',
                        idx % 2 === 0 && 'bg-white/[0.015]',
                      )}
                    >
                      <td className="py-3 px-4 text-white/60 font-orbitron text-xs whitespace-nowrap">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className="py-3 px-4 text-white/80 font-medium whitespace-nowrap">{log.userName}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-block px-2 py-0.5 rounded text-xs font-medium',
                            log.role === 'director' && 'bg-alert-500/15 text-alert-400 border border-alert-500/20',
                            log.role === 'forecaster' && 'bg-radar-500/15 text-radar-400 border border-radar-500/20',
                            log.role === 'observer' && 'bg-cyber-500/15 text-cyber-400 border border-cyber-500/20',
                          )}
                        >
                          {USER_ROLE_LABELS[log.role]}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-block px-2 py-0.5 rounded text-xs',
                            (log.action.includes('审批') || log.action.includes('退回')) && 'bg-success-500/10 text-success-400',
                            log.action.includes('登录') && 'bg-cyber-500/10 text-cyber-400',
                            log.action.includes('预警') && 'bg-alert-500/10 text-alert-400',
                            log.action.includes('导出') && 'bg-radar-500/10 text-radar-400',
                            !(log.action.includes('审批') || log.action.includes('退回') || log.action.includes('登录') || log.action.includes('预警') || log.action.includes('导出')) && 'bg-white/5 text-white/60',
                          )}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white/60 whitespace-nowrap max-w-[120px] truncate" title={log.target}>
                        {log.target}
                      </td>
                      <td className="py-3 px-4 text-white/50 max-w-xs truncate" title={log.detail}>
                        {log.detail}
                      </td>
                      <td className="py-3 px-4 text-white/40 font-orbitron text-xs whitespace-nowrap">{log.ip}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-white/10">
            <p className="text-xs text-white/40">
              共 <span className="text-cyber-400 font-bold font-orbitron">{filteredLogs.length}</span> 条记录
              ，当前第 <span className="text-white/70 font-orbitron">{currentPage}</span> / {totalPages} 页
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white/90 hover:border-cyber-500/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-white/10"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={cn(
                      'min-w-[32px] h-8 px-2 rounded-lg text-xs font-medium transition-all',
                      currentPage === pageNum
                        ? 'bg-cyber-500/20 text-cyber-300 border border-cyber-500/40 shadow-[0_0_10px_rgba(0,212,255,0.2)]'
                        : 'bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/10 border border-white/10',
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white/90 hover:border-cyber-500/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-white/10"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
