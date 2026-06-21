import { useEffect } from 'react';
import { useAppStore } from '@/store';
import { useInterval } from './useInterval';
import { generateForecast3H } from '@/utils/mock';

export function useScheduler() {
  const generateBriefing = useAppStore((s) => s.generateBriefing);
  const set = useAppStore.setState;

  useEffect(() => {
    generateBriefing();
  }, []);

  useInterval(() => {
    generateBriefing();
  }, 15 * 60 * 1000);

  useInterval(() => {
    const forecast = generateForecast3H();
    set({ forecast, forecastTimeIndex: 0 });
  }, 30 * 60 * 1000);
}
