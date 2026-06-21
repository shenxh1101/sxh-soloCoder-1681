import type {
  RealtimeWeather,
  HourlyData,
  HistoryExtreme,
  Forecast3H,
  ForecastSlot,
  User,
  UserRole,
  WeatherStation,
  RadarStation,
  WeatherAlert,
  WorkOrder,
  WeatherBriefing,
  DailyReport,
  OperationLog,
  ApprovalRecord,
} from '@/types';
import { ALERT_THRESHOLDS, ALERT_TYPE_LABELS, ALERT_LEVEL_LABELS } from './constants';

export const genId = (): string =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-6);

export const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const randomFloat = (min: number, max: number, decimals = 1): number =>
  Number((Math.random() * (max - min) + min).toFixed(decimals));

export function random(min: number, max: number, decimals: number = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.round((Math.random() * (max - min) + min) * factor) / factor;
}

export function randomId(): string {
  return genId();
}

export const STATIONS_DATA: WeatherStation[] = [
  { id: 'st001', name: '市中心观测站', district: '东城区', position: [0, 0, 0], color: '#00D4FF' },
  { id: 'st002', name: '西郊气象站', district: '西城区', position: [-8, 0, -5], color: '#7B68EE' },
  { id: 'st003', name: '南郊监测点', district: '南城区', position: [5, 0, 10], color: '#2ED573' },
  { id: 'st004', name: '北岭雷达站', district: '北城区', position: [-6, 0, 8], color: '#FFA502' },
  { id: 'st005', name: '东港口气象站', district: '港口区', position: [10, 0, -3], color: '#FF4757' },
  { id: 'st006', name: '科技园观测点', district: '科技区', position: [3, 0, 6], color: '#FFD93D' },
];

export const RADAR_STATIONS: RadarStation[] = [
  { id: 'rd001', name: '主雷达站', position: [0, 8, 0], rotationSpeed: 0.5 },
  { id: 'rd002', name: '北岭雷达', position: [-6, 6, 8], rotationSpeed: 0.4 },
  { id: 'rd003', name: '东港雷达', position: [10, 5, -3], rotationSpeed: 0.6 },
];

const AVATAR_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];
const OBSERVER_NAMES = ['张伟', '李娜', '王芳', '刘洋'];
const FORECASTER_NAMES = ['陈静', '赵磊', '孙丽', '周杰'];
const DIRECTOR_NAMES = ['吴明', '郑华'];

export function createMockUser(role: UserRole): User {
  return generateUserByRole(role);
}

export function generateUserByRole(role: UserRole): User {
  let name: string;
  if (role === 'observer') {
    name = OBSERVER_NAMES[Math.floor(Math.random() * OBSERVER_NAMES.length)];
  } else if (role === 'forecaster') {
    name = FORECASTER_NAMES[Math.floor(Math.random() * FORECASTER_NAMES.length)];
  } else {
    name = DIRECTOR_NAMES[Math.floor(Math.random() * DIRECTOR_NAMES.length)];
  }
  const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
  return {
    id: genId(),
    name,
    role,
    avatar: color,
    faceId: `face_${genId()}`,
    token: `token_${genId()}${genId()}`,
    loginAt: Date.now(),
  };
}

export function generateRealtimeWeather(stationId: string): RealtimeWeather {
  return randomStationRealtime(stationId);
}

export function randomStationRealtime(stationId: string): RealtimeWeather {
  return {
    stationId,
    timestamp: Date.now(),
    temperature: random(-10, 38, 1),
    humidity: random(30, 95, 0),
    pressure: random(990, 1030, 1),
    windSpeed: random(0, 18, 1),
    windDirection: random(0, 360, 0),
    visibility: random(200, 20000, 0),
  };
}

export function generateHourlyData(stationId: string): HourlyData[] {
  return generateHourly24();
}

export function generateHourly24(): HourlyData[] {
  const result: HourlyData[] = [];
  const now = new Date();
  now.setMinutes(0, 0, 0);
  for (let i = 0; i < 24; i++) {
    const h = new Date(now.getTime() - (23 - i) * 3600000);
    result.push({
      time: `${h.getHours().toString().padStart(2, '0')}:00`,
      temperature: random(-10, 38, 1),
      humidity: random(30, 95, 0),
      pressure: random(990, 1030, 1),
      windSpeed: random(0, 18, 1),
      windDirection: random(0, 360, 0),
      visibility: random(200, 20000, 0),
    });
  }
  return result;
}

export function generateExtremeData(stationId: string): HistoryExtreme[] {
  return generateExtremes();
}

export function generateExtremes(): HistoryExtreme[] {
  const types: HistoryExtreme['type'][] = ['temperature', 'humidity', 'pressure', 'windSpeed', 'visibility'];
  const ranges: Record<string, [number, number]> = {
    temperature: [-10, 38],
    humidity: [30, 95],
    pressure: [990, 1030],
    windSpeed: [0, 18],
    visibility: [200, 20000],
  };
  return types.map((type) => {
    const [min, max] = ranges[type];
    const year = new Date().getFullYear();
    const randomMonth = () => Math.floor(Math.random() * 12) + 1;
    const randomDay = () => Math.floor(Math.random() * 28) + 1;
    return {
      type,
      max: random(max - 5, max, 1),
      maxDate: `${year}-${String(randomMonth()).padStart(2, '0')}-${String(randomDay()).padStart(2, '0')}`,
      min: random(min, min + 5, 1),
      minDate: `${year}-${String(randomMonth()).padStart(2, '0')}-${String(randomDay()).padStart(2, '0')}`,
    };
  });
}

export function generateForecast3H(): Forecast3H {
  const slots: ForecastSlot[] = [];
  const now = Date.now();
  for (let i = 0; i < 12; i++) {
    const ts = now + i * 15 * 60000;
    const d = new Date(ts);
    const hasRain = Math.random() < 0.3;
    slots.push({
      time: `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`,
      temperature: random(15, 35, 1),
      humidity: random(40, 90, 0),
      precipitation: hasRain ? random(0, 20, 1) : 0,
      windSpeed: random(0, 12, 1),
      windDirection: random(0, 360, 0),
      visibility: random(500, 15000, 0),
      cloudCover: random(10, 90, 0),
      rainArea: hasRain
        ? {
            x: random(-30, 30, 1),
            z: random(-30, 30, 1),
            radius: random(5, 20, 1),
          }
        : null,
    });
  }
  return {
    generatedAt: now,
    slots,
    accuracy: random(75, 98, 1),
  };
}

export function checkAndGenerateAlert(data: RealtimeWeather, station: WeatherStation): WeatherAlert | null {
  const isWindAlert = data.windSpeed >= ALERT_THRESHOLDS.WIND_LEVEL_6;
  const isVisAlert = data.visibility <= ALERT_THRESHOLDS.VISIBILITY_LOW;
  if (!isWindAlert && !isVisAlert) return null;
  const type = isWindAlert && isVisAlert ? 'both' : isWindAlert ? 'wind' : 'visibility';
  const level = isWindAlert && isVisAlert ? 'danger' : 'warning';
  const parts: string[] = [];
  if (isWindAlert) parts.push(`风速 ${data.windSpeed.toFixed(1)}m/s 达六级以上`);
  if (isVisAlert) parts.push(`能见度 ${data.visibility}米 低于500米`);
  return {
    id: genId(),
    stationId: station.id,
    type,
    level,
    message: `${station.name}${ALERT_LEVEL_LABELS[level]}：${parts.join('，')}`,
    windSpeed: isWindAlert ? data.windSpeed : undefined,
    visibility: isVisAlert ? data.visibility : undefined,
    triggeredAt: Date.now(),
    areaPosition: station.position,
    areaRadius: level === 'danger' ? 4 : 2.5,
  };
}

export function createWorkOrderFromAlert(alert: WeatherAlert, station: WeatherStation): WorkOrder {
  return {
    id: genId(),
    alertId: alert.id,
    title: `【${ALERT_LEVEL_LABELS[alert.level]}】${ALERT_TYPE_LABELS[alert.type]}预警-${station.name}`,
    description: alert.message,
    status: 'pending_observer',
    currentStep: 1,
    alerts: [alert],
    approvals: [],
    createdAt: Date.now(),
  };
}

export function generateOperationLog(
  user: User | null,
  action: string,
  target: string,
  detail: string,
): OperationLog {
  return {
    id: genId(),
    userId: user?.id ?? 'system',
    userName: user?.name ?? '系统',
    role: user?.role ?? 'observer',
    action,
    target,
    detail,
    ip: '127.0.0.1',
    timestamp: Date.now(),
  };
}

export function generateBriefing(
  stations: WeatherStation[],
  realtimeData: Record<string, RealtimeWeather>,
  activeAlerts: WeatherAlert[],
): WeatherBriefing {
  const stationData = stations.map((s) => {
    const d = realtimeData[s.id] ?? generateRealtimeWeather(s.id);
    return {
      stationId: s.id,
      stationName: s.name,
      temperature: d.temperature,
      humidity: d.humidity,
      windSpeed: d.windSpeed,
      visibility: d.visibility,
    };
  });
  const temps = stationData.map((s) => s.temperature);
  const hums = stationData.map((s) => s.humidity);
  const now = new Date();
  const start = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const fmt = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const summaries: string[] = [];
  summaries.push(`当前全市平均气温 ${(temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1)}°C`);
  summaries.push(`平均湿度 ${(hums.reduce((a, b) => a + b, 0) / hums.length).toFixed(0)}%`);
  if (activeAlerts.length > 0) {
    summaries.push(`当前活跃预警 ${activeAlerts.length} 条，请关注处理`);
  } else {
    summaries.push('全市气象条件良好，无活跃预警');
  }
  return {
    id: genId(),
    generatedAt: Date.now(),
    period: `${fmt(start)}-${fmt(now)}`,
    summary: summaries.join('；'),
    avgTemperature: Number((temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1)),
    avgHumidity: Number((hums.reduce((a, b) => a + b, 0) / hums.length).toFixed(1)),
    avgPressure: 1013.2,
    maxWindSpeed: Math.max(...stationData.map((s) => s.windSpeed)),
    minVisibility: Math.min(...stationData.map((s) => s.visibility)),
    stationData,
    activeAlerts: activeAlerts.length,
  };
}

export function generateDailyReport(
  date: string,
  stations: WeatherStation[],
  hourlyData: Record<string, HourlyData[]>,
  alerts: WeatherAlert[],
  forecast: Forecast3H | null,
): DailyReport {
  return {
    date,
    stations: stations.map((s) => {
      const hd = hourlyData[s.id] ?? [];
      const temps = hd.map((h) => h.temperature);
      const hums = hd.map((h) => h.humidity);
      const winds = hd.map((h) => h.windSpeed);
      const viss = hd.map((h) => h.visibility);
      return {
        stationId: s.id,
        stationName: s.name,
        maxTemp: temps.length ? Math.max(...temps) : 0,
        minTemp: temps.length ? Math.min(...temps) : 0,
        maxHumidity: hums.length ? Math.max(...hums) : 0,
        minHumidity: hums.length ? Math.min(...hums) : 0,
        maxWind: winds.length ? Math.max(...winds) : 0,
        minVisibility: viss.length ? Math.min(...viss) : 0,
      };
    }),
    alertCount: alerts.length,
    alertDetails: alerts.map((a) => {
      const s = stations.find((st) => st.id === a.stationId);
      const t = new Date(a.triggeredAt);
      return {
        time: `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`,
        station: s?.name ?? a.stationId,
        type: ALERT_TYPE_LABELS[a.type],
        level: ALERT_LEVEL_LABELS[a.level],
      };
    }),
    forecastAccuracy: forecast?.accuracy ?? 85,
  };
}

export type { ApprovalRecord };
