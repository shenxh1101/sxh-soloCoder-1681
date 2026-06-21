import { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useAppStore } from '@/store';
import type { WeatherAlert } from '@/types';
import { cn } from '@/lib/utils';
import { formatTime } from '@/utils/formatters';
import type { AlertLevel, AlertType } from '@/types';

const ALERT_LEVEL_LABELS: Record<AlertLevel, string> = {
  normal: '普通',
  warning: '预警',
  danger: '危险',
};

const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  wind: '大风预警',
  visibility: '低能见度预警',
  both: '气象灾害预警',
};

const toastColors: Record<AlertLevel, { border: string; bg: string; icon: string; accent: string }> = {
  normal: {
    border: 'border-cyber-500/50',
    bg: 'bg-cyber-500/10',
    icon: 'text-cyber-300',
    accent: 'bg-cyber-500',
  },
  warning: {
    border: 'border-radar-500/50',
    bg: 'bg-radar-500/10',
    icon: 'text-radar-400',
    accent: 'bg-radar-500',
  },
  danger: {
    border: 'border-alert-500/70',
    bg: 'bg-alert-500/20',
    icon: 'text-alert-400',
    accent: 'bg-alert-500',
  },
};

export default function AlertToast() {
  const latestAlert = useAppStore((state) => state.latestAlert);
  const stations = useAppStore((state) => state.stations);
  const clearLatestAlert = useAppStore((state) => state.clearLatestAlert);
  const [visible, setVisible] = useState(false);
  const lastIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (latestAlert && latestAlert.id !== lastIdRef.current) {
      lastIdRef.current = latestAlert.id;
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [latestAlert]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      clearLatestAlert();
      lastIdRef.current = null;
    }, 300);
  };

  if (!latestAlert) return null;

  const stationName = stations.find((s) => s.id === latestAlert.stationId)?.name ?? latestAlert.stationId;
  const level = (latestAlert as WeatherAlert).level;
  const type = (latestAlert as WeatherAlert).type;
  const colors = toastColors[level] || toastColors.normal;

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={cn(
              'pointer-events-auto w-80 backdrop-blur-md rounded-xl border shadow-xl p-4 overflow-hidden',
              colors.bg,
              colors.border
            )}
          >
            <div className={cn('absolute top-0 left-0 w-1 h-full', colors.accent)} />
            <div className="flex items-start justify-between gap-3 pl-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={cn('w-2 h-2 rounded-full animate-pulse', colors.accent)} />
                  <span className={cn('font-orbitron font-semibold text-sm', colors.icon)}>
                    【{ALERT_LEVEL_LABELS[level]}】{ALERT_TYPE_LABELS[type]}
                  </span>
                </div>
                <p className="text-white/90 text-sm mb-2 break-words">{latestAlert.message}</p>
                <div className="flex items-center justify-between text-xs text-white/50">
                  <span>{stationName}</span>
                  <span>{formatTime(latestAlert.triggeredAt)}</span>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-white/40 hover:text-white/80 transition-colors p-1 rounded hover:bg-white/5 flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
