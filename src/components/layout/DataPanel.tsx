import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Thermometer,
  Droplets,
  Gauge,
  Wind,
  Compass,
  Eye,
  AlertTriangle,
  AlertOctagon,
  MapPin,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import {
  formatTemperature,
  formatHumidity,
  formatPressure,
  formatWindSpeed,
  formatWindDirection,
  formatVisibility,
  formatTime,
} from '@/utils/formatters';
import { ALERT_LEVEL_LABELS, ALERT_TYPE_LABELS } from '@/utils/constants';
import type { AlertLevel } from '@/types';

interface MetricCard {
  key: string;
  label: string;
  icon: typeof Thermometer;
  color: string;
  format: (v: number) => string;
  accessor: (d: {
    temperature: number; humidity: number; pressure: number; windSpeed: number; windDirection: number; visibility: number;
  }) => number;
}

const metrics: MetricCard[] = [
  { key: 'temperature', label: '温度', icon: Thermometer, color: 'orange', format: formatTemperature, accessor: (d) => d.temperature },
  { key: 'humidity', label: '湿度', icon: Droplets, color: 'cyber', format: formatHumidity, accessor: (d) => d.humidity },
  { key: 'pressure', label: '气压', icon: Gauge, color: 'radar', format: formatPressure, accessor: (d) => d.pressure },
  { key: 'windSpeed', label: '风速', icon: Wind, color: 'success', format: formatWindSpeed, accessor: (d) => d.windSpeed },
  { key: 'windDirection', label: '风向', icon: Compass, color: 'purple', format: formatWindDirection, accessor: (d) => d.windDirection },
  { key: 'visibility', label: '能见度', icon: Eye, color: 'alert', format: formatVisibility, accessor: (d) => d.visibility },
];

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  cyber: { bg: 'bg-cyber-500/10', text: 'text-cyber-400', border: 'border-cyber-500/20' },
  radar: { bg: 'bg-radar-500/10', text: 'text-radar-400', border: 'border-radar-500/20' },
  success: { bg: 'bg-success-500/10', text: 'text-success-400', border: 'border-success-500/20' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  alert: { bg: 'bg-alert-500/10', text: 'text-alert-400', border: 'border-alert-500/20' },
};

const alertLevelColors: Record<AlertLevel, { dot: string; bg: string; text: string; icon: typeof AlertTriangle }> = {
  normal: { dot: 'bg-success-500', bg: 'bg-success-500/10', text: 'text-success-400', icon: AlertTriangle },
  warning: { dot: 'bg-radar-500', bg: 'bg-radar-500/10', text: 'text-radar-400', icon: AlertTriangle },
  danger: { dot: 'bg-alert-500', bg: 'bg-alert-500/15', text: 'text-alert-400', icon: AlertOctagon },
};

export default function DataPanel() {
  const navigate = useNavigate();
  const stations = useAppStore((s) => s.stations);
  const realtimeData = useAppStore((s) => s.realtimeData);
  const activeAlerts = useAppStore((s) => s.activeAlerts);
  const selectStation = useAppStore((s) => s.selectStation);
  const triggerValidationTest = useAppStore((s) => s.triggerValidationTest);

  const allData = Object.values(realtimeData);
  const avgData = allData.length
    ? {
        temperature: allData.reduce((a, b) => a + b.temperature, 0) / allData.length,
        humidity: allData.reduce((a, b) => a + b.humidity, 0) / allData.length,
        pressure: allData.reduce((a, b) => a + b.pressure, 0) / allData.length,
        windSpeed: allData.reduce((a, b) => a + b.windSpeed, 0) / allData.length,
        windDirection: allData.reduce((a, b) => a + b.windDirection, 0) / allData.length,
        visibility: allData.reduce((a, b) => a + b.visibility, 0) / allData.length,
      }
    : { temperature: 0, humidity: 0, pressure: 0, windSpeed: 0, windDirection: 0, visibility: 0 };

  const displayStations = stations.slice(0, 8);
  const latestAlerts = [...activeAlerts].sort((a, b) => b.triggeredAt - a.triggeredAt).slice(0, 3);

  return (
    <motion.aside
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut', delay: 0.15 }}
      className="fixed right-0 top-14 bottom-0 w-80 bg-space-800/60 backdrop-blur-xl border-l border-white/5 overflow-y-auto p-4 z-20"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-orbitron font-bold text-white text-sm tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-400 shadow-[0_0_8px_rgba(0,212,255,0.8)] animate-pulse" />
            实时监测总览
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {metrics.map((m) => {
            const Icon = m.icon;
            const colors = colorMap[m.color] ?? colorMap.cyber;
            const value = m.accessor(avgData);
            return (
              <div
                key={m.key}
                className={cn(
                  'p-2.5 rounded-xl border bg-white/[0.02] backdrop-blur-sm',
                  colors.border,
                )}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', colors.bg)}>
                    <Icon className={cn('w-3.5 h-3.5', colors.text)} />
                  </div>
                  <span className="text-[11px] text-white/50 font-medium">{m.label}</span>
                </div>
                <div className={cn('font-orbitron font-bold text-sm', colors.text)}>
                  {m.format(value)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-1">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-[11px] font-orbitron text-white/60 tracking-wider">
              观测站状态
            </h3>
            <span className="text-[10px] text-white/30">
              {displayStations.length} 站
            </span>
          </div>
          <div className="space-y-1.5">
            {displayStations.map((station) => {
              const data = realtimeData[station.id];
              const stationAlerts = activeAlerts.filter((a) => a.stationId === station.id);
              const highestLevel: AlertLevel = stationAlerts.reduce(
                (acc: AlertLevel, a) =>
                  a.level === 'danger' ? 'danger' : acc === 'danger' ? 'danger' : a.level === 'warning' ? 'warning' : acc,
                'normal',
              );
              const levelStyle = alertLevelColors[highestLevel];
              return (
                <button
                  key={station.id}
                  onClick={() => selectStation(station.id)}
                  className="w-full group flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-cyber-500/20 transition-all text-left"
                >
                  <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: station.color, boxShadow: `0 0 8px ${station.color}80` }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-white/30 flex-shrink-0" />
                      <span className="text-[12px] text-white/80 font-medium truncate">
                        {station.name}
                      </span>
                    </div>
                    <div className="text-[10px] text-white/40 truncate mt-0.5">
                      {station.district}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[11px] font-orbitron text-orange-400 font-semibold">
                      {data ? formatTemperature(data.temperature) : '--'}
                    </span>
                    {highestLevel !== 'normal' && (
                      <div className={cn('w-4 h-4 rounded-md flex items-center justify-center', levelStyle.bg)}>
                        {(() => {
                          const LevelIcon = levelStyle.icon;
                          return <LevelIcon className={cn('w-2.5 h-2.5', levelStyle.text)} />;
                        })()}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-1">
          <div className="flex items-center justify-between mb-2.5">
            <h3
              className="text-[11px] font-orbitron text-white/60 tracking-wider select-none cursor-pointer transition-colors hover:text-white/80"
              title="双击测试预警校验失败"
              onDoubleClick={triggerValidationTest}
            >
              最新预警
            </h3>
            <button
              onClick={() => navigate('/workorders')}
              className="text-[10px] text-cyber-400 hover:text-cyber-300 flex items-center gap-0.5"
            >
              全部 <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {latestAlerts.length > 0 ? (
            <div className="space-y-1.5">
              {latestAlerts.map((alert) => {
                const style = alertLevelColors[alert.level];
                const AlertIcon = style.icon;
                const stationName = stations.find((s) => s.id === alert.stationId)?.name ?? alert.stationId;
                return (
                  <button
                    key={alert.id}
                    onClick={() => navigate('/workorders')}
                    className={cn(
                      'w-full text-left p-2.5 rounded-xl border transition-all',
                      style.bg,
                      alert.level === 'danger'
                        ? 'border-alert-500/30 hover:border-alert-500/50'
                        : 'border-radar-500/20 hover:border-radar-500/40',
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <AlertIcon className={cn('w-3.5 h-3.5 mt-0.5 flex-shrink-0', style.text)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={cn('text-[10px] font-bold', style.text)}>
                            【{ALERT_LEVEL_LABELS[alert.level]}】
                          </span>
                          <span className="text-[10px] text-white/70">
                            {ALERT_TYPE_LABELS[alert.type]}
                          </span>
                        </div>
                        <div className="text-[10px] text-white/60 mt-0.5 line-clamp-1">
                          {stationName}
                        </div>
                        <div className="text-[9px] text-white/30 mt-1 font-orbitron">
                          {formatTime(alert.triggeredAt)}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
              <div className="w-8 h-8 rounded-full bg-success-500/10 flex items-center justify-center mx-auto mb-2">
                <div className="w-2 h-2 rounded-full bg-success-400" />
              </div>
              <div className="text-[11px] text-white/50">暂无活跃预警</div>
            </div>
          )}
        </div>

        <button
          onClick={() => navigate('/briefings')}
          className="w-full group flex items-center justify-between gap-2 p-3 rounded-xl bg-gradient-to-r from-cyber-500/10 to-radar-500/10 border border-cyber-500/20 hover:border-cyber-500/40 transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyber-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-4.5 h-4.5 text-cyber-400" />
            </div>
            <div className="text-left">
              <div className="text-[12px] text-white font-semibold">天气简报</div>
              <div className="text-[10px] text-white/40">查看最新气象分析</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-cyber-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </motion.aside>
  );
}
