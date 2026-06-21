import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppStore } from '@/store';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import GlassCard from '@/components/common/GlassCard';
import GlowButton from '@/components/common/GlowButton';
import { USER_ROLE_LABELS } from '@/utils/constants';
import { STATIONS_DATA, generateDailyReport } from '@/utils/mock';
import type { UserRole, DailyReport } from '@/types';
import {
  FileSpreadsheet,
  CalendarDays,
  CalendarRange,
  Download,
  Lock,
  ShieldAlert,
  CheckCircle2,
  Loader2,
  Thermometer,
  Droplets,
  Wind,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactECharts from 'echarts-for-react';

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

type DateMode = 'single' | 'range';

const ALLOWED_ROLES: UserRole[] = ['forecaster', 'director'];

export default function ExportPage() {
  const { user, loading } = useAuthGuard(ALLOWED_ROLES);
  const { stations, hourlyData, activeAlerts, forecast, exportDailyReport } = useAppStore();

  const today = useMemo(() => formatDate(new Date()), []);
  const yesterday = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return formatDate(d);
  }, []);

  const [dateMode, setDateMode] = useState<DateMode>('single');
  const [singleDate, setSingleDate] = useState(yesterday);
  const [rangeStart, setRangeStart] = useState(yesterday);
  const [rangeEnd, setRangeEnd] = useState(today);
  const [activeSheet, setActiveSheet] = useState<'extremes' | 'alerts' | 'accuracy'>('extremes');
  const [exportProgress, setExportProgress] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const progressTimerRef = useRef<number | null>(null);

  const effectiveDate = dateMode === 'single' ? singleDate : rangeEnd;

  const report = useMemo<DailyReport | null>(() => {
    if (!effectiveDate) return null;
    return generateDailyReport(effectiveDate, stations, hourlyData, activeAlerts, forecast);
  }, [effectiveDate, stations, hourlyData, activeAlerts, forecast]);

  const accuracyOption = useMemo(() => {
    if (!report) return {} as any;
    const stations = STATIONS_DATA;
    const dateSeed = report.date.split('-').reduce((a, b) => a + parseInt(b) * 37, 0);
    const data = stations.map((s, idx) => ({
      name: s.name,
      value: 78 + ((dateSeed + idx * 17) % 21),
    }));
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(10, 22, 40, 0.95)',
        borderColor: 'rgba(0, 212, 255, 0.3)',
        textStyle: { color: 'rgba(255,255,255,0.9)', fontSize: 12 },
        formatter: (params: any[]) => {
          const p = params[0];
          return `${p.name}<br/><span style="color:#00D4FF">准确率：${p.value}%</span>`;
        },
      },
      grid: { left: 50, right: 30, top: 40, bottom: 60 },
      xAxis: {
        type: 'category',
        data: stations.map((s) => s.name),
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
        axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, rotate: 30 },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        min: 80,
        max: 100,
        axisLine: { show: false },
        axisLabel: {
          color: 'rgba(255,255,255,0.5)',
          fontSize: 11,
          formatter: '{value}%',
        },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
      },
      series: [
        {
          name: '预报准确率',
          type: 'bar',
          data: data.map((d) => d.value),
          barWidth: '45%',
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(0, 212, 255, 0.8)' },
                { offset: 1, color: 'rgba(0, 212, 255, 0.2)' },
              ],
            },
            borderRadius: [4, 4, 0, 0],
            borderColor: 'rgba(0, 212, 255, 0.5)',
            borderWidth: 1,
          },
          label: {
            show: true,
            position: 'top',
            color: '#00D4FF',
            fontSize: 11,
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: 'bold',
            formatter: '{c}%',
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 20,
              shadowColor: 'rgba(0, 212, 255, 0.6)',
            },
          },
        },
      ],
    };
  }, [report]);

  const clearProgressTimer = () => {
    if (progressTimerRef.current) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  useEffect(() => () => clearProgressTimer(), []);

  const triggerDownload = (blob: Blob, date: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `气象日报_${date}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (exporting || !report) return;
    setExporting(true);
    setExportSuccess(false);
    setExportProgress(0);

    progressTimerRef.current = window.setInterval(() => {
      setExportProgress((prev) => {
        const next = prev + 4 + Math.random() * 6;
        return Math.min(next, 92);
      });
    }, 120);

    await new Promise((r) => setTimeout(r, 900));
    const blob = exportDailyReport(report.date);
    triggerDownload(blob, report.date);

    clearProgressTimer();
    setExportProgress(100);
    setExportSuccess(true);

    setTimeout(() => {
      setExporting(false);
      setTimeout(() => setExportSuccess(false), 1500);
    }, 600);
  };

  const inputClass =
    'px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm focus:outline-none focus:border-cyber-500/50 focus:ring-1 focus:ring-cyber-500/30 transition-all';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-cyber-400 font-orbitron">加载中...</div>
      </div>
    );
  }

  if (user && !ALLOWED_ROLES.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <GlassCard className="max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-alert-500/10 border border-alert-500/30 flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-alert-400" />
          </div>
          <h2 className="text-2xl font-bold text-white/90 mb-3 flex items-center justify-center gap-2">
            <Lock className="w-6 h-6 text-alert-400" />
            403 无权限访问
          </h2>
          <p className="text-white/50 text-sm mb-6 leading-relaxed">
            您当前的角色是「{USER_ROLE_LABELS[user.role]}」，
            日报导出页面仅允许「预报员」或「局长」访问。
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-orbitron text-white/95 mb-2 flex items-center gap-3">
            <FileSpreadsheet className="w-8 h-8 text-cyber-400" />
            气象日报导出
          </h1>
          <p className="text-white/50 text-sm">生成并导出包含极值、预警、准确率统计的每日气象报告</p>
        </div>

        <GlassCard className="p-5 mb-6">
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex rounded-lg border border-white/10 overflow-hidden bg-white/5">
              <button
                onClick={() => setDateMode('single')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all',
                  dateMode === 'single'
                    ? 'bg-cyber-500/20 text-cyber-300 border-r border-white/10'
                    : 'text-white/50 hover:text-white/80 border-r border-white/10',
                )}
              >
                <CalendarDays className="w-4 h-4" />
                单日
              </button>
              <button
                onClick={() => setDateMode('range')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all',
                  dateMode === 'range'
                    ? 'bg-cyber-500/20 text-cyber-300'
                    : 'text-white/50 hover:text-white/80',
                )}
              >
                <CalendarRange className="w-4 h-4" />
                日期范围
              </button>
            </div>

            {dateMode === 'single' ? (
              <input
                type="date"
                value={singleDate}
                onChange={(e) => setSingleDate(e.target.value)}
                max={today}
                className={cn(inputClass, 'w-auto')}
              />
            ) : (
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={rangeStart}
                  onChange={(e) => setRangeStart(e.target.value)}
                  max={rangeEnd}
                  className={cn(inputClass, 'w-auto')}
                />
                <span className="text-white/30">至</span>
                <input
                  type="date"
                  value={rangeEnd}
                  onChange={(e) => setRangeEnd(e.target.value)}
                  min={rangeStart}
                  max={today}
                  className={cn(inputClass, 'w-auto')}
                />
              </div>
            )}

            <div className="ml-auto">
              <GlowButton
                variant="primary"
                size="lg"
                onClick={handleExport}
                disabled={exporting || !report}
                className={cn(
                  exporting && 'relative overflow-hidden',
                  exportSuccess && '!bg-success-500/20 !border-success-500/50 !text-success-400',
                )}
              >
                {exporting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    导出中 {exportProgress}%
                  </>
                ) : exportSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    导出成功！
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    导出 Excel
                  </>
                )}
              </GlowButton>
            </div>
          </div>

          {exporting && (
            <div className="mt-5 pt-4 border-t border-white/5">
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyber-500 via-cyber-400 to-success-400 transition-all duration-300 ease-out"
                  style={{
                    width: `${exportProgress}%`,
                    boxShadow: '0 0 15px rgba(0, 212, 255, 0.6)',
                  }}
                />
              </div>
            </div>
          )}
        </GlassCard>

        {report && (
          <GlassCard className="overflow-hidden">
            <div className="flex border-b border-white/10 bg-white/[0.02]">
              {(
                [
                  { key: 'extremes', label: '各站极值表', icon: Thermometer },
                  { key: 'alerts', label: '预警明细表', icon: AlertTriangle },
                  { key: 'accuracy', label: '预报准确率', icon: CheckCircle2 },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeSheet === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveSheet(tab.key)}
                    className={cn(
                      'flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px',
                      isActive
                        ? 'text-cyber-300 border-cyber-400 bg-cyber-500/5'
                        : 'text-white/50 hover:text-white/80 border-transparent hover:border-white/10',
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
              <div className="ml-auto flex items-center gap-2 px-5 py-3 text-xs text-white/40">
                <CalendarDays className="w-3.5 h-3.5" />
                报告日期：<span className="text-white/70 font-orbitron">{report.date}</span>
              </div>
            </div>

            <div className="p-5">
              {activeSheet === 'extremes' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-white/50">
                        <th className="text-left py-3 px-3 font-medium" rowSpan={2}>站点</th>
                        <th className="text-center py-2 px-3 font-medium text-orange-400 border-l border-white/10" colSpan={2}>
                          <div className="flex items-center justify-center gap-1"><Thermometer className="w-3.5 h-3.5" />温度 (°C)</div>
                        </th>
                        <th className="text-center py-2 px-3 font-medium text-cyan-400 border-l border-white/10" colSpan={2}>
                          <div className="flex items-center justify-center gap-1"><Droplets className="w-3.5 h-3.5" />湿度 (%)</div>
                        </th>
                        <th className="text-center py-2 px-3 font-medium text-purple-400 border-l border-white/10">
                          <div className="flex items-center justify-center gap-1"><Wind className="w-3.5 h-3.5" />最大风速</div>
                        </th>
                        <th className="text-center py-2 px-3 font-medium text-success-400 border-l border-white/10">
                          <div className="flex items-center justify-center gap-1"><Eye className="w-3.5 h-3.5" />最低能见度</div>
                        </th>
                      </tr>
                      <tr className="border-b border-white/10 text-xs text-white/40">
                        <th className="text-center py-2 px-3 font-normal border-l border-white/10">最高</th>
                        <th className="text-center py-2 px-3 font-normal">最低</th>
                        <th className="text-center py-2 px-3 font-normal border-l border-white/10">最高</th>
                        <th className="text-center py-2 px-3 font-normal">最低</th>
                        <th className="text-center py-2 px-3 font-normal border-l border-white/10">(m/s)</th>
                        <th className="text-center py-2 px-3 font-normal border-l border-white/10">(m)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.stations.map((s, idx) => (
                        <tr
                          key={s.stationId}
                          className={cn(
                            'border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors',
                            idx % 2 === 0 && 'bg-white/[0.015]',
                          )}
                        >
                          <td className="py-2.5 px-3 text-white/80 font-medium">{s.stationName}</td>
                          <td className="py-2.5 px-3 text-center font-orbitron text-orange-400 border-l border-white/5">{s.maxTemp}</td>
                          <td className="py-2.5 px-3 text-center font-orbitron text-blue-400">{s.minTemp}</td>
                          <td className="py-2.5 px-3 text-center font-orbitron text-cyan-400 border-l border-white/5">{s.maxHumidity}%</td>
                          <td className="py-2.5 px-3 text-center font-orbitron text-cyan-300">{s.minHumidity}%</td>
                          <td className="py-2.5 px-3 text-center font-orbitron text-purple-400 border-l border-white/5">{s.maxWind.toFixed(1)}</td>
                          <td className="py-2.5 px-3 text-center font-orbitron text-success-400 border-l border-white/5">{s.minVisibility}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeSheet === 'alerts' && (
                <div>
                  {report.alertDetails.length === 0 ? (
                    <div className="py-16 text-center">
                      <AlertTriangle className="w-12 h-12 mx-auto text-white/15 mb-3" />
                      <p className="text-white/40">当日无预警记录</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/10 text-white/50">
                            <th className="text-left py-3 px-3 font-medium">时间</th>
                            <th className="text-left py-3 px-3 font-medium">站点</th>
                            <th className="text-left py-3 px-3 font-medium">类型</th>
                            <th className="text-left py-3 px-3 font-medium">级别</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.alertDetails.map((a, idx) => (
                            <tr
                              key={idx}
                              className={cn(
                                'border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors',
                                idx % 2 === 0 && 'bg-white/[0.015]',
                              )}
                            >
                              <td className="py-2.5 px-3 font-orbitron text-white/70 text-xs">{a.time}</td>
                              <td className="py-2.5 px-3 text-white/80">{a.station}</td>
                              <td className="py-2.5 px-3">
                                <span className="inline-block px-2 py-0.5 rounded text-xs bg-radar-500/10 text-radar-400 border border-radar-500/20">
                                  {a.type}
                                </span>
                              </td>
                              <td className="py-2.5 px-3">
                                <span
                                  className={cn(
                                    'inline-block px-2 py-0.5 rounded text-xs',
                                    a.level === '危险' || a.level === 'danger'
                                      ? 'bg-alert-500/15 text-alert-400 border border-alert-500/20'
                                      : 'bg-radar-500/10 text-radar-400 border border-radar-500/20',
                                  )}
                                >
                                  {a.level}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeSheet === 'accuracy' && (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-white/50">各站点预报准确率统计（模拟数据）</p>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success-500/10 border border-success-500/20">
                      <CheckCircle2 className="w-4 h-4 text-success-400" />
                      <span className="text-sm font-orbitron text-success-400 font-bold">
                        平均 {report.forecastAccuracy.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <ReactECharts
                    option={accuracyOption}
                    style={{ height: '360px', width: '100%' }}
                    opts={{ renderer: 'canvas' }}
                  />
                </div>
              )}
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
