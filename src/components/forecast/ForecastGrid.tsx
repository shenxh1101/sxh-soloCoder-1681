import { useMemo } from 'react';
import {
  Thermometer,
  Droplets,
  CloudRain,
  Wind,
  Compass,
  Eye,
  Cloud,
  Sun,
  Gauge,
} from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';
import type { ForecastSlot } from '@/types';
import {
  formatTemperature,
  formatHumidity,
  formatWindSpeed,
  formatWindDirection,
  formatVisibility,
} from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface ForecastGridProps {
  slot: ForecastSlot;
}

interface GridItem {
  key: string;
  label: string;
  icon: React.ElementType;
  iconColor: string;
  value: string;
  valueColor: string;
  description?: string;
  progress?: {
    value: number;
    max: number;
    color: string;
  };
  extra?: {
    label: string;
    value: string;
  };
}

function getUVIndex(slot: ForecastSlot): number {
  const seed = slot.temperature * 10 + slot.humidity + slot.cloudCover;
  return 5 + Math.floor(((seed * 9301 + 49297) % 233280) / 233280 * 5);
}

function getAQI(slot: ForecastSlot): number {
  const seed = slot.temperature * 7 + slot.humidity * 3 + slot.windSpeed * 11 + slot.visibility * 0.01;
  return 30 + Math.floor(((seed * 9301 + 49297) % 233280) / 233280 * 91);
}

function getUVLevel(uv: number): { label: string; color: string } {
  if (uv <= 2) return { label: '低', color: 'text-success-400' };
  if (uv <= 5) return { label: '中', color: 'text-yellow-400' };
  if (uv <= 7) return { label: '高', color: 'text-orange-400' };
  if (uv <= 10) return { label: '很高', color: 'text-alert-400' };
  return { label: '极高', color: 'text-purple-400' };
}

function getAQILevel(aqi: number): { label: string; color: string } {
  if (aqi <= 50) return { label: '优', color: 'text-success-400' };
  if (aqi <= 100) return { label: '良', color: 'text-yellow-400' };
  if (aqi <= 150) return { label: '轻度污染', color: 'text-orange-400' };
  return { label: '中度污染', color: 'text-alert-400' };
}

export default function ForecastGrid({ slot }: ForecastGridProps) {
  const uvIndex = useMemo(() => getUVIndex(slot), [slot]);
  const aqi = useMemo(() => getAQI(slot), [slot]);
  const uvLevel = getUVLevel(uvIndex);
  const aqiLevel = getAQILevel(aqi);
  const feelsLike = slot.temperature + (slot.humidity > 70 ? 2 : slot.humidity < 30 ? -2 : 0);

  const items: GridItem[] = [
    {
      key: 'temperature',
      label: '温度',
      icon: Thermometer,
      iconColor: 'text-red-400',
      value: formatTemperature(slot.temperature),
      valueColor: 'text-red-300',
      extra: {
        label: '体感',
        value: formatTemperature(feelsLike),
      },
    },
    {
      key: 'humidity',
      label: '湿度',
      icon: Droplets,
      iconColor: 'text-cyan-400',
      value: formatHumidity(slot.humidity),
      valueColor: 'text-cyan-300',
      description: slot.humidity > 80 ? '潮湿' : slot.humidity < 40 ? '干燥' : '舒适',
    },
    {
      key: 'precipitation',
      label: '降水概率',
      icon: CloudRain,
      iconColor: 'text-blue-400',
      value: `${slot.precipitation}%`,
      valueColor: 'text-blue-300',
      description: slot.precipitation > 50 ? '大概率降雨' : slot.precipitation > 20 ? '可能降雨' : '降雨概率低',
      progress: {
        value: slot.precipitation,
        max: 100,
        color: 'from-blue-500 to-cyan-500',
      },
    },
    {
      key: 'wind',
      label: '风速 / 风向',
      icon: Wind,
      iconColor: 'text-cyber-400',
      value: formatWindSpeed(slot.windSpeed),
      valueColor: 'text-cyber-300',
      extra: {
        label: '风向',
        value: formatWindDirection(slot.windDirection).split(' ')[0],
      },
    },
    {
      key: 'visibility',
      label: '能见度',
      icon: Eye,
      iconColor: 'text-gray-400',
      value: formatVisibility(slot.visibility),
      valueColor: 'text-gray-300',
      description: slot.visibility < 1000 ? '低能见度' : slot.visibility < 5000 ? '一般' : '良好',
    },
    {
      key: 'cloudCover',
      label: '云量',
      icon: Cloud,
      iconColor: 'text-slate-400',
      value: `${slot.cloudCover}%`,
      valueColor: 'text-slate-300',
      description: slot.cloudCover > 80 ? '阴天' : slot.cloudCover > 30 ? '多云' : '晴朗',
      progress: {
        value: slot.cloudCover,
        max: 100,
        color: 'from-slate-500 to-slate-400',
      },
    },
    {
      key: 'uv',
      label: 'UV指数',
      icon: Sun,
      iconColor: 'text-yellow-400',
      value: String(uvIndex),
      valueColor: uvLevel.color,
      description: uvLevel.label,
    },
    {
      key: 'aqi',
      label: '空气质量',
      icon: Gauge,
      iconColor: aqiLevel.color,
      value: String(aqi),
      valueColor: aqiLevel.color,
      description: aqiLevel.label,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {items.map((item) => (
        <GlassCard key={item.key} className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <item.icon className={cn('w-4 h-4', item.iconColor)} />
              <span className="text-xs text-white/60">{item.label}</span>
            </div>
            {item.extra && (
              <div className="text-right">
                <div className="text-[10px] text-white/40">{item.extra.label}</div>
                <div className={cn('text-xs font-orbitron font-medium', item.valueColor)}>
                  {item.extra.value}
                </div>
              </div>
            )}
          </div>
          <div className={cn('text-xl font-orbitron font-bold mb-2', item.valueColor)}>
            {item.value}
          </div>
          {item.description && (
            <div className="text-[11px] text-white/50 mb-2">{item.description}</div>
          )}
          {item.progress && (
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-auto">
              <div
                className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-500', item.progress.color)}
                style={{ width: `${(item.progress.value / item.progress.max) * 100}%` }}
              />
            </div>
          )}
        </GlassCard>
      ))}
    </div>
  );
}
