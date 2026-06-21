import ReactECharts from 'echarts-for-react';
import GlassCard from '@/components/common/GlassCard';
import ForecastTimeline from '@/components/forecast/ForecastTimeline';
import ForecastGrid from '@/components/forecast/ForecastGrid';
import SceneRoot from '@/components/3d/Scene';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAppStore } from '@/store';
import { formatTemperature, formatDateTime } from '@/utils/formatters';
import { CHART_COLORS } from '@/utils/constants';

export default function ForecastPage() {
  const { loading } = useAuthGuard();
  const { forecast, forecastTimeIndex } = useAppStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-cyber-300 font-orbitron">加载中...</div>
      </div>
    );
  }

  const currentSlot = forecast?.slots[forecastTimeIndex];
  const chartSlots = forecast?.slots.slice(0, 12) || [];

  const chartOption = {
    grid: {
      left: 50,
      right: 50,
      top: 40,
      bottom: 30,
    },
    backgroundColor: 'transparent',
    legend: {
      data: ['温度', '降水概率'],
      textStyle: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
      top: 0,
      right: 0,
      icon: 'roundRect',
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10, 22, 40, 0.95)',
      borderColor: 'rgba(0,212,255,0.5)',
      borderWidth: 1,
      textStyle: {
        color: '#fff',
        fontSize: 12,
      },
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999',
        },
      },
      formatter: (params: any) => {
        if (!params || params.length === 0) return '';
        let html = `<div style="padding: 4px 8px;"><div style="color: rgba(255,255,255,0.6); font-size: 11px; margin-bottom: 8px;">${params[0].axisValue}</div>`;
        params.forEach((p: any) => {
          const val = p.seriesName === '温度' ? formatTemperature(p.value) : `${p.value}%`;
          html += `
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${p.color};"></span>
              <span style="font-weight: 600; font-family: Orbitron, sans-serif; color: ${p.color};">${p.seriesName}：${val}</span>
            </div>
          `;
        });
        html += '</div>';
        return html;
      },
    },
    xAxis: {
      type: 'category',
      data: chartSlots.map((s) => s.time),
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
      axisTick: { show: false },
    },
    yAxis: [
      {
        type: 'value',
        name: '温度(°C)',
        nameTextStyle: { color: 'rgba(255,255,255,0.5)', fontSize: 10 },
        axisLine: { show: false },
        axisLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
        scale: true,
      },
      {
        type: 'value',
        name: '降水概率(%)',
        nameTextStyle: { color: 'rgba(255,255,255,0.5)', fontSize: 10 },
        axisLine: { show: false },
        axisLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, formatter: '{value}%' },
        splitLine: { show: false },
        min: 0,
        max: 100,
      },
    ],
    series: [
      {
        name: '温度',
        type: 'line',
        data: chartSlots.map((s) => s.temperature),
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          color: CHART_COLORS.temperature,
          width: 2,
          shadowColor: CHART_COLORS.temperature,
          shadowBlur: 8,
        },
        itemStyle: {
          color: CHART_COLORS.temperature,
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
              { offset: 0, color: `${CHART_COLORS.temperature}40` },
              { offset: 1, color: `${CHART_COLORS.temperature}00` },
            ],
          },
        },
      },
      {
        name: '降水概率',
        type: 'line',
        yAxisIndex: 1,
        data: chartSlots.map((s) => s.precipitation),
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          color: CHART_COLORS.precipitation,
          width: 2,
          shadowColor: CHART_COLORS.precipitation,
          shadowBlur: 8,
        },
        itemStyle: {
          color: CHART_COLORS.precipitation,
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
              { offset: 0, color: `${CHART_COLORS.precipitation}40` },
              { offset: 1, color: `${CHART_COLORS.precipitation}00` },
            ],
          },
        },
      },
    ],
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-orbitron font-bold text-white">预报中心</h1>
          <p className="text-sm text-white/50 mt-1">
            {forecast && `预报生成时间：${formatDateTime(forecast.generatedAt)}`}
          </p>
        </div>
      </div>

      <ForecastTimeline />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <GlassCard className="p-4 h-[500px] overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-orbitron text-cyber-300">3D 场景预览</h3>
            </div>
            <div className="w-full h-[calc(100%-36px)] rounded-lg overflow-hidden bg-gradient-to-b from-space-800/50 to-space-900/50">
              <SceneRoot />
            </div>
          </GlassCard>
        </div>

        <div className="col-span-4">
          <GlassCard className="p-4 h-[500px] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-orbitron text-radar-400">时段详情</h3>
              {currentSlot && (
                <span className="text-xs text-white/50 font-orbitron">
                  {currentSlot.time}
                </span>
              )}
            </div>
            {currentSlot ? (
              <div className="space-y-3">
                <ForecastGrid slot={currentSlot} />
              </div>
            ) : (
              <div className="text-center text-white/50 py-8">
                请选择预报时段
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      <GlassCard className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-orbitron text-cyber-300">温度与降水趋势</h3>
          <span className="text-xs text-white/50">未来12个时段</span>
        </div>
        <div className="h-72 w-full">
          <ReactECharts
            option={chartOption}
            style={{ height: '100%', width: '100%' }}
            opts={{ renderer: 'canvas' }}
          />
        </div>
      </GlassCard>
    </div>
  );
}
