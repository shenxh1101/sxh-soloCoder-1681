import { motion } from 'framer-motion';
import {
  CloudSun,
  CloudRain,
  Sun,
  Cloud,
  Snowflake,
  CloudLightning,
  CloudFog,
} from 'lucide-react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import SceneRoot from '@/components/3d/Scene';
import DataPanel from '@/components/layout/DataPanel';
import StationModal from '@/components/weather/StationModal';
import { formatTemperature } from '@/utils/formatters';

const precipIcons = [Sun, CloudSun, Cloud, CloudRain, CloudLightning, Snowflake, CloudFog];

function getWeatherIcon(precipitation: number, cloudCover: number) {
  if (precipitation > 10) return CloudLightning;
  if (precipitation > 3) return CloudRain;
  if (precipitation > 0.5) return CloudFog;
  if (cloudCover > 70) return Cloud;
  if (cloudCover > 40) return CloudSun;
  return Sun;
}

function getWeatherIconColor(Icon: typeof Sun) {
  switch (Icon) {
    case CloudRain:
    case CloudLightning:
      return 'text-cyber-400';
    case Snowflake:
      return 'text-white';
    case CloudFog:
      return 'text-white/60';
    case Cloud:
      return 'text-white/80';
    case CloudSun:
      return 'text-orange-300';
    case Sun:
    default:
      return 'text-orange-400';
  }
}

export default function DashboardPage() {
  useAuthGuard();

  const forecast = useAppStore((s) => s.forecast);
  const forecastTimeIndex = useAppStore((s) => s.forecastTimeIndex);
  const setForecastTimeIndex = useAppStore((s) => s.setForecastTimeIndex);

  const slots = forecast?.slots ?? [];
  const displaySlots = slots.slice(0, 12);

  return (
    <div className="relative w-full min-h-[calc(100vh-3.5rem)] bg-space-900 bg-grid-pattern bg-grid-size overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-space-900 via-space-800/30 to-space-900 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-cyber-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-radar-500/5 blur-3xl pointer-events-none" />

      <DataPanel />
      <StationModal />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="absolute top-0 left-0 w-[calc(100%-20rem)] h-[calc(100vh-3.5rem)]"
      >
        <SceneRoot />
      </motion.div>

      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
        className="absolute bottom-4 left-0 right-80 h-20 bg-space-800/80 backdrop-blur-xl border border-white/10 rounded-xl mx-6 px-6 flex items-center gap-4 overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-500/50 to-transparent" />
        <div className="flex flex-col items-center gap-0.5 mr-2 flex-shrink-0">
          <span className="text-[9px] font-orbitron text-white/40 tracking-wider">
            FORECAST
          </span>
          <span className="text-[10px] font-orbitron text-cyber-400 font-bold">
            {displaySlots.length > 0 ? `${displaySlots[0].time} - ${displaySlots[displaySlots.length - 1].time}` : '--'}
          </span>
        </div>
        <div className="h-10 w-px bg-white/10 flex-shrink-0" />
        <div className="flex-1 flex items-center justify-between gap-1 overflow-x-auto">
          {displaySlots.map((slot, idx) => {
            const isActive = idx === forecastTimeIndex;
            const WeatherIcon = getWeatherIcon(slot.precipitation, slot.cloudCover);
            const iconColor = getWeatherIconColor(WeatherIcon);
            return (
              <button
                key={idx}
                onClick={() => setForecastTimeIndex(idx)}
                className={cn(
                  'relative flex-shrink-0 flex-1 min-w-[56px] h-14 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all',
                  isActive
                    ? 'bg-cyber-500/15 border border-cyber-500/40 shadow-[0_0_20px_rgba(0,212,255,0.35)]'
                    : 'bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10',
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="timeline-active"
                    className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyber-400 shadow-[0_0_8px_rgba(0,212,255,0.9)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <span
                  className={cn(
                    'text-[9px] font-orbitron font-medium',
                    isActive ? 'text-cyber-300' : 'text-white/40',
                  )}
                >
                  {slot.time}
                </span>
                <WeatherIcon
                  className={cn(
                    'w-3.5 h-3.5',
                    isActive ? iconColor : `${iconColor} opacity-70`,
                  )}
                />
                <span
                  className={cn(
                    'text-[10px] font-orbitron font-bold',
                    isActive ? 'text-white' : 'text-white/70',
                  )}
                >
                  {formatTemperature(slot.temperature)}
                </span>
              </button>
            );
          })}
          {displaySlots.length === 0 && (
            <div className="flex-1 text-center text-white/30 text-sm py-2">
              暂无预报数据
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
