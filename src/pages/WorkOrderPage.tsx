import { useMemo, useState } from 'react';
import { useAppStore } from '@/store';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import GlassCard from '@/components/common/GlassCard';
import WorkOrderCard from '@/components/workorder/WorkOrderCard';
import ApprovalModal from '@/components/workorder/ApprovalModal';
import type { WorkOrderStatus, UserRole } from '@/types';
import { APPROVAL_FLOW, USER_ROLE_LABELS, WORK_ORDER_STATUS_LABELS } from '@/utils/constants';
import {
  ClipboardCheck,
  ClipboardList,
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type TabKey = 'pending_me' | 'all_pending' | 'approved' | 'rejected' | 'all';

interface TabConfig {
  key: TabKey;
  label: string;
  icon: typeof ClipboardCheck;
  statuses: WorkOrderStatus[];
  myTurnOnly?: boolean;
}

const TABS: TabConfig[] = [
  { key: 'pending_me', label: '待我处理', icon: Clock, statuses: ['pending_observer', 'pending_forecaster', 'pending_director'], myTurnOnly: true },
  { key: 'all_pending', label: '全部待处理', icon: ClipboardList, statuses: ['pending_observer', 'pending_forecaster', 'pending_director'] },
  { key: 'approved', label: '已通过', icon: CheckCircle2, statuses: ['approved'] },
  { key: 'rejected', label: '已驳回', icon: XCircle, statuses: ['rejected'] },
  { key: 'all', label: '全部工单', icon: ClipboardCheck, statuses: ['pending_observer', 'pending_forecaster', 'pending_director', 'approved', 'rejected'] },
];

export default function WorkOrderPage() {
  useAuthGuard();
  const { workOrders, user } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabKey>('pending_me');

  const [approvalModal, setApprovalModal] = useState<{
    open: boolean;
    orderId: string;
    orderTitle: string;
  }>({ open: false, orderId: '', orderTitle: '' });

  const stats = useMemo(() => {
    const pending = workOrders.filter((o) =>
      ['pending_observer', 'pending_forecaster', 'pending_director'].includes(o.status),
    );
    const myStep = user
      ? pending.filter((o) => APPROVAL_FLOW[user.role as UserRole]?.step === o.currentStep)
      : [];
    return {
      total: workOrders.length,
      pending: pending.length,
      myPending: myStep.length,
      approved: workOrders.filter((o) => o.status === 'approved').length,
      rejected: workOrders.filter((o) => o.status === 'rejected').length,
    };
  }, [workOrders, user]);

  const filteredOrders = useMemo(() => {
    const tab = TABS.find((t) => t.key === activeTab) ?? TABS[0];
    let result = workOrders.filter((o) => tab.statuses.includes(o.status));
    if (tab.myTurnOnly && user) {
      const myStep = APPROVAL_FLOW[user.role as UserRole]?.step;
      if (myStep != null) {
        result = result.filter((o) => o.currentStep === myStep);
      }
    }
    return result.sort((a, b) => b.createdAt - a.createdAt);
  }, [workOrders, activeTab, user]);

  const handleApprove = (orderId: string, orderTitle: string) => {
    setApprovalModal({ open: true, orderId, orderTitle });
  };

  const handleReject = (orderId: string, orderTitle: string) => {
    setApprovalModal({ open: true, orderId, orderTitle });
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-orbitron text-white/95 mb-2 flex items-center gap-3">
              <ClipboardCheck className="w-8 h-8 text-cyber-400" />
              预警工单
            </h1>
            <p className="text-white/50 text-sm">
              {user ? `当前身份：${USER_ROLE_LABELS[user.role]}，第 ${APPROVAL_FLOW[user.role as UserRole]?.step} 级审批` : ''}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <GlassCard className="px-4 py-3 min-w-[120px]">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">待我处理</p>
              <p className={cn(
                'text-2xl font-bold font-orbitron',
                stats.myPending > 0 ? 'text-alert-400 animate-pulse' : 'text-white/70',
              )}>
                {stats.myPending}
              </p>
            </GlassCard>
            <GlassCard className="px-4 py-3 min-w-[120px]">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">全部待处理</p>
              <p className="text-2xl font-bold font-orbitron text-cyber-400">{stats.pending}</p>
            </GlassCard>
            <GlassCard className="px-4 py-3 min-w-[120px]">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">已通过</p>
              <p className="text-2xl font-bold font-orbitron text-success-400">{stats.approved}</p>
            </GlassCard>
            <GlassCard className="px-4 py-3 min-w-[120px]">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">已驳回</p>
              <p className="text-2xl font-bold font-orbitron text-alert-400">{stats.rejected}</p>
            </GlassCard>
          </div>
        </div>

        <GlassCard className="mb-6 p-1 flex flex-wrap gap-1 bg-white/[0.02]">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            const count = tab.statuses.reduce(
              (acc, s) => acc + workOrders.filter((o) => {
                if (o.status !== s) return false;
                if (tab.myTurnOnly && user) {
                  const myStep = APPROVAL_FLOW[user.role as UserRole]?.step;
                  return myStep != null && o.currentStep === myStep;
                }
                return true;
              }).length,
              0,
            );
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 md:flex-none',
                  isActive
                    ? 'bg-cyber-500/15 text-cyber-300 shadow-[0_0_15px_rgba(0,212,255,0.25)] border border-cyber-500/30'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]',
                )}
              >
                <Icon className={cn('w-4 h-4', isActive && 'animate-pulse')} />
                {tab.label}
                <span className={cn(
                  'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold',
                  isActive ? 'bg-cyber-500/30 text-cyber-200' : 'bg-white/10 text-white/50',
                  count > 0 && !isActive && tab.key === 'pending_me' && 'bg-alert-500/20 text-alert-300',
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </GlassCard>

        {filteredOrders.length === 0 ? (
          <GlassCard className="py-20 flex flex-col items-center justify-center">
            <Inbox className="w-20 h-20 text-white/15 mb-5" />
            <p className="text-white/50 text-xl mb-2">暂无工单</p>
            <p className="text-white/25 text-sm">
              当前「{TABS.find((t) => t.key === activeTab)?.label}」列表为空
            </p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredOrders.map((order) => (
              <WorkOrderCard
                key={order.id}
                order={order}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>

      <ApprovalModal
        open={approvalModal.open}
        onClose={() => setApprovalModal({ open: false, orderId: '', orderTitle: '' })}
        orderId={approvalModal.orderId}
        orderTitle={approvalModal.orderTitle}
      />
    </div>
  );
}
