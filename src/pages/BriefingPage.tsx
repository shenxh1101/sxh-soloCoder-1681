import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '@/store';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import GlassCard from '@/components/common/GlassCard';
import BriefingCard from '@/components/briefing/BriefingCard';
import { Cloud, CalendarDays, Timer, Inbox, RefreshCw } from 'lucide-react';
import { REFRESH_INTERVALS } from '@/utils/constants';
import { useInterval } from '@/hooks/useInterval';

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function BriefingPage() {
  const { loading } = useAuthGuard();
  const { briefings, generateBriefing } = useAppStore();

  const today = useMemo(() => formatDate(new Date()), []);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [countdown, setCountdown] = useState(REFRESH_INTERVALS.BRIEFING);

  useInterval(() => {
    setCountdown((prev) => {
      if (prev <= 1000) {
        generateBriefing();
        return REFRESH_INTERVALS.BRIEFING;
      }
      return prev - 1000;
    });
  }, 1000);

  const filteredBriefings = useMemo(() => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return briefings.filter(
      (b) => b.generatedAt >= start.getTime() && b.generatedAt <= end.getTime(),
    );
  }, [briefings, startDate, endDate]);

  const countdownStr = useMemo(() => {
    const totalSeconds = Math.floor(countdown / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [countdown]);

  const handleGenerateNow = () => {
    generateBriefing();
    setCountdown(REFRESH_INTERVALS.BRIEFING);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-cyber-400 font-orbitron">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-orbitron text-white/95 mb-2 flex items-center gap-3">
              <Cloud className="w-8 h-8 text-cyber-400" />
              天气简报
            </h1>
            <p className="text-white/50 text-sm">每15分钟自动生成最新气象简报</p>
          </div>

          <GlassCard className="px-5 py-3 flex items-center gap-4">
            <div className="text-center">
              <p className="text-[10px] text-white/40 mb-1 uppercase tracking-wider">
                下一期倒计时
              </p>
              <p
                className="text-3xl font-bold font-orbitron text-cyber-300"
                style={{
                  textShadow: '0 0 20px rgba(0, 212, 255, 0.6), 0 0 40px rgba(0, 212, 255, 0.3)',
                  letterSpacing: '0.1em',
                }}
              >
                {countdownStr}
              </p>
            </div>
            <button
              onClick={handleGenerateNow}
              className="p-2 rounded-lg bg-cyber-500/20 border border-cyber-500/40 text-cyber-300 hover:bg-cyber-500/30 transition-all"
              title="立即生成"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </GlassCard>
        </div>

        <GlassCard className="p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-cyber-400" />
              <span className="text-sm text-white/60">日期筛选：</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm focus:outline-none focus:border-cyber-500/50 focus:ring-1 focus:ring-cyber-500/30 transition-all"
                />
              </div>
              <span className="text-white/30">至</span>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  max={today}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm focus:outline-none focus:border-cyber-500/50 focus:ring-1 focus:ring-cyber-500/30 transition-all"
                />
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Timer className="w-4 h-4 text-white/40" />
              <span className="text-sm text-white/50">
                共 <span className="text-cyber-400 font-bold font-orbitron">{filteredBriefings.length}</span> 期简报
              </span>
            </div>
          </div>
        </GlassCard>

        {filteredBriefings.length === 0 ? (
          <GlassCard className="py-16 flex flex-col items-center justify-center">
            <Inbox className="w-16 h-16 text-white/20 mb-4" />
            <p className="text-white/40 text-lg mb-1">暂无简报</p>
            <p className="text-white/20 text-sm">所选日期范围内没有生成的简报</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBriefings.map((briefing) => (
              <BriefingCard key={briefing.id} briefing={briefing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
