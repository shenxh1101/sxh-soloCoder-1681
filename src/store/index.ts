import { create } from 'zustand';
import type {
  User,
  UserRole,
  WeatherStation,
  RadarStation,
  RealtimeWeather,
  HourlyData,
  HistoryExtreme,
  Forecast3H,
  WeatherAlert,
  WorkOrder,
  WeatherBriefing,
  OperationLog,
  FormValidationResult,
  ApprovalRecord,
  WorkOrderStatus,
  AlertLevel,
} from '@/types';
import {
  STATIONS_DATA,
  RADAR_STATIONS,
  generateRealtimeWeather,
  generateHourlyData,
  generateExtremeData,
  generateForecast3H,
  createMockUser,
  checkAndGenerateAlert,
  createWorkOrderFromAlert,
  generateOperationLog,
  generateBriefing as genBriefing,
  generateDailyReport,
  genId,
} from '@/utils/mock';
import { storage } from '@/utils/storage';
import { validateWorkOrderSubmission, validateRealtimeAlertData } from '@/utils/validation';
import { APPROVAL_FLOW, USER_ROLE_LABELS } from '@/utils/constants';
import { generateDailyReportExcel } from '@/utils/excel';

export type { UserRole, WorkOrderStatus, AlertLevel };

export interface State {
  user: User | null;
  isAuthenticated: boolean;
  stations: WeatherStation[];
  weatherStations: WeatherStation[];
  realtimeData: Record<string, RealtimeWeather>;
  hourlyData: Record<string, HourlyData[]>;
  extremeData: Record<string, HistoryExtreme[]>;
  radars: RadarStation[];
  forecast: Forecast3H | null;
  forecastTimeIndex: number;
  activeAlerts: WeatherAlert[];
  workOrders: WorkOrder[];
  briefings: WeatherBriefing[];
  operationLogs: OperationLog[];
  selectedStationId: string | null;
  isStationModalOpen: boolean;
  latestAlert: (WeatherAlert & { station?: string; timestamp?: Date | number }) | null;
  alertValidationError: { stationId: string; stationName: string; errors: Record<string, string>; details: string[]; timestamp: number } | null;
}

export interface Actions {
  login: (role: UserRole) => Promise<boolean>;
  logout: () => void;
  refreshRealtimeData: () => void;
  selectStation: (id: string | null) => void;
  checkAndTriggerAlert: (stationId: string, data: RealtimeWeather) => void;
  approveWorkOrder: (orderId: string, opinion: string) => FormValidationResult;
  rejectWorkOrder: (orderId: string, opinion: string) => FormValidationResult;
  generateBriefing: () => void;
  setForecastTimeIndex: (idx: number) => void;
  addLog: (action: string, target: string, detail: string) => void;
  exportDailyReport: (date: string) => Blob;
  clearLatestAlert: () => void;
  clearAlertValidationError: () => void;
  triggerValidationTest: () => void;
}

const initRealtime: Record<string, RealtimeWeather> = {};
const initHourly: Record<string, HourlyData[]> = {};
const initExtreme: Record<string, HistoryExtreme[]> = {};
for (const s of STATIONS_DATA) {
  initRealtime[s.id] = generateRealtimeWeather(s.id);
  initHourly[s.id] = generateHourlyData(s.id);
  initExtreme[s.id] = generateExtremeData(s.id);
}

const savedUser = storage.getUser();
const savedLogs = storage.getLogs();
const savedBriefings = storage.getBriefings();
const savedWorkOrders = storage.getWorkOrders();
const savedAlerts = storage.getAlerts();

function enhanceAlert(alert: WeatherAlert, stations: WeatherStation[]) {
  const st = stations.find((s) => s.id === alert.stationId);
  return {
    ...alert,
    station: st?.name ?? alert.stationId,
    timestamp: new Date(alert.triggeredAt),
  };
}

export const useAppStore = create<State & Actions>((set, get) => ({
  user: savedUser,
  isAuthenticated: !!savedUser,
  stations: STATIONS_DATA,
  weatherStations: STATIONS_DATA,
  realtimeData: initRealtime,
  hourlyData: initHourly,
  extremeData: initExtreme,
  radars: RADAR_STATIONS,
  forecast: generateForecast3H(),
  forecastTimeIndex: 0,
  activeAlerts: savedAlerts,
  workOrders: savedWorkOrders,
  briefings: savedBriefings,
  operationLogs: savedLogs,
  selectedStationId: null,
  isStationModalOpen: false,
  latestAlert: savedAlerts[0] ? enhanceAlert(savedAlerts[0], STATIONS_DATA) : null,
  alertValidationError: null,

  login: async (role: UserRole): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 1800));
    const user = createMockUser(role);
    storage.setUser(user);
    storage.setToken(user.token);
    set({ user, isAuthenticated: true });
    get().addLog('人脸识别登录', '系统', `${USER_ROLE_LABELS[role]} ${user.name} 登录成功`);
    return true;
  },

  logout: () => {
    const { user } = get();
    storage.clearAuth();
    set({ user: null, isAuthenticated: false });
    get().addLog('退出登录', '系统', user ? `${user.name} 退出系统` : '用户已登出');
    window.location.href = '/login';
  },

  refreshRealtimeData: () => {
    const { stations, realtimeData } = get();
    const next: Record<string, RealtimeWeather> = { ...realtimeData };
    for (const s of stations) {
      const prev = next[s.id];
      const cur = generateRealtimeWeather(s.id);
      if (prev) {
        cur.temperature = Number((prev.temperature + (cur.temperature - prev.temperature) * 0.3).toFixed(1));
        cur.humidity = Math.round(prev.humidity + (cur.humidity - prev.humidity) * 0.3);
        cur.pressure = Number((prev.pressure + (cur.pressure - prev.pressure) * 0.3).toFixed(1));
        cur.windSpeed = Number((prev.windSpeed + (cur.windSpeed - prev.windSpeed) * 0.4).toFixed(1));
        cur.visibility = Math.round(prev.visibility + (cur.visibility - prev.visibility) * 0.3);
      }
      next[s.id] = cur;
      get().checkAndTriggerAlert(s.id, cur);
    }
    set({ realtimeData: next });
  },

  selectStation: (id: string | null) => {
    set({ selectedStationId: id, isStationModalOpen: !!id });
  },

  checkAndTriggerAlert: (stationId: string, data: RealtimeWeather) => {
    const { stations, activeAlerts } = get();
    const station = stations.find((s) => s.id === stationId);

    const validation = validateRealtimeAlertData(data, station);
    if (!validation.valid) {
      if (station && Date.now() % 23 < 1) {
        set({
          alertValidationError: {
            stationId,
            stationName: station.name,
            errors: validation.errors,
            details: validation.details ?? [],
            timestamp: Date.now(),
          },
        });
        get().addLog('预警校验失败', station.name, Object.values(validation.errors).join('；'));
      }
      return;
    }

    if (!station) return;
    const alert = checkAndGenerateAlert(data, station);
    if (!alert) return;
    const recentAlert = activeAlerts.find(
      (a) => a.stationId === stationId && a.type === alert.type && Date.now() - a.triggeredAt < 60000,
    );
    if (recentAlert) return;
    const newAlerts = [alert, ...activeAlerts];
    const order = createWorkOrderFromAlert(alert, station);
    const newOrders = [order, ...get().workOrders];
    storage.setAlerts(newAlerts.slice(0, 100));
    storage.setWorkOrders(newOrders);
    set({
      activeAlerts: newAlerts,
      workOrders: newOrders,
      latestAlert: enhanceAlert(alert, stations),
      alertValidationError: null,
    });
    get().addLog('预警触发', station.name, alert.message);
  },

  approveWorkOrder: (orderId: string, opinion: string): FormValidationResult => {
    const validation = validateWorkOrderSubmission({ opinion });
    if (!validation.valid) return validation;
    const { user, workOrders, stations } = get();
    if (!user) return { valid: false, errors: { user: '未登录' } };
    const idx = workOrders.findIndex((o) => o.id === orderId);
    if (idx < 0) return { valid: false, errors: { order: '工单不存在' } };
    const order = workOrders[idx];
    const flow = APPROVAL_FLOW[user.role];
    if (order.currentStep !== flow.step) {
      return { valid: false, errors: { step: `当前非${USER_ROLE_LABELS[user.role]}审核环节` } };
    }
    const approval: ApprovalRecord = {
      id: genId(),
      approverId: user.id,
      approverName: user.name,
      approverRole: user.role,
      action: 'approve',
      opinion,
      timestamp: Date.now(),
    };
    const nextOrder: WorkOrder = {
      ...order,
      approvals: [...order.approvals, approval],
      status: flow.next,
      currentStep: flow.step + 1,
      closedAt: flow.next === 'approved' ? Date.now() : undefined,
    };
    const newOrders = [...workOrders];
    newOrders[idx] = nextOrder;
    storage.setWorkOrders(newOrders);
    set({ workOrders: newOrders });
    get().addLog('审批通过', order.title, `${user.name}：${opinion}`);
    return { valid: true, errors: {} };
  },

  rejectWorkOrder: (orderId: string, opinion: string): FormValidationResult => {
    const validation = validateWorkOrderSubmission({ opinion });
    if (!validation.valid) return validation;
    const { user, workOrders } = get();
    if (!user) return { valid: false, errors: { user: '未登录' } };
    const idx = workOrders.findIndex((o) => o.id === orderId);
    if (idx < 0) return { valid: false, errors: { order: '工单不存在' } };
    const order = workOrders[idx];
    const approval: ApprovalRecord = {
      id: genId(),
      approverId: user.id,
      approverName: user.name,
      approverRole: user.role,
      action: 'reject',
      opinion,
      timestamp: Date.now(),
    };
    const nextOrder: WorkOrder = {
      ...order,
      approvals: [...order.approvals, approval],
      status: 'rejected',
      closedAt: Date.now(),
    };
    const newOrders = [...workOrders];
    newOrders[idx] = nextOrder;
    storage.setWorkOrders(newOrders);
    set({ workOrders: newOrders });
    get().addLog('退回工单', order.title, `${user.name}：${opinion}`);
    return { valid: true, errors: {} };
  },

  generateBriefing: () => {
    const { stations, realtimeData, activeAlerts, briefings } = get();
    const b = genBriefing(stations, realtimeData, activeAlerts);
    const slotMs = 15 * 60 * 1000;
    const bSlot = Math.floor(b.generatedAt / slotMs);
    const existing = briefings.find(
      (x) => Math.floor(x.generatedAt / slotMs) === bSlot && x.period === b.period,
    );
    if (existing) return;
    const existingStorage = storage.getBriefings().find(
      (x) => Math.floor(x.generatedAt / slotMs) === bSlot && x.period === b.period,
    );
    if (existingStorage) {
      set({ briefings: storage.getBriefings().slice(0, 200) });
      return;
    }
    const next = [b, ...briefings];
    storage.appendBriefing(b);
    set({ briefings: next });
    get().addLog('生成简报', b.period, b.summary);
  },

  setForecastTimeIndex: (idx: number) => {
    const { forecast } = get();
    if (!forecast) return;
    const safeIdx = Math.max(0, Math.min(forecast.slots.length - 1, idx));
    set({ forecastTimeIndex: safeIdx });
  },

  addLog: (action: string, target: string, detail: string) => {
    const { user, operationLogs } = get();
    const log = generateOperationLog(user, action, target, detail);
    storage.appendLog(log);
    set({ operationLogs: [log, ...operationLogs].slice(0, 500) });
  },

  exportDailyReport: (date: string): Blob => {
    const { stations, hourlyData, activeAlerts, forecast } = get();
    const report = generateDailyReport(date, stations, hourlyData, activeAlerts, forecast);
    get().addLog('导出日报', date, `共 ${report.stations.length} 个站点，${report.alertCount} 条预警`);
    return generateDailyReportExcel(report);
  },

  clearLatestAlert: () => {
    set({ latestAlert: null });
  },

  clearAlertValidationError: () => {
    set({ alertValidationError: null });
  },

  triggerValidationTest: () => {
    const { stations } = get();
    const station = stations[0];
    const badData = {
      temperature: NaN,
      humidity: 999,
      pressure: 'hello' as unknown as number,
      windSpeed: -15,
      windDirection: 999,
      visibility: -500,
      timestamp: Date.now(),
    } as unknown as RealtimeWeather;
    const validation = validateRealtimeAlertData(badData, station);
    if (!validation.valid && station) {
      set({
        alertValidationError: {
          stationId: station.id,
          stationName: station.name,
          errors: validation.errors,
          details: validation.details ?? [],
          timestamp: Date.now(),
        },
      });
      get().addLog('预警校验失败(测试)', station.name, Object.values(validation.errors).join('；'));
    }
  },
}));
