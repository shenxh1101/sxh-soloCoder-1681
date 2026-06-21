import type { UserRole, WorkOrderStatus } from '@/types';

export const ALERT_THRESHOLDS = {
  WIND_LEVEL_6: 10.8,
  VISIBILITY_LOW: 500,
} as const;

export const APPROVAL_FLOW: Record<UserRole, { next: WorkOrderStatus; step: number }> = {
  observer: { next: 'pending_forecaster', step: 1 },
  forecaster: { next: 'pending_director', step: 2 },
  director: { next: 'approved', step: 3 },
};

export const WORK_ORDER_STEP_LABELS: Record<number, string> = {
  1: '观测员审核',
  2: '预报员审核',
  3: '局长审批',
};

export const ALERT_LEVEL_LABELS: Record<string, string> = {
  normal: '正常',
  warning: '预警',
  danger: '危险',
};

export const ALERT_TYPE_LABELS: Record<string, string> = {
  wind: '大风',
  visibility: '低能见度',
  both: '大风+低能见度',
};

export const WORK_ORDER_STATUS_LABELS: Record<WorkOrderStatus, string> = {
  pending_observer: '待观测员审核',
  pending_forecaster: '待预报员审核',
  pending_director: '待局长审批',
  approved: '已通过',
  rejected: '已退回',
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  observer: '观测员',
  forecaster: '预报员',
  director: '局长',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  observer: '观测员',
  forecaster: '预报员',
  director: '局长',
};

export const STORAGE_KEYS = {
  USER: 'weather_user',
  TOKEN: 'weather_token',
  LOGS: 'weather_logs',
  BRIEFINGS: 'weather_briefings',
  WORK_ORDERS: 'weather_work_orders',
  ALERTS: 'weather_alerts',
} as const;

export const REFRESH_INTERVALS = {
  REALTIME: 5000,
  BRIEFING: 15 * 60 * 1000,
  FORECAST: 30 * 60 * 1000,
} as const;

export const WEATHER_TYPES: Record<string, { label: string; unit: string; color: string }> = {
  temperature: { label: '温度', unit: '°C', color: '#FF6B6B' },
  humidity: { label: '湿度', unit: '%', color: '#4ECDC4' },
  pressure: { label: '气压', unit: 'hPa', color: '#B197FC' },
  windSpeed: { label: '风速', unit: 'm/s', color: '#00D4FF' },
  windDirection: { label: '风向', unit: '°', color: '#00D4FF' },
  visibility: { label: '能见度', unit: 'm', color: '#ADB5BD' },
};

export const CHART_COLORS: Record<string, string> = {
  temperature: '#FF6B6B',
  humidity: '#4ECDC4',
  pressure: '#B197FC',
  windSpeed: '#00D4FF',
  visibility: '#ADB5BD',
  precipitation: '#4ECDC4',
};
