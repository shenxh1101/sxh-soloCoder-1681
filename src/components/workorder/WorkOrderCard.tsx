import GlassCard from '@/components/common/GlassCard';
import StatusBadge from '@/components/common/StatusBadge';
import StepIndicator from './StepIndicator';
import GlowButton from '@/components/common/GlowButton';
import { useAppStore } from '@/store';
import { APPROVAL_FLOW, ALERT_TYPE_LABELS } from '@/utils/constants';
import type { WorkOrder } from '@/types';
import { AlertTriangle, Clock, FileText } from 'lucide-react';

interface WorkOrderCardProps {
  order: WorkOrder;
  onApprove?: (orderId: string, orderTitle: string) => void;
  onReject?: (orderId: string, orderTitle: string) => void;
}

export default function WorkOrderCard({ order, onApprove, onReject }: WorkOrderCardProps) {
  const { user } = useAppStore();
  const hasDanger = order.alerts.some((a) => a.level === 'danger');
  const isMyTurn = user && APPROVAL_FLOW[user.role]?.step === order.currentStep;
  const isPending = ['pending_observer', 'pending_forecaster', 'pending_director'].includes(order.status);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <GlassCard className="p-5 hover:scale-[1.01] transition-transform duration-300">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap flex-1">
          <FileText className="w-5 h-5 text-cyber-400 shrink-0" />
          <h3 className="text-base font-bold text-white/90 leading-snug">{order.title}</h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {hasDanger && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-alert-500/20 border border-alert-500/40 text-alert-400 text-xs font-bold animate-alert-pulse">
              <AlertTriangle className="w-3 h-3" />
              紧急
            </span>
          )}
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-white/60 leading-relaxed mb-3 line-clamp-2">{order.description}</p>
        {order.alerts.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs text-white/40 font-medium">关联预警：</p>
            {order.alerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className="text-xs px-3 py-2 rounded-lg bg-white/5 border border-white/5 flex items-center gap-2"
              >
                <span
                  className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    alert.level === 'danger'
                      ? 'bg-alert-500/20 text-alert-400'
                      : alert.level === 'warning'
                        ? 'bg-radar-500/20 text-radar-400'
                        : 'bg-cyber-500/20 text-cyber-400'
                  }`}
                >
                  {ALERT_TYPE_LABELS[alert.type]}
                </span>
                <span className="text-white/70 truncate">{alert.message}</span>
              </div>
            ))}
            {order.alerts.length > 3 && (
              <p className="text-xs text-cyber-400">...还有 {order.alerts.length - 3} 条预警</p>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-white/5 pt-4">
        <StepIndicator currentStep={order.currentStep} status={order.status} />
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
        <div className="flex items-center gap-1.5 text-xs text-white/40">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatTime(order.createdAt)}</span>
        </div>
        {isPending && isMyTurn && (
          <div className="flex items-center gap-2">
            <GlowButton
              variant="danger"
              size="sm"
              onClick={() => onReject?.(order.id, order.title)}
            >
              驳回
            </GlowButton>
            <GlowButton
              variant="success"
              size="sm"
              onClick={() => onApprove?.(order.id, order.title)}
            >
              批准
            </GlowButton>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
