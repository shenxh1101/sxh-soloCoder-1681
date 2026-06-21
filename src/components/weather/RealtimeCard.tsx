import { Thermometer, Droplets, Gauge, Wind, Compass, Eye } from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';
import type { RealtimeWeather } from '@/types';
import {
  formatTemperature,
  formatHumidity,
  formatPressure,
  formatWindSpeed,
  formatWindDirection,
  formatVisibility,
} from '@/utils/formatters';
import { ALERT_THRESHOLDS } from '@/utils/constants';
import { cn } from '@/lib/utils';

interface RealtimeCardProps {
  data: RealtimeWeather;
  stationName: string;
}

interface ElementConfig {
  key: string;
  label: string;
  icon: React.ElementType;
  value: string;
  rawValue: number;
  iconColor: string;
  valueColor: string;
  isAlert: boolean;
  rotateDeg?: number;
}

export default function RealtimeCard({ data, stationName }: RealtimeCardProps) {
  const isWindAlert = data.windSpeed > ALERT_THRESHOLDS.WIND_LEVEL_6;
  const isVisibilityAlert = data.visibility < ALERT_THRESHOLDS.VISIBILITY_LOW;

  const elements: ElementConfig[] = [
    {
      key: 'temperature',
      label: '温度',
      icon: Thermometer,
      value: formatTemperature(data.temperature),
      rawValue: data.temperature,
      iconColor: 'text-red-400',
      valueColor: 'text-red-300',
      isAlert: false,
    },
    {
      key: 'humidity',
      label: '湿度',
      icon: Droplets,
      value: formatHumidity(data.humidity),
      rawValue: data.humidity,
      iconColor: 'text-cyan-400',
      valueColor: 'text-cyan-300',
      isAlert: false,
    },
    {
      key: 'pressure',
      label: '气压',
      icon: Gauge,
      value: formatPressure(data.pressure),
      rawValue: data.pressure,
      iconColor: 'text-purple-400',
      valueColor: 'text-purple-300',
      isAlert: false,
    },
    {
      key: 'windSpeed',
      label: '风速',
      icon: Wind,
      value: formatWindSpeed(data.windSpeed),
      rawValue: data.windSpeed,
      iconColor: 'text-cyan-400',
      valueColor: 'text-cyan-300',
      isAlert: isWindAlert,
    },
    {
      key: 'windDirection',
      label: '风向',
      icon: Compass,
      value: formatWindDirection(data.windDirection),
      rawValue: data.windDirection,
      iconColor: 'text-cyan-400',
      valueColor: 'text-cyan-300',
      isAlert: false,
      rotateDeg: data.windDirection,
    },
    {
      key: 'visibility',
      label: '能见度',
      icon: Eye,
      value: formatVisibility(data.visibility),
      rawValue: data.visibility,
      iconColor: 'text-gray-400',
      valueColor: 'text-gray-300',
      isAlert: isVisibilityAlert,
    },
  ];

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-orbitron text-cyber-300">{stationName}</h3>
        <p className="text-xs text-white/50 mt-1">实时监测六要素</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {elements.map((el) => (
          <GlassCard
            key={el.key}
            className={cn(
              'p-4 flex flex-col items-center justify-center gap-2',
              el.isAlert && 'animate-alert-pulse border-alert-500/50'
            )}
          >
            <div className="relative">
              <el.icon
                className={cn('w-6 h-6', el.iconColor)}
                style={el.rotateDeg !== undefined ? { transform: `rotate(${el.rotateDeg}deg)` } : undefined}
              />
            </div>
            <span className="text-xs text-white/60">{el.label}</span>
            <span
              className={cn(
                'text-base font-orbitron font-semibold',
                el.isAlert ? 'text-alert-400 animate-pulse' : el.valueColor
              )}
            >
              {el.value}
            </span>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
