import { useRef } from 'react';
import { CloudRain, Wind, Thermometer } from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';
import { useAppStore } from '@/store';
import { formatTemperature, formatWindSpeed } from '@/utils/formatters';
import { cn } from '@/lib/utils';

export default function ForecastTimeline() {
  const { forecast, forecastTimeIndex, setForecastTimeIndex } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!forecast || forecast.slots.length === 0) {
    return (
      <GlassCard className="p-6 text-center text-white/50">
        暂无预报数据
      </GlassCard>
    );
  }

  const slots = forecast.slots.slice(0, 12);
  const accuracy = forecast.accuracy;

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-orbitron text-cyber-300">未来3小时预报</h3>
          <p className="text-xs text-white/50 mt-1">每15分钟一个时段</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/50 mb-1">预报准确率</div>
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyber-500 to-success-500 transition-all duration-500"
                style={{ width: `${accuracy}%` }}
              />
            </div>
            <span className="text-sm font-orbitron text-success-400 font-semibold">{accuracy}%</span>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin"
        style={{ scrollbarWidth: 'thin' }}
      >
        {slots.map((slot, idx) => {
          const isSelected = idx === forecastTimeIndex;
          return (
            <button
              key={idx}
              onClick={() => setForecastTimeIndex(idx)}
              className={cn(
                'flex-shrink-0 w-32 p-3 rounded-xl border transition-all duration-300 text-left',
                'bg-glass backdrop-blur-md',
                isSelected
                  ? 'border-cyber-500 shadow-[0_0_20px_rgba(0,212,255,0.35)] scale-105'
                  : 'border-white/10 hover:border-white/20 hover:scale-102'
              )}
            >
              <div className={cn(
                'text-xs font-orbitron mb-2',
                isSelected ? 'text-cyber-300' : 'text-white/70'
              )}>
                {slot.time}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Thermometer className={cn('w-3.5 h-3.5', isSelected ? 'text-red-400' : 'text-red-400/80')} />
                  <span className={cn(
                    'text-sm font-orbitron font-semibold',
                    isSelected ? 'text-red-300' : 'text-white/90'
                  )}>
                    {formatTemperature(slot.temperature)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CloudRain className={cn('w-3.5 h-3.5', isSelected ? 'text-cyan-400' : 'text-cyan-400/80')} />
                  <span className={cn(
                    'text-xs',
                    isSelected ? 'text-cyan-300' : 'text-white/70'
                  )}>
                    {slot.precipitation}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className={cn('w-3.5 h-3.5', isSelected ? 'text-cyber-400' : 'text-cyber-400/80')} />
                  <span className={cn(
                    'text-xs',
                    isSelected ? 'text-cyber-300' : 'text-white/70'
                  )}>
                    {formatWindSpeed(slot.windSpeed)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
}
