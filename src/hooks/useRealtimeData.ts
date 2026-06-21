import { useRef } from 'react';
import { useAppStore } from '@/store';
import { useInterval } from './useInterval';

let globalInitialized = false;

export function useRealtimeData(enabled = true) {
  const refreshRealtimeData = useAppStore((s) => s.refreshRealtimeData);
  const localInit = useRef(false);

  useInterval(() => {
    if (!globalInitialized) {
      globalInitialized = true;
      localInit.current = true;
    }
    if (localInit.current) {
      refreshRealtimeData();
    }
  }, enabled ? 5000 : null);
}
