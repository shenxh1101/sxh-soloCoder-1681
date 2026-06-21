import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store';
import { useInterval } from './useInterval';
import { generateForecast3H } from '@/utils/mock';
import { REFRESH_INTERVALS } from '@/utils/constants';

export function useScheduler() {
  const generateBriefing = useAppStore((s) => s.generateBriefing);
  const set = useAppStore.setState;
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    generateBriefing();
  }, [generateBriefing]);

  useInterval(() => {
    generateBriefing();
  }, REFRESH_INTERVALS.BRIEFING);

  useInterval(() => {
    const forecast = generateForecast3H();
    set({ forecast, forecastTimeIndex: 0 });
  }, REFRESH_INTERVALS.FORECAST);
}
