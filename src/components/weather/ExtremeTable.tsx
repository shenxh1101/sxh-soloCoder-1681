import GlassCard from '@/components/common/GlassCard';
import type { HistoryExtreme } from '@/types';
import { WEATHER_TYPES } from '@/utils/constants';
import { formatTemperature, formatHumidity, formatPressure, formatWindSpeed, formatVisibility } from '@/utils/formatters';

interface ExtremeTableProps {
  extremes: HistoryExtreme[];
  stationName: string;
}

const formatterMap: Record<string, (v: number) => string> = {
  temperature: formatTemperature,
  humidity: formatHumidity,
  pressure: formatPressure,
  windSpeed: formatWindSpeed,
  visibility: formatVisibility,
};

export default function ExtremeTable({ extremes, stationName }: ExtremeTableProps) {
  return (
    <GlassCard className="p-4 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-orbitron text-radar-400">{stationName}</h3>
        <p className="text-xs text-white/50 mt-1">历史极值记录</p>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-2 text-xs font-medium text-white/60 w-1/5">要素</th>
              <th className="text-left py-3 px-2 text-xs font-medium text-alert-400 w-2/5">历史最高</th>
              <th className="text-left py-3 px-2 text-xs font-medium text-cyan-400 w-2/5">历史最低</th>
            </tr>
          </thead>
          <tbody>
            {extremes.map((ex) => {
              const typeInfo = WEATHER_TYPES[ex.type];
              const formatter = formatterMap[ex.type] || String;
              return (
                <tr key={ex.type} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-2">
                    <span className="text-white/90 font-medium">{typeInfo?.label || ex.type}</span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex flex-col">
                      <span className="text-alert-400 font-orbitron font-semibold">{formatter(ex.max)}</span>
                      <span className="text-xs text-white/40 mt-0.5">{ex.maxDate}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex flex-col">
                      <span className="text-cyan-400 font-orbitron font-semibold">{formatter(ex.min)}</span>
                      <span className="text-xs text-white/40 mt-0.5">{ex.minDate}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
