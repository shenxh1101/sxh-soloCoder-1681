import ReactECharts from 'echarts-for-react';
import type { HourlyData } from '@/types';
import {
  formatTemperature,
  formatHumidity,
  formatPressure,
  formatWindSpeed,
  formatVisibility,
} from '@/utils/formatters';
import { CHART_COLORS, WEATHER_TYPES } from '@/utils/constants';

type TrendType = Exclude<keyof HourlyData, 'time'>;

interface TrendChartProps {
  data: HourlyData[];
  type: TrendType;
}

const formatMap: Record<TrendType, (v: number) => string> = {
  temperature: formatTemperature,
  humidity: formatHumidity,
  pressure: formatPressure,
  windSpeed: formatWindSpeed,
  windDirection: (v) => `${v}°`,
  visibility: formatVisibility,
};

export default function TrendChart({ data, type }: TrendChartProps) {
  const color = CHART_COLORS[type] || '#00D4FF';
  const label = WEATHER_TYPES[type]?.label || String(type);
  const formatter = formatMap[type] || String;

  const option = {
    grid: {
      left: 0,
      right: 0,
      top: 10,
      bottom: 0,
      containLabel: false,
    },
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10, 22, 40, 0.95)',
      borderColor: color,
      borderWidth: 1,
      textStyle: {
        color: '#fff',
        fontSize: 12,
      },
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: color,
          opacity: 0.5,
        },
      },
      formatter: (params: any) => {
        if (!params || params.length === 0) return '';
        const p = params[0];
        return `
          <div style="padding: 4px 8px;">
            <div style="color: rgba(255,255,255,0.6); font-size: 11px; margin-bottom: 4px;">${p.axisValue}</div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${color};"></span>
              <span style="color: ${color}; font-weight: 600; font-family: Orbitron, sans-serif;">${label}：${formatter(p.value)}</span>
            </div>
          </div>
        `;
      },
    },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.time),
      show: false,
    },
    yAxis: {
      type: 'value',
      show: false,
      scale: true,
    },
    series: [
      {
        name: label,
        type: 'line',
        data: data.map((d) => d[type] as number),
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          color: color,
          width: 2,
          shadowColor: color,
          shadowBlur: 10,
          shadowOffsetY: 0,
        },
        itemStyle: {
          color: color,
          borderWidth: 2,
          borderColor: '#0A1628',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: `${color}50` },
              { offset: 0.5, color: `${color}20` },
              { offset: 1, color: `${color}00` },
            ],
          },
        },
      },
    ],
  };

  return (
    <ReactECharts
      option={option}
      style={{ height: '100%', width: '100%' }}
      opts={{ renderer: 'canvas' }}
    />
  );
}
