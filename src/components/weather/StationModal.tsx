import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, FileText } from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';
import GlowButton from '@/components/common/GlowButton';
import StatusBadge from '@/components/common/StatusBadge';
import RealtimeCard from '@/components/weather/RealtimeCard';
import TrendChart from '@/components/weather/TrendChart';
import ExtremeTable from '@/components/weather/ExtremeTable';
import { useAppStore } from '@/store';
import type { HourlyData, AlertLevel } from '@/types';
import { WEATHER_TYPES } from '@/utils/constants';
import { cn } from '@/lib/utils';

type TrendTabType = Exclude<keyof HourlyData, 'time'>;

const TREND_TABS: { key: TrendTabType; label: string }[] = [
  { key: 'temperature', label: '温度' },
  { key: 'humidity', label: '湿度' },
  { key: 'pressure', label: '气压' },
  { key: 'windSpeed', label: '风速' },
  { key: 'windDirection', label: '风向' },
  { key: 'visibility', label: '能见度' },
];

export default function StationModal() {
  const {
    selectedStationId,
    isStationModalOpen,
    selectStation,
    stations,
    realtimeData,
    hourlyData,
    extremeData,
    activeAlerts,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TrendTabType>('temperature');

  useEffect(() => {
    if (isStationModalOpen) {
      setActiveTab('temperature');
    }
  }, [isStationModalOpen]);

  const station = stations.find((s) => s.id === selectedStationId);
  const realtime = selectedStationId ? realtimeData[selectedStationId] : null;
  const hourly = selectedStationId ? hourlyData[selectedStationId] || [] : [];
  const extremes = selectedStationId ? extremeData[selectedStationId] || [] : [];

  const stationAlert = activeAlerts.find((a) => a.stationId === selectedStationId);
  const alertLevel: AlertLevel = stationAlert?.level || 'normal';

  if (!station || !realtime) return null;

  const handleClose = () => {
    selectStation(null);
  };

  const handleCreateWorkOrder = () => {
    console.log('生成工单 - 站点:', station.name);
  };

  return (
    <AnimatePresence>
      {isStationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-space-900/95 shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-glass">
              <div className="flex items-center gap-4">
                <div
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{ backgroundColor: station.color }}
                />
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-orbitron font-bold text-white">{station.name}</h2>
                    <StatusBadge status={alertLevel} />
                  </div>
                  <p className="text-xs text-white/50 mt-1">{station.district}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex h-[calc(90vh-72px)] overflow-hidden">
              <div className="w-3/5 p-6 overflow-y-auto border-r border-white/10">
                <RealtimeCard data={realtime} stationName={station.name} />

                <GlassCard className="mt-6 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-white/80">24小时趋势</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {TREND_TABS.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={cn(
                          'px-3 py-1.5 text-xs rounded-lg border transition-all duration-200',
                          activeTab === tab.key
                            ? 'bg-cyber-500/20 border-cyber-500/50 text-cyber-300'
                            : 'bg-transparent border-white/10 text-white/60 hover:border-white/20 hover:text-white/80'
                        )}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  <div className="h-56 w-full">
                    <TrendChart data={hourly} type={activeTab} />
                  </div>
                </GlassCard>
              </div>

              <div className="w-2/5 p-6 overflow-y-auto flex flex-col gap-4">
                <div className="flex-1 min-h-0">
                  <ExtremeTable extremes={extremes} stationName={station.name} />
                </div>

                <GlassCard className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="w-5 h-5 text-cyber-400" />
                    <h3 className="text-sm font-medium text-white/80">快捷操作</h3>
                  </div>
                  <GlowButton
                    variant="primary"
                    size="md"
                    className="w-full"
                    onClick={handleCreateWorkOrder}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    生成工单
                  </GlowButton>
                </GlassCard>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
