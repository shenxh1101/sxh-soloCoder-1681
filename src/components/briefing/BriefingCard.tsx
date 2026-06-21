import { useState } from 'react';
import GlassCard from '@/components/common/GlassCard';
import type { WeatherBriefing } from '@/types';
import {
  Cloud,
  Thermometer,
  Droplets,
  Gauge,
  Wind,
  Eye,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BriefingCardProps {
  briefing: WeatherBriefing;
}

export default function BriefingCard({ briefing }: BriefingCardProps) {
  const [expanded, setExpanded] = useState(false);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const stats = [
    { label: '平均温度', value: `${briefing.avgTemperature}°C`, icon: Thermometer, color: 'text-orange-400' },
    { label: '平均湿度', value: `${briefing.avgHumidity}%`, icon: Droplets, color: 'text-cyan-400' },
    { label: '平均气压', value: `${briefing.avgPressure}hPa`, icon: Gauge, color: 'text-radar-400' },
    { label: '最大风速', value: `${briefing.maxWindSpeed.toFixed(1)}m/s`, icon: Wind, color: 'text-purple-400' },
    { label: '最低能见度', value: `${briefing.minVisibility}m`, icon: Eye, color: 'text-success-400' },
  ];

  return (
    <GlassCard className="p-5 hover:scale-[1.01] transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-cyber-400 shrink-0" />
          <div>
            <p className="text-sm font-bold text-white/80">时段：{briefing.period}</p>
            <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" />
              {formatTime(briefing.generatedAt)}
            </p>
          </div>
        </div>
        {briefing.activeAlerts > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-alert-500/20 border border-alert-500/40 text-alert-400 text-xs font-bold">
            <AlertTriangle className="w-3 h-3" />
            {briefing.activeAlerts}条预警
          </span>
        )}
      </div>

      <p className="text-sm text-white/50 leading-relaxed mb-4 line-clamp-2">
        {briefing.summary}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="px-2.5 py-2 rounded-lg bg-white/5 border border-white/5"
          >
            <div className="flex items-center gap-1 mb-0.5">
              <Icon className={cn('w-3 h-3 shrink-0', color)} />
              <span className="text-[10px] text-white/40">{label}</span>
            </div>
            <p className={cn('text-sm font-bold font-orbitron', color)}>{value}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-white/60 hover:text-white/80 transition-all"
      >
        {expanded ? (
          <>
            收起详情 <ChevronUp className="w-3.5 h-3.5" />
          </>
        ) : (
          <>
            查看各站详情 <ChevronDown className="w-3.5 h-3.5" />
          </>
        )}
      </button>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-white/5 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-white/40 border-b border-white/10">
                <th className="text-left py-2 px-2 font-medium">站点</th>
                <th className="text-right py-2 px-2 font-medium">温度</th>
                <th className="text-right py-2 px-2 font-medium">湿度</th>
                <th className="text-right py-2 px-2 font-medium">风速</th>
                <th className="text-right py-2 px-2 font-medium">能见度</th>
              </tr>
            </thead>
            <tbody>
              {briefing.stationData.map((station) => (
                <tr
                  key={station.stationId}
                  className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
                >
                  <td className="py-2 px-2 text-white/70">{station.stationName}</td>
                  <td className="py-2 px-2 text-right font-orbitron text-orange-400">
                    {station.temperature}°C
                  </td>
                  <td className="py-2 px-2 text-right font-orbitron text-cyan-400">
                    {station.humidity}%
                  </td>
                  <td className="py-2 px-2 text-right font-orbitron text-purple-400">
                    {station.windSpeed.toFixed(1)}m/s
                  </td>
                  <td className="py-2 px-2 text-right font-orbitron text-success-400">
                    {station.visibility}m
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </GlassCard>
  );
}
