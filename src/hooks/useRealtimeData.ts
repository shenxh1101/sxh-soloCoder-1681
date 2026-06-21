import { useAppStore } from '@/store';
import { useInterval } from './useInterval';

export function useRealtimeData(enabled = true) {
  const refreshRealtimeData = useAppStore((s) => s.refreshRealtimeData);
  useInterval(
    () => refreshRealtimeData(),
    enabled ? 5000 : null,
  );
}
