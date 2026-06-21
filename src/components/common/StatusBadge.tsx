import { cn } from '@/lib/utils';
import type { WorkOrderStatus, AlertLevel } from '@/types';
import { WORK_ORDER_STATUS_LABELS, ALERT_LEVEL_LABELS } from '@/utils/constants';

interface StatusBadgeProps {
  status: WorkOrderStatus | AlertLevel;
  text?: string;
}

const statusColorMap: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  pending_observer: {
    bg: 'bg-cyber-500/10',
    border: 'border-cyber-500/30',
    text: 'text-cyber-300',
    dot: 'bg-cyber-500',
  },
  pending_forecaster: {
    bg: 'bg-radar-500/10',
    border: 'border-radar-500/30',
    text: 'text-radar-400',
    dot: 'bg-radar-500',
  },
  pending_director: {
    bg: 'bg-radar-500/20',
    border: 'border-radar-500/50',
    text: 'text-radar-400',
    dot: 'bg-radar-500 animate-pulse',
  },
  approved: {
    bg: 'bg-success-500/10',
    border: 'border-success-500/30',
    text: 'text-success-400',
    dot: 'bg-success-500',
  },
  rejected: {
    bg: 'bg-alert-500/10',
    border: 'border-alert-500/30',
    text: 'text-alert-400',
    dot: 'bg-alert-500',
  },
  normal: {
    bg: 'bg-cyber-500/10',
    border: 'border-cyber-500/30',
    text: 'text-cyber-300',
    dot: 'bg-cyber-500',
  },
  warning: {
    bg: 'bg-radar-500/10',
    border: 'border-radar-500/30',
    text: 'text-radar-400',
    dot: 'bg-radar-500',
  },
  danger: {
    bg: 'bg-alert-500/20',
    border: 'border-alert-500/50',
    text: 'text-alert-400',
    dot: 'bg-alert-500 animate-pulse',
  },
};

export default function StatusBadge({ status, text }: StatusBadgeProps) {
  const isAlertLevel = ['normal', 'warning', 'danger'].includes(status);
  const labels = isAlertLevel ? ALERT_LEVEL_LABELS : WORK_ORDER_STATUS_LABELS;
  const displayText = text || labels[status as keyof typeof labels] || status;
  const colors = statusColorMap[status] || statusColorMap.normal;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium',
        colors.bg,
        colors.border,
        colors.text
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', colors.dot)} />
      {displayText}
    </span>
  );
}
