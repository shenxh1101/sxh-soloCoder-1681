import { STORAGE_KEYS } from './constants';
import type {
  User,
  OperationLog,
  WeatherBriefing,
  WorkOrder,
  WeatherAlert,
} from '@/types';

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const storage = {
  getUser(): User | null {
    return safeParse<User | null>(localStorage.getItem(STORAGE_KEYS.USER), null);
  },
  setUser(user: User | null) {
    if (user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEYS.USER);
  },
  getToken(): string {
    return localStorage.getItem(STORAGE_KEYS.TOKEN) ?? '';
  },
  setToken(token: string) {
    if (token) localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    else localStorage.removeItem(STORAGE_KEYS.TOKEN);
  },
  getLogs(): OperationLog[] {
    return safeParse<OperationLog[]>(localStorage.getItem(STORAGE_KEYS.LOGS), []);
  },
  setLogs(logs: OperationLog[]) {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  },
  appendLog(log: OperationLog) {
    const logs = this.getLogs();
    logs.unshift(log);
    this.setLogs(logs.slice(0, 500));
  },
  getBriefings(): WeatherBriefing[] {
    return safeParse<WeatherBriefing[]>(localStorage.getItem(STORAGE_KEYS.BRIEFINGS), []);
  },
  setBriefings(briefings: WeatherBriefing[]) {
    localStorage.setItem(STORAGE_KEYS.BRIEFINGS, JSON.stringify(briefings));
  },
  appendBriefing(briefing: WeatherBriefing) {
    const list = this.getBriefings();
    list.unshift(briefing);
    this.setBriefings(list.slice(0, 200));
  },
  getWorkOrders(): WorkOrder[] {
    return safeParse<WorkOrder[]>(localStorage.getItem(STORAGE_KEYS.WORK_ORDERS), []);
  },
  setWorkOrders(orders: WorkOrder[]) {
    localStorage.setItem(STORAGE_KEYS.WORK_ORDERS, JSON.stringify(orders));
  },
  getAlerts(): WeatherAlert[] {
    return safeParse<WeatherAlert[]>(localStorage.getItem(STORAGE_KEYS.ALERTS), []);
  },
  setAlerts(alerts: WeatherAlert[]) {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  },
  clearAuth() {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  },
};
